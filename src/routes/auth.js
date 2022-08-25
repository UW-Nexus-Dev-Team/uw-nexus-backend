const { Router, Request, Response, NextFunction } = require('express')
const passport = require('passport');

// import jwt from 'jsonwebtoken';
const { verifyInfo } = require("../middlewares");
const UserService = require('../services/user.js');


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
    * @apiEndpoint createUser
    * @Request
    * { 
        "email": {String},
        "password": {String},
        "first_name": {String},
        "last_name": {String}
      }
    * @Result
      {
        "message": {String}
      }
    */
   app.post(
     "/api/auth/createUser",
     [
       verifyInfo.checkDuplicateEmail
     ],
     UserService.createUser
   );

    /**
    * @apiEndpoint signIn
    * @Request
    * {
        "email": {String},
        "password": {String}
      }
    * @Result
      {
        "id": {String},
        "email": {String},
        "accessToken": {String}
      }
    */
    app.post("/api/auth/signIn", UserService.signIn);

    app.get("/api/auth/getUser/:user_id", UserService.getUser);

    /**
    * @apiEndpoint signOut
    * @Result
      {
        "success": {Boolean}
      }
    */
    app.delete("/api/auth/signOut", UserService.signOut);

 };