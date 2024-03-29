"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true },
  area: { type: String, required: false },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  token: { type: String, default: "" },
  isSeller: { type: Boolean, required: false },
});

module.exports = mongoose.model("Admin", AdminSchema, "admin");
