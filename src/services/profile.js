const config = require('../config/index.js');
const User = require('../models/user.js')
const Profile = require('../models/profile.js');
const upload  = require("../app.js");

// can we assume that profile coming in is correct?
exports.createProfile = (req, res) => {
    // console.log('here');
    // upload.single('file');
    // console.log("File was uploaded successfully!");
    Profile.findOne({ user_id: req.id })
           .exec((err, profile) => {
               if (err) {
                   res.status(500).send({ message: err });
                   return;
               } else if (profile) {
                   res.status(400).send({message: "Profile already exists"});
                   return;
               } else {
                //    console.log(req.resume_id);
                   const profile = new Profile({
                       user_id: req.id,
                       first_name: req.body.first_name,
                       last_name: req.body.last_name,
                       education: {
                           campus: req.body.education.campus,
                           year: req.body.education.year,
                           major: req.body.education.major },
                       bio: req.body.description,
                       skills: req.body.skills,
                       interests: req.body.interests,
                       created_at: new Date(Date.now()),
                       updated_at: new Date(Date.now()),
                   });
                   profile.save((err1, profile) => {
                       if (err1) {
                           res.status(500).send({ message: err1 });
                           return;
                       }
                       res.json({ message: "Profile was successfully made!",
                               profile_id: profile._id,
                               user: profile.fullName});
                   });
               };
       });
}

exports.getProfile = (req, res) => {
    Profile.findById(req.params.profile_id)
        .exec((err,profile) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            } else if (!profile) {
                res.status(400).send({message: "Profile does not exist!"});
                return;
            } else {
                res.json({profile})
            }
        })
}

exports.getUserProfile = (req, res) => {
    Profile.find({user_id: req.params.user_id})
        .exec((err,profile) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            } else if (!profile) {
                res.status(400).send({message: "Profile does not exist!"});
                return;
            } else {
                res.json({profile})
            }
        })
}

exports.getAllProfiles = (req, res) => {
    Profile.find({ })
        .exec((err,profiles) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            res.json({ profiles })
        })
}

exports.updateProfile = async (req, res) => {
    try {
        let profile = await Profile.findById(req.params.profile_id)
        if(!profile){
            res.status(400).send({message: "Profile does not exist!"});
            return;
        }
        if (profile.user_id != req.id) {
            res.status(400).send({ message: "Profile is not owned by this user!"});
            return;
        }
        else {
            profile = await Profile.findOneAndUpdate({_id: req.params.profile_id}, req.body, {
                new: true,
                runValidators: true
            })
            res.json({profile})
        }
    }catch(err) {
        res.status(500).send({ message: err });
        return;
    }
}

exports.deleteProfile = async(req, res)=> {
    try {
        let profile = await Profile.findById(req.params.profile_id)
        if (profile.user_id != req.id) {
            res.status(400).send({ message: "Profile is not owned by this user!"});
            return;
        }
        await Profile.deleteOne({_id:req.params.profile_id})
        res.send({ message: "User profile was deleted successfully!" });
        
    }catch(err) {
        res.status(500).send({ message: err });
        return;
    }
}

exports.searchProfiles = async(req, res)=> {
    try {
        query = {first_name: {$regex: new RegExp(req.body.search_term, "i")}}
        if(req.body.campus){query["education.campus"] = req.body.campus}
        if(req.body.year){query["education.year"] = req.body.year}
        if(req.body.major){query["education.major"] = req.body.major}
        if(req.body.skills){query["education.skills"] = req.body.skills}
        if(req.body.interests){query["education.interests"] = req.body.interests}
        Profile.find(query)
           .exec((err, profiles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.json({ profiles });
        });
    }catch(err) {
        res.status(500).send({ message: err });
        return;
    }
}