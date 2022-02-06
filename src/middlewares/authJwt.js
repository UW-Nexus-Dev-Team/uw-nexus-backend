const jwt = require("jsonwebtoken");
const config = require("../config/index.js");
const User = require('../models/user.js')

authJwt = (req,res,next) => {
    const { accessToken } = req.cookies;
    if (accessToken) {
        jwt.verify(accessToken, config.JWT_SECRET, (err, user) => {
            if (err) {
                res.status(401).send({ message: "Unauthorized!" });
                return;
            }
            req.id = user.id;
            next();
        });
    } else {
        res.status(403).send({ message: "No token provided!" });
        return;
    }
}

// isAdmin = (req, res, next) => {
//   User.findById(req.userId).exec((err, user) => {
//     if (err) {
//       res.status(500).send({ message: err });
//       return;
//     }
//
//     Role.find(
//       {
//         _id: { $in: user.roles }
//       },
//       (err, roles) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }
//
//         for (let i = 0; i < roles.length; i++) {
//           if (roles[i].name === "admin") {
//             next();
//             return;
//           }
//         }
//
//         res.status(403).send({ message: "Require Admin Role!" });
//         return;
//       }
//     );
//   });
// };
//
// isModerator = (req, res, next) => {
//   User.findById(req.userId).exec((err, user) => {
//     if (err) {
//       res.status(500).send({ message: err });
//       return;
//     }
//
//     Role.find(
//       {
//         _id: { $in: user.roles }
//       },
//       (err, roles) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }
//
//         for (let i = 0; i < roles.length; i++) {
//           if (roles[i].name === "moderator") {
//             next();
//             return;
//           }
//         }
//
//         res.status(403).send({ message: "Require Moderator Role!" });
//         return;
//       }
//     );
//   });
// };

// const authJwt = {
//   verifyToken
// };
//
module.exports = authJwt;
