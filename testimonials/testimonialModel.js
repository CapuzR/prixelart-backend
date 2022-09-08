"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestimonialSchema = Schema({
  type: string,
  required,
  name: { type: String, required: true },
  value: { type: String, required: true },
  avatar: { type: String, required: true },
  footer: { type: String, required: false },
  companyImage,
  optional,
  Status: { type: Boolean, required: true },
});
