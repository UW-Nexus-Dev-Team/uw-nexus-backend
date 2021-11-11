const User = require('../models/user.js')
const Project = require('../models/project.js')
const Profile = require('../models/profile.js')

checkDuplicateEmail = (req, res, next) => {
    // Email
    User.findOne({ email: req.body.email })
        .exec((err, user) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            if (user) {
              res.status(400).send({ message: "Failed! Email is already in use!" });
              return;
            }
            next();
        });
};

checkDuplicateProjectTitles = (req, res, next) => {
    // Project Title
     Project.findOne({ title: req.body.title })
            .exec((err, project) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                if (project) {
                    res.status(400).send({message: "Project title is not unique! \
                      Please come up with a better title for your project."});
                    return;
                }
                next();
        });
};

// checkRolesExisted = (req, res, next) => {
//   if (req.body.roles) {
//     for (let i = 0; i < req.body.roles.length; i++) {
//       if (!ROLES.includes(req.body.roles[i])) {
//         res.status(400).send({
//           message: `Failed! Role ${req.body.roles[i]} does not exist!`
//         });
//         return;
//       }
//     }
//   }
//
//   next();
// };

const verifyInfo = {
    checkDuplicateEmail,
    checkDuplicateProjectTitles
};

module.exports = verifyInfo;
