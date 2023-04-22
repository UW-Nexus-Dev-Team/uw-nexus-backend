const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    password: { type: String, required: true },
    email: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
