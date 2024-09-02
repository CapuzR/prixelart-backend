"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VariantSchema = Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  thumbUrl: { type: String, required: false },
  active: { type: Boolean, required: true },
  considerations: { type: String, required: true },
  price: { type: Number, required: false },
  cost: { type: Number, required: true },
  margin: { type: Number, required: true },
  attributes : {
    name: { type: String, required: true },
    value: { type: String, required: true },
  },
  sources: {
    images: { type: Array, required: true },
    video: { type: String, required: false },
  }
});

const ProductSchema = Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  considerations: { type: String, required: true },
  active: { type: Boolean, required: true },
  thumbUrl: { type: String, required: false },
  productionTime: { type: String, required: false },
  priceRange: {
    'from': { type : String, required : false },
    'to': { type : String, required : false }
  },
  attributes: { type: Array, required: false }, //activeAttributes
  variants: [VariantSchema],
});

module.exports = mongoose.model("Product_v2", ProductSchema, "products_v2");