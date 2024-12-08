const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    approved: { type: Boolean, default: false }, // For user approval
});

module.exports = mongoose.model("User", userSchema);
