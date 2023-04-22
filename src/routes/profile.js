const ProfileService = require("../services/profile.js");
const multer = require("multer");

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
module.exports = function(app, docUpload, imgUpload) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // upload middleware
    const uploadImg = (req, res, next) => {
        uploadFile(req, res, next, imgUpload);
    };

    const uploadResume = (req, res, next) => {
        uploadFile(req, res, next, docUpload);
    };

    const uploadFile = (req, res, next, uploader) => {
        const uploaded = uploader.single("file");
        uploaded(req, res, function (err) {

            if (err instanceof multer.MulterError) {
                return res.status(400).send("File too large");

            } else if (err) {
                if (err === "filetype") return res.status(400).send("Invalid file type");
                console.error(err);
                return res.sendStatus(500);
            }
            next();
        });
    };

    app.post("/api/profile/createProfile",
        uploadResume,
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
        uploadResume,
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

    app.get(
        "/api/profile/photo/:user_id",
        ProfileService.getProfilePicture
    );

    app.post(
        "/api/profile/photo/:user_id",
        uploadImg,
        ProfileService.updateProfilePicture
    );

    app.delete(
        "/api/profile/photo/:user_id",
        ProfileService.deleteProfilePicture
    );

};
