const config = require('../config/index.js');
const Profile = require('../models/profile.js');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

// SET UP GRIDFS CONNECTION
const url = config.MONGODB_URI;
const connect = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });
let gfs;
connect.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
    bucketName: 'uploads',
    });
});

// AWS CONFIG
AWS.config.update({region: 'us-west-2'});
s3 = new AWS.S3({apiVersion: '2006-03-01'});

exports.createProfile = (req, res) => {
    if (!req.id) {
        res.status(401).send({message: "User is not signed in."});
        return;
    }
    Profile.findOne({ user_id: req.id })
           .exec((err, profile) => {
               if (err) {
                   res.status(500).send({ message: err.message });
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
                       email: req.body.email,
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
                       resume_file_id: (req.file ? req.file.id : undefined),
                       private: (req.body.private ? req.body.private : true)
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
    Profile.findById(req.params.profile_id).populate('favorite_projects', 'title')
        .exec((err,profile) => {
            if (err) {
                res.status(500).send({ message: err.message });
                return;
            } else if (!profile) {
                res.status(400).send({message: "Profile does not exist!"});
                return;
            } else {
                if (profile.private && profile.user_id != req.id) {
                    res.status(401).send({message: "User does not have access to view Profile."});
                    return;
                }
                res.json(profile)
            }
        })
}

exports.getUserProfile = (req, res) => {
    Profile.findOne({user_id: req.params.user_id}).populate('favorite_projects', 'title')
        .exec((err,profile) => {
            if (err) {
                res.status(500).send({ message: err.message });
                return;
            } else if (!profile) {
                res.status(400).send({message: "Profile does not exist!"});
                return;
            } else {
                if (profile.private && profile.user_id != req.id) {
                    res.status(401).send({message: "User does not have access to view Profile."});
                    return;
                }
                res.json(profile)
            }
        })
}

exports.getAllProfiles = (req, res) => {
    Profile.find({ }).populate('favorite_projects', 'title')
        .exec((err,profiles) => {
            if (err) {
                res.status(500).send({ message: err.message });
                return;
            }
            profiles = profiles.filter(profile => !profile.private)
            res.json(profiles)
        })
}

exports.getProfilePicture = async (req, res) => {
    if (!req.id) {
        return res.status(401).send({message: "User is not signed in."});
    }

    const getParams = {
        Bucket: 'nexusatuw',
        Key: `ProfilePictures/${req.id}`
    }

    s3.getObject(getParams, (err, img) => {
        if (err) {
            if (err.code == 'NoSuchKey') {
                return res.status(404).send({ message: 'Profile pic not found for user ' + req.id });
            }
            return res.status(400).send({ message: err.message });
        }

        return res.status(200).header('Content-Type', img.ContentType).send(img.Body);
    });
}


exports.updateProfilePicture = async (req, res) => {
    if (!req.id || req.id !== req.params.user_id) {
        return res.status(401).send({ message: "User is not signed in." });
    }

    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded." })
    }

    const params = {
        Body: req.file.buffer,
        Bucket: 'nexusatuw',
        Key: `ProfilePictures/${req.id}`,
        ContentType: req.file.mimetype
    }

    s3.putObject(params, (err, data) => {
        if (err) {
            res.status(400).send({ message: err.message });
        }

        return res.status(200).send();
    });
}

exports.updateProfile = async (req, res) => {
    if (!req.id) {
        res.status(401).send({message: "User is not signed in."});
        return;
    }
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
                if (profile.resume_file_id) {
                    deleteFile(new mongoose.Types.ObjectId(profile.resume_file_id))
                }
                updated.resume_file_id = req.file.id
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
    if (!req.id) {
        res.status(401).send({message: "User is not signed in."});
        return;
    }
    try {
        let profile = await Profile.findById(req.params.profile_id)
        if (profile.user_id != req.id) {
            res.status(400).send({ message: "Profile is not owned by this user!"});
            return;
        }
        if (profile.resume_file_id) {
            deleteFile(new mongoose.Types.ObjectId(profile.resume_file_id))
        }
        await Profile.deleteOne({_id:req.params.profile_id})
        res.send({ message: "User profile was deleted successfully!" });
        
    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
}

exports.searchProfiles = async(req, res)=> {
    try {
        query = {
            "$expr": {
                "$regexMatch": {
                    "input": { "$concat": ["$first_name", " ", "$last_name"] },
                    "regex": req.query.search_term,
                    "options": "i"
                }
            }
        }
        if(req.query.campus){query["education.campus"] = req.query.campus}
        if(req.query.year){query["education.year"] = req.query.year}
        if(req.query.major){query["education.major"] = req.query.major}
        if(req.query.skills){query["education.skills"] = req.query.skills}
        if(req.query.interests){query["education.interests"] = req.query.interests}
        Profile.find(query).populate('favorite_projects', 'title')
           .exec((err, profiles) => {
          if (err) {
            res.status(500).send({ message: err.message });
            return;
          }
          profiles = profiles.filter(profile => !profile.private)
          res.json(profiles);
        });
    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
}

exports.deleteProfileResume = async (req, res) => {
    if (!req.id) {
        res.status(401).send({message: "User is not signed in."});
        return;
    }
    try {
        let profile = await Profile.find({user_id: req.id})
        if(!profile){
            res.status(400).send({message: "Profile does not exist!"});
            return;
        }
        else {
            profile = profile[0]
            if (profile.resume_file_id) {
                deleteFile(new mongoose.Types.ObjectId(profile.resume_file_id))
            }
            profile.resume_file_id = undefined
            await profile.save()
            res.json({profile})
        }
    }catch(err) {
        res.status(500).send({ message: err.message });
        return;
    }
}

exports.getProfileResume = (req,res) => {
    console.log("getting profile resume!");
    const id = new mongoose.Types.ObjectId(req.params.file_id)
    gfs.find({_id: id}).toArray((err, files) => {
        if (!files[0] || files.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No files available',
            });
        }
        if (files[0].contentType === 'application/pdf') {
            console.log(files[0]);
            // render image to browser
            // gfs.openDownloadStream(id).pipe(res);
            // send a base64 pdf for React to render
            // https://stackoverflow.com/questions/47530471/gridfs-how-to-display-the-result-of-readstream-piperes-in-an-img-tag
            // https://stackoverflow.com/questions/49098850/loading-pdf-from-base64-data-using-react-pdf-js
            let base64res = "";
            const downloadStream = gfs.openDownloadStream(id).on('data', (chunk)=> {
                // res.write(chunk.toString('base64'))
                base64res += chunk.toString('base64')
            }).on('end', () => {
                res.status(200).send({pdf: base64res})
            })
        } else {
            return res.status(404).json({
                err: 'Not a pdf',
            });
        }
    });
}

// HELPER FUNCTIONS
const deleteFile = (id) => {
    if (!id || id === 'undefined') return res.status(400).send('no file id');
    const _id = new mongoose.Types.ObjectId(id);
    gfs.delete(_id, (err) => {
      if (err) return res.status(500).send('file deletion error');
    });
};