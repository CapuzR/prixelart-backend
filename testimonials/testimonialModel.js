"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestimonialSchema = Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  value: { type: String, required: true },
  avatar: { type: String, required: true },
  footer: { type: String, required: false },
  company: { type: String, required: false },
  status: { type: Boolean, required: true },
});
const Testimonial = mongoose.model(
  "Testimonial",
  TestimonialSchema,
  "testimonial"
);

module.exports = ("Testimonial", TestimonialSchema, Testimonial);
