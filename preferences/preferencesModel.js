"use strict";
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const carouselSchema = Schema({
  images: {
    type: Object,
    required: true,
  },
});

const termsAndConditionsSchema = Schema({
  termsAndConditions: { type: Object, required: true },
});

const dollarValueSchema = Schema({
  dollarValue: { type: String, required: false },
});

const Carousel = mongoose.model("Carousel", carouselSchema, "carousel");

const termsAndConditions = mongoose.model(
  "termsAndConditions",
  termsAndConditionsSchema,
  "termsandconditions"
);
const dollarValue = mongoose.model("dollarValue", dollarValueSchema, "dollar");

module.exports = { Carousel, termsAndConditions, dollarValue };
