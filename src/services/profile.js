const config = require('../config/index.js');
const User = require('../models/user.js')
const Profile = require('../models/profile.js');
const upload  = require("../app.js");
const mongoose = require('mongoose');

// SET UP GRIDFS CONNECTION
const url = config.MONGODB_URI;
const connect = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });
let gfs;
connect.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: 'uploads',
    });
});

const deleteFile = (id) => {
    if (!id || id === 'undefined') return res.status(400).send('no file id');
    const _id = new mongoose.Types.ObjectId(id);
    gfs.delete(_id, (err) => {
      if (err) return res.status(500).send('file deletion error');
    });
};

exports.createProfile = (req, res) => {
    Profile.findOne({ user_id: req.id })
           .exec((err, profile) => {
               if (err) {
                   res.status(500).send({ message: err });
                   return;
               } else if (profile) {
                   res.status(400).send({message: "Profile already exists"});
                   return;
               } else {
                   const education = req.body.education ? JSON.parse(req.body.education) : undefined
                   const interestList = req.body.interests ? JSON.parse(req.body.interests) : undefined
                   const skillList = req.body.skills ? JSON.parse(req.body.skills) : undefined
                   let projectIdArray = req.body.favorite_projects ? JSON.parse(req.body.favorite_projects).map(cur => new mongoose.Types.ObjectId(cur)) : undefined
                   const profile = new Profile({
                       user_id: req.id,
                       first_name: req.body.first_name,
                       last_name: req.body.last_name,
                       education: {
                           campus: education.campus,
                           year: education.year,
                           major: education.major },
                       bio: req.body.description,
                       skills: skillList,
                       interests: interestList,
                       favorite_projects: projectIdArray,
                       created_at: new Date(Date.now()),
                       updated_at: new Date(Date.now()),
                       resume: (req.file ? req.file.id : undefined),
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
            res.json(profiles)
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
            let updated = req.body
            if (req.file) {
                if (profile.resume) {
                    deleteFile(new mongoose.Types.ObjectId(profile.resume))
                }
                updated.resume = req.file.id
            }
            if (req.body.favorite_projects) {
                let projectArray = JSON.parse(req.body.favorite_projects)
                console.log(projectArray.length)
                if (projectArray.length > 20) {
                    throw new Error("User has a max of 20 favorited projects.")
                }
                let projectIdArray = projectArray.map(cur => new mongoose.Types.ObjectId(cur))
                updated.favorite_projects = projectIdArray
            }
            if (req.body.education) updated.education = JSON.parse(req.body.education);

            if (req.body.interests) updated.interests = JSON.parse(req.body.interests);

            if (req.body.skills) updated.skills = JSON.parse(req.body.skills);
            
            profile = await Profile.findOneAndUpdate({_id: req.params.profile_id}, updated, {
                new: true,
                runValidators: true
            })
            res.json({profile})
        }
    }catch(err) {
        res.status(500).send({ message: `${err}` });
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
        if (profile.resume) {
            deleteFile(new mongoose.Types.ObjectId(profile.resume))
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
        query = {
            "$expr": {
                "$regexMatch": {
                    "input": { "$concat": ["$first_name", " ", "$last_name"] },
                    "regex": req.body.search_term,
                    "options": "i"
                }
            }
        }
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
          res.json(profiles);
        });
    }catch(err) {
        res.status(500).send({ message: err });
        return;
    }
}

exports.deleteProfileResume = async (req, res) => {
    try {
        let profile = await Profile.find({user_id: req.id})
        if(!profile){
            res.status(400).send({message: "Profile does not exist!"});
            return;
        }
        else {
            profile = profile[0]
            if (profile.resume) {
                deleteFile(new mongoose.Types.ObjectId(profile.resume))
            }
            profile.resume = undefined
            await profile.save()
            res.json({profile})
        }
    }catch(err) {
        res.status(500).send({ message: err });
        return;
    }
}

exports.getProfileResume = (req,res) => {
    const id = new mongoose.Types.ObjectId(req.params.file_id)
    gfs.find({_id: id}).toArray((err, files) => {
        if (!files[0] || files.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No files available',
            });
        }
        if (files[0].contentType === 'application/pdf') {
            // render image to browser
            // gfs.openDownloadStream(id).pipe(res);
            // send a base64 pdf for React to render
            // https://stackoverflow.com/questions/47530471/gridfs-how-to-display-the-result-of-readstream-piperes-in-an-img-tag
            // https://stackoverflow.com/questions/49098850/loading-pdf-from-base64-data-using-react-pdf-js
            gfs.openDownloadStream(id).on('data', (chunk)=> {
                res.send({ pdf: chunk.toString('base64') });
            })
        } else {
            res.status(404).json({
                err: 'Not a pdf',
            });
        }
    });
}