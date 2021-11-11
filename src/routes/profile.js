const { Router, Request, Response, NextFunction } = require('express')
// const passport = require('passport');
// const { verifyInfo, authJwt } = require("../middlewares");
const ProfileService = require('../services/profile.js');
const { verifyInfo, authJwt } = require("../middlewares");
const Profile = require('../models/profile.js');
const { JWT_SECRET, FE_ADDR, DOMAIN } = require('../config/index.js');

module.exports = function(app, upload) {
      app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
      });

      /**
     * @api {post} api/project/createProfile  Create a new student Profile
     * @apiGroup NexusBuilders                   with optional resume file
     * @apiName CreateProfile
     *
     * @apiUse JwtHeader
     *
     * @apiParam
     *
     * @apiSuccess {json}  message: "Profile was successfully made!",
                                            profile_id: profile._id,
                                            user: profile.fullName
     **/
    // Figure out how upload works
    //  app.post('/api/profile/createProfile/:user_id',
    //         upload.single('file'), (req, res) => {
    //             // console.log("File was uploaded successfully!");
    //             Profile.findOne({ user_id: req.params.user_id })
    //                     .exec((err, profile) => {
    //             if (err) {
    //                 res.status(500).send({ message: err });
    //                 return;
    //             } else if (profile) {
    //                 res.status(400).send({message: "Profile already exists"});
    //                 return;
    //             } else {
    //                 const profile = new Profile({
    //                     user_id: req.params.user_id,
    //                     fullName: req.body.fullName,
    //                     education: {
    //                         campus: req.body.education.campus,
    //                         year: req.body.education.year,
    //                         major: req.body.education.major },
    //                     bio: req.body.description,
    //                     skills: req.body.skills,
    //                     interest: req.body.interests,
    //                     created_at: new Date(Date.now()),
    //                     updated_at: new Date(Date.now()),
    //                 });

    //                 profile.save((err1, profile) => {
    //                     if (err1) {
    //                         res.status(500).send({ message: err1 });
    //                         return;
    //                     }
    //                     if (req.file) {
    //             // Mongoose sends an `updateOne({ _id: doc._id }, { $set: { name: 'foo' } })`
    //             // to MongoDB.
    //                         profile.resume_id = req.file.id;
    //                         profile.save().then(savedProf => {
    //                           // savedDoc === doc; // true
    //                           res.json({ message: "Profile was successfully made!",
    //                                   profile_id: savedProf._id,
    //                                   user: savedProf.fullName,
    //                                   resume: savedProf.resume_id});
    //                         });
    //                     } else {
    //                         res.json({ message: "Profile was successfully made!",
    //                                 profile_id: profile._id,
    //                                 user: profile.fullName});
    //                     }
    //                 });
    //         }});
    // });

    app.post('/api/profile/createProfile',
        [
          authJwt
        ],
        ProfileService.createProfile
      );
    
    app.get("/api/profile/allProfiles", 
      ProfileService.getAllProfiles
      );
    
    app.get(
        "/api/profile/user/:user_id",
        ProfileService.getUserProfile
      );

    app.get(
        "/api/profile/:profile_id",
        ProfileService.getProfile
      );
    
    app.post(
        "/api/profile/update/:profile_id",
        [
          authJwt
        ],
        ProfileService.updateProfile
      );
    
    app.post(
        "/api/profile/delete/:profile_id",
        [
          authJwt
        ],
        ProfileService.deleteProfile
      );

    app.post(
        "/api/profile/search",
        ProfileService.searchProfiles
      );

    // app.post('/api/resume/upload', upload.single('file'), (req, res) => {
    //       res.json({ message: "File was uploaded successfully!",
    //                  file: req.file});
    // });
    //      [
    //        verifyInfo.checkProfileExists
    //      ],
    //      ProfileService.createProfile
    // );

};
