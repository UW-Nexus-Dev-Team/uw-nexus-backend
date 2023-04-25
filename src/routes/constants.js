const constants = require("../constants/constants.js");
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/constants/interests", (req, res) => {
            res.send(constants.INTERESTS);
        }
    );
    app.get(
        "/api/constants/skills", (req, res) => {
            res.send(constants.SKILLS);
        }
    );
    app.get(
        "/api/constants/coding_languages", (req, res) => {
            res.send(constants.CODING_LANGUAGES);
        }
    );
    app.get(
        "/api/constants/majors", (req, res) => {
            res.send(constants.MAJORS);
        }
    );

};