const { Router, Request, Response, NextFunction } = require('express')
const passport = require('passport');

// import jwt from 'jsonwebtoken';
const { verifyInfo, authJwt } = require("../middlewares");
const UserService = require('../services/user.js');
const { JWT_SECRET, FE_ADDR, DOMAIN } = require('../config/index.js');


/**
 * @apiDefine AuthGroup Auth API
 *
 * Handles all authentication related features.
 */

/**
 * @apiDefine JwtHeader JwtHeader    Header params to include to pass all JWT-protected routes
 *
 * @apiHeader {String}  cookie       Includes jwt token in `jwt` field, e.g. `jwt={token}`
 * @apiHeader {Boolean} credentials  Must be set to `true`
 */

 module.exports = function(app) {
   app.use(function(req, res, next) {
     res.header(
       "Access-Control-Allow-Headers",
       "x-access-token, Origin, Content-Type, Accept"
     );
     next();
   });

   /**
    * @api {post} /auth/createUser Create a new User
    * @apiGroup AuthGroup
    * @apiName CreateUser
    *
    * @apiParam {String} username Username
    * @apiParam {String} password Password
    * @apiParam {String} [userType] Optional user type, defaults to 'Student'
    */
   app.post(
     "/api/auth/createUser",
     [
       verifyInfo.checkDuplicateEmail
     ],
     UserService.createUser
   );

   /**
    * @api {post} /auth/signIn Login with username & password
    * @apiGroup AuthGroup
    * @apiName LogInLocal
    *
    * @apiParam {String} username Username
    * @apiParam {String} password Password
    */
    app.post("/api/auth/signIn", UserService.signIn);

    /**
     * @api {get} /auth/password-reset Request password reset token by email
     * @apiDescription An email with a password reset link will be sent, if a user is registered with the email.
     * @apiGroup AuthGroup
     * @apiName RequestPasswordReset
     *
     * @apiParam {String} email Email, as a query param (e.g. `/auth/password-reset?email=your@email.com`)
     */
    // app.get('/api/auth/password-reset', UserService.requestPasswordReset);

    /**
     * @api {patch} /auth/password-reset Reset password
     * @apiGroup AuthGroup
     * @apiName ResetPassword
     *
     * @apiHeader {String}  Authorization  `Bearer {jwt}`
     */
    app.patch('/api/auth/password-reset', UserService.resetPassword);

 };


// const generateToken = async (req: Request, res: Response): Promise<void> => {
//   const { username, userType, provider } = req.user as User;
//   const token = jwt.sign({ username, userType }, JWT_SECRET, { expiresIn: '7d' });
//   const prodSettings = { httpOnly: true, secure: true, sameSite: 'None', domain: DOMAIN };
//   res.cookie('jwt', token, process.env.NODE_ENV === 'production' ? prodSettings : {});
//
//   if (provider) {
//     res.redirect(FE_ADDR);
//   } else {
//     res.json({ authenticated: true });
//   }
// };

  /**
   * @api {get} /auth/student/facebook Login with Facebook
   * @apiGroup AuthGroup
   * @apiName LogInFacebook
   */
  // router.get('/student/facebook', passport.authenticate('facebook-student', authOpts));
  // router.get('/student/facebook/callback', passport.authenticate('facebook-student', authOpts), generateToken);
