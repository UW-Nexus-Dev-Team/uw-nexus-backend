const EmailService = require("../services/email.js");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
 

    /* sends an email via SendGrid to the project owner,
        including the applicant's information
    */
    app.post(
        "/api/emailServices/submitApplication",
        EmailService.submitApplication
    );

    /* sends an email via SendGrid to the email of the
       caller, including a password reset link
    */
    app.post(
        "/api/emailServices/resetPassword",
        EmailService.resetPassword
    );

 
};