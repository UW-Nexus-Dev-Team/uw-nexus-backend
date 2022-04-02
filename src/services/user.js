const config = require('../config/index.js');
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
            return
        }

        var token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        res.cookie("accessToken", token, {
            maxAge: 3.6e+6, // 24 hours
            httpOnly: true,
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
    return res.send({success: true})
}

exports.createUser = (req, res) => {
    const user = new User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        first_name: req.body.first_name,
        last_name: req.body.last_name
    });

    // save user
    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err.message });
            return;
        }
        res.send({ message: "User was registered successfully!" });
    })
};

// The rest aren't necessary as of now, but may be turned into endpoints later on (03/31/22)
exports.getUser = (req, res) => {
    User.findOne({user_id: req.params.user_id}).select("-password")
        .exec((err,user) => {
            if (err) {
                res.status(500).send({ message: err.message });
                return;
            } else if (!user) {
                res.status(400).send({message: "User does not exist!"});
                return;
            } else {
                res.json({User})
            }
        })
}

exports.updateUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id)
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
            })
            res.json({user})
        }
    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
}

exports.deleteUser = async(req, res)=> {
    try {
        if (user.id != req.id) {
            res.status(400).send({ message: "User is not owned by this user!"});
            return;
        }
        await User.deleteOne({_id:req.params.id})
        await Profile.deleteOne({user_id:req.params.id})
        res.send({ message: "User was deleted successfully!" });
        
    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
}