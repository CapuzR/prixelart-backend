"use strict";
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const carouselSchema = Schema({
  carouselImages: { type: [String], required: true },
});

const termsAndConditionsSchema = Schema({
  termsAndConditions: { type: Object, required: true },
});

const Carousel = mongoose.model("Carousel", carouselSchema, "carousel");

const termsAndConditions = mongoose.model(
  "termsAndConditions",
  termsAndConditionsSchema,
  "termsandconditions"
);

module.exports = { Carousel, termsAndConditions };
