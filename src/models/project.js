const mongoose = require('mongoose')
const constants = require('../constants/constants.js');

const projectSchema = new mongoose.Schema({
      title: { type: String, required: true },
      owner_id: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User'
      },
      size: {
        type: String,
        enum:['Small','Medium','Large']
      },
      team: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User'
      }],
      location: { type: String, required: true },
      status: {
        type: String,
        enum:['Active','Completed','Halted','Removed','New']},
      duration: {
        length: {
          type: String,
          enum:['1-3 months','3-6 months','6-9 months', 'More than 9 months']},
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
      interest:  [{
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
        responsibilities: [{ type: String}]
      }]
})

module.exports = mongoose.model('Project', projectSchema)
