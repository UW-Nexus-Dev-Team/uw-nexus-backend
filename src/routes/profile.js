const ProfileService = require('../services/profile.js');
const multer = require('multer');


/**
 * @apiDefine Profile API
 *
 * Handles all profile related data
 */

/**
 * @apiDefine JwtHeader JwtHeader    Header params to include to pass all JWT-protected routes
 *
 * @apiHeader {String}  cookie       Includes jwt token in `jwt` field, e.g. `jwt={token}`
 * @apiHeader {Boolean} credentials  Must be set to `true`
 */
module.exports = function(app, upload) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // upload middleware
  const uploadFile = (req, res, next) => {
    const uploaded = upload.single('file');
    uploaded(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.log(err)
        return res.status(400).send('File too large');
      } else if (err) {
        if (err === 'filetype') return res.status(400).send('PDF or DocX files only');
        return res.sendStatus(500);
      }
      next();
    });
  };

app.post('/api/profile/createProfile',
    uploadFile,
    ProfileService.createProfile
  );

app.get("/api/profile/allProfiles", 
  ProfileService.getAllProfiles
  );

app.get(
    "/api/profile/search",
    ProfileService.searchProfiles
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
    uploadFile,
    ProfileService.updateProfile
  );

app.delete(
    "/api/profile/delete/:profile_id",
    ProfileService.deleteProfile
  );

app.post(
  "/api/profile/resume/delete",
  ProfileService.deleteProfileResume
);

app.get(
  "/api/profile/resume/:file_id",
  ProfileService.getProfileResume
);

};
