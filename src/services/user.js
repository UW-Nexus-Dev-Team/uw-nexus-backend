const config = require("../config/index.js");
const User = require("../models/user.js");
const PassReset = require("../models/password-reset.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

exports.signIn = (req, res) => {
    User.findOne({ email: req.body.email })
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err.message });
                return;
            }
            if (!user) {
                res.status(404).send({ message: "User not found!" });
                return;
            }
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
                return;
            }

            var token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
                expiresIn: 86400 // 24 hours
            });

            res.cookie("accessToken", token, {
                maxAge: 86400 * 1000, // 24 hours
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production",
                httpOnly: true
            });
            res.status(200).send({
                id: user._id,
                email: user.email,
                accessToken: token
            });
        });
};

exports.signOut = (req, res) => {
    res.cookie("accessToken", "", {
        maxAge: 0,
        httpOnly:true,
    });
    return res.send({success: true});
};

exports.createUser = (req, res) => {
    const user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        first_name: req.body.first_name,
        last_name: req.body.last_name
    });

    // save user
    user.save((err) => {
        if (err) {
            res.status(500).send({ message: err.message });
            return;
        }
        res.send({ message: "User was registered successfully!" });
    })

    // send welcome email
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const mail = new Mail();
    mail.setFrom('uw.nexus@gmail.com');
    mail.setSubject('Welcome to Nexus!');
    // TODO add content
    mail.addTextContent();
    mail.addHtmlContent();

    const personalization = new MailPersonalization();
    personalization.setTo(req.body.email);
    peresonalization.addSubstitution();
    mail.addPersonalization(personalization);

    try {
        sgMail.send(mail)
    } catch (e) {
        // ignored for now; it's ok if mail sending fails.
    }

    return res.status(200).send();
};

// The rest aren't necessary as of now, but may be turned into endpoints later on (03/31/22)
exports.getUser = async(req, res) => {
    try {
        let user = await User.findById(req.params.user_id);
        if(!user){
            res.status(400).send({message: "User does not exist!"});
            return;
        }
        if (user.id != req.id) {
            res.status(400).send({ message: "User is not owned by this user!"});
            return;
        }
        else {
            res.status(200).json({email: user.email});
        }
    } catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
};

exports.updateUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if(!user){
            res.status(400).send({message: "User does not exist!"});
            return;
        }
        if (user.id != req.id) {
            res.status(400).send({ message: "User is not owned by this user!"});
            return;
        }
        else {
            user = await User.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {
                new: true,
                runValidators: true
            });
            res.json({user});
        }
    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
};

exports.deleteUser = async(req, res)=> {
    try {
        if (user.id != req.id) {
            res.status(400).send({ message: "User is not owned by this user!"});
            return;
        }
        await User.deleteOne({_id:req.params.id});
        await Profile.deleteOne({user_id:req.params.id});
        res.send({ message: "User was deleted successfully!" });

    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
};

exports.resetPassword = async(req, res) => {

    try {
        // flow for actually resetting password
        if (req.query.token) {
            const token = req.query.token;

            // find matching hash in db

            // the below is not allowed on free tiers of mongodb, but if this app someday moves to
            // a paid tier, we could use this shorter solution
            // let passReset = await PassReset.findOne().$where(function() {
            //     bcrypt.compareSync(token, this.token);
            // }).exec();

            let passReset;
            const allResets = await PassReset.find({}).exec();
            for (const pr of allResets) {
                if (bcrypt.compareSync(token, pr.token)) {
                    passReset = pr;
                }
            }

            if (!passReset) {
                return res.status(400).send({ message: "Invalid reset token!" });
            }

            // check if token is still valid
            let currentTime = new Date();
            if (currentTime > passReset.token_expiry) {
                return res.status(400).send({ message: "Expired reset token!" });
            }

            // delete all tokens corresponding to this user
            const userId = passReset.userId;
            await PassReset.deleteMany({ userId: userId });

            // save new password
            const new_pass = req.body.new_password;
            if (!new_pass) return res.status(400).send({ message: "No new password specified!" });

            const hash_new_pass = bcrypt.hashSync(new_pass, 10);

            await User.findByIdAndUpdate(userId, { password: hash_new_pass }, { useFindAndModify: false }, (err, user) => {
                if (err) return res.status(500).send({ message: err.message });
                if (!user) return res.status(400).send({ message: "Invalid reset token!" });
            });
            return res.status(200).send();
        }

        // we don't have a token yet: generate one and send the link in an email
        const user_email = req.body.email;
        if (!user_email) return res.status(400).send({ message: "No email specified!" });
        let user = await User.findOne({ email: user_email }).exec();

        // this might be more appropriate as a 404, but that leads to the security question
        // because anyone can see this in the dev tools network panel
        if (!user) {
            return res.status(400).send();
        }

        // generate token and create new PasswordReset instance in db
        const _id = user.id;
        const token = crypto.randomBytes(64).toString("hex");
        let expiry_date = new Date();
        expiry_date.setHours(expiry_date.getHours() + 24);

        let reset = new PassReset({
            userId: _id,
            email: user_email,
            token: bcrypt.hashSync(token, 10),
            token_expiry: expiry_date
        });

        await reset.save();

        // send email
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: user_email,
            from: "uw.nexus@gmail.com",
            template_id: `${process.env.SENDGRID_PASS_RESET_TEMP_ID}`,
            dynamic_template_data: {
                to_name: user.first_name,
                message: `https://nexusatuw.com/resetPassword?token=${token}`
            }
        };

        sgMail
            .send(msg)
            .then(() => {
                return res.status(200).send({success: true});
            })
            .catch((error) => {
                console.error(error);
                return res.status(500).send({success: false});
            });

    }
    catch(err) {
        return res.status(500).send({ message: err.message });
    }
};