const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passResetSchema = new Schema({
    userId: { type: mongoose.Schema.ObjectId, required: true },
    email: { type: String, required: true },
    token: { type: String, required: true},
    token_expiry : {type: Date, required: true},
});

module.exports = mongoose.model('Password-reset', passResetSchema);