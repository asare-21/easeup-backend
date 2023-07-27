const { Schema, model } = require("mongoose");

const workerSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    immutable: true,

  },
  name: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  addres: {
    type: String,
    default: "",
  },
  email_verified: {
    type: Boolean,
    default: true,
  },
  date_joined: {
    type: Date,
    default: Date.now,
  },
  last_login: {
    type: Date,
    default: Date.now,
  },
  profile_verified: {
    type: Boolean,
    default: false,
  },
  profile_verified_date: {
    type: Date,
    default: null,
  },
  profile_picture: {
    type: String,
    default: "",
  },
  rooms: {
    type: [String],
    default: [],
  },
  hashedPassword: {
    type: String,
    default: "",
  },
  passwordSalt: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  profile_name: {
    type: String,
    default: "",
  },
}, {
  timestamps: true
});

module.exports.workerModel = model("Worker", workerSchema);
