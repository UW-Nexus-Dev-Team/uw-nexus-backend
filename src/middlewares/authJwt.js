const jwt = require("jsonwebtoken");
const config = require("../config/index.js");

authJwt = (req,res,next) => {
    const { accessToken } = req.cookies;
    console.log(`Received access token = ${accessToken}`);
    if (accessToken) {
        jwt.verify(accessToken, config.JWT_SECRET, (err, user) => {
            if (err) {
                res.status(401).send({ message: "Unauthorized!" });
                return;
            }
            req.id = user.id;
        });
    }
    next();
}
module.exports = authJwt;
