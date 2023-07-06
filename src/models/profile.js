const mongoose = require("mongoose");
const constants = require("../constants/constants.js");

const profileSchema = new mongoose.Schema({
    user_id:  {
        type: mongoose.Schema.Types.ObjectID,
        ref: "User" },
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    education: {
        campus: {
            type: String,
            enum: ["Seattle","Tacoma","Bothell"] },
        year: { type: String },
        major: {
            type: String,
            enum: constants.MAJORS}
    },
    interests: [{
        type: String,
        enum: constants.INTERESTS}],
    skills: [{
        type: String,
        enum: constants.SKILLS}],
    coding_skills: [{
        type: String,
        enum: constants.CODING_SKILLS}],
    bio: { type: String },
    created_at: { type: Date, required: true},
    updated_at: { type: Date, required: true },
    resume_file_id: { type: String},
    favorite_projects: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: "Project"}],
    private: {type: Boolean}
});
module.exports = mongoose.model("Profile", profileSchema);
