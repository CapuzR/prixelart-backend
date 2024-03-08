"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrganizationSchema = Schema({
  specialtyArt: { type: Array, required: false },
  description: { type: String, required: false },
  instagram: { type: String, required: false },
  twitter: { type: String, required: false },
  facebook: { type: String, required: false },
  dateOfBirth: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  shortShot: { type: String },
  username: { type: String, required: true, index: true },
  avatar: { type: String, required: false },
  status: { type: Boolean, required: false },
  termsAgree: { type: Boolean, required: false },
  bio: { type: Object, required: false },
});

module.exports = mongoose.model(
  "Organization",
  OrganizationSchema,
  "organizations"
);
