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

const GeneralPrefSchema = Schema({
  prixerStandarComission: { type: Number, required: false },
});


const termsAndConditions = mongoose.model(
  "termsAndConditions",
  termsAndConditionsSchema,
  "termsandconditions"
);
const Carousel = mongoose.model("Carousel", carouselSchema, "carousel");
const dollarValue = mongoose.model("dollarValue", dollarValueSchema, "dollar");
const GeneralPreferences = mongoose.model("GeneralPreferences", GeneralPrefSchema, "generalPreferences");

module.exports = { Carousel, termsAndConditions, dollarValue, GeneralPreferences };
