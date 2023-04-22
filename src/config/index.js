require("dotenv").config();

process.env.NODE_ENV = process.env.NODE_ENV || "development";

if (process.env.NODE_ENV === "development") {
    console.log("Server in development mode.");
    exports.MONGODB_URI = process.env.MONGODB_URI;
    exports.FE_ADDR = "http://localhost:3000";
    exports.BE_ADDR = "http://localhost:3100";
    exports.PORT = 3100;
}
if (process.env.NODE_ENV === "production") {
    console.log("Server in production mode.");
    exports.MONGODB_URI = process.env.MONGODB_URI_PROD;
    exports.FE_ADDR = process.env.FE_ADDR;
    exports.BE_ADDR =  process.env.BE_ADDR;
    exports.PORT = process.env.PORT;
}

exports.JWT_SECRET = process.env.JWT_SECRET || "jwt-secret";

exports.FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
exports.FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";

exports.EMAIL_ADDR = process.env.EMAIL_ADDR || "";
exports.EMAIL_NAME = process.env.EMAIL_NAME || "";

exports.ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || "";
exports.ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY || "";
