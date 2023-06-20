"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({
  username: { type: String, required: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  account: { type: String, required: false },
  token: { type: String, default: "" },
  login_count: Number,
});

module.exports = mongoose.model("User", UserSchema, "users");
