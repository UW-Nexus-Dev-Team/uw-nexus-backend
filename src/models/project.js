const mongoose = require("mongoose");
const constants = require("../constants/constants.js");

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    owner_id: {
        type: mongoose.Schema.Types.ObjectID,
        ref: "User"
    },
    owner_email: { type: String },
    size: {
        type: String,
        enum:["Small","Medium","Large"]
    },
    team: [{
        user_id: {type: mongoose.Schema.Types.ObjectID,
            ref: "User"},
        role: {type: String}
    }],
    location: { type: String, required: true },
    status: {
        type: String,
        enum:["Active","Completed","Halted","Removed","New"]},
    duration: {
        length: {
            type: String,
            enum:["1-3 months","3-6 months","6-9 months", "More than 9 months"]},
        created_date: { type: Date },
        end_date: {type: Date }
    },
    banner_image: { type: String },
    updated_at: { type: Date },
    description: { type: String, required: true },
    skill: [{
        type: String,
        enum: constants.SKILLS}],
    coding_skills: [{
        type: String,
        enum: constants.CODING_SKILLS}],
    interests:  [{
        type: String,
        enum: constants.INTERESTS}],
    roles:  [{
        title: { type: String },
        skill: [{
            type: String,
            enum: constants.SKILLS}],
        coding_skills: [{
            type: String,
            enum: constants.CODING_SKILLS}],
        responsibilities: [{ type: String}],
        application_link: {type: String},
        role_duration: {
            type: String,
            enum:["1-3 months","3-6 months","6-9 months", "More than 9 months"]
        },
        type: {type: String, enum: constants.ROLES_TYPES},
        private: {type: Boolean},
        isFilled: {type: Boolean, default: false}
    }]
});

module.exports = mongoose.model("Project", projectSchema);
