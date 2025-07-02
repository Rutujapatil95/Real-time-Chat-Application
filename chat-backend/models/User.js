const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    required: true,         // username is required
    trim: true,             // trim whitespace
    lowercase: true         // enforce lowercase to avoid duplicates like "User" vs "user"
  },
  password: { 
    type: String, 
    required: true          // password required
  },
}, { timestamps: true });    // add createdAt and updatedAt timestamps

module.exports = mongoose.model("User", UserSchema);
