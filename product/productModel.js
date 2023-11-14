"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  considerations: { type: String, required: true },
  productionTime: { type: String, required: false },
  thumbUrl: { type: String, required: false },
  mockupImg: { type: String, required: false },
  coordinates: { type: String, required: false },
  sources: {
    // typeFile: {type: String, required: true},
    images: { type: Array, required: true },
    video: { type: String, required: false },
  }, //images from Products
  publicPrice: {
    from: { type: String, required: false },
    to: { type: String, required: false },
  }, //price
  prixerPrice: {
    from: { type: String, required: false },
    to: { type: String, required: false },
  }, //prixerPrice
  attributes: { type: Array, required: false }, //activeAttributes
  active: { type: Boolean, required: true },
  variants: { type: Array, required: false },
  hasSpecialVar: { type: Boolean, required: true },
  discount: { type: String, required: false },
  bestSeller: { type: Boolean, required: false },
  mockUp: { type: Object, required: false },
});

module.exports = mongoose.model("Product", ProductSchema, "products");
