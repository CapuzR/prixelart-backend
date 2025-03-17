"use strict"

const mongoose = require("mongoose")
const Schema = mongoose.Schema

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
    images: { type: Array, required: true },
    video: { type: String, required: false },
  },
  publicPrice: {
    from: { type: Number, required: false },
    to: { type: Number, required: false },
  },
  prixerPrice: {
    from: { type: Number, required: false },
    to: { type: Number, required: false },
  },
  cost: { type: Number, required: false },
  attributes: { type: Array, required: false },
  active: { type: Boolean, required: true },
  variants: { type: Array, required: false },
  hasSpecialVar: { type: Boolean, required: true },
  hasInternationalV: { type: Boolean, required: false },
  autoCertified: { type: Boolean, required: false },
  discount: { type: String, required: false },
  bestSeller: { type: Boolean, required: false },
  mockUp: { type: Object, required: false },
})

module.exports = mongoose.model("Product", ProductSchema, "products")
// Need a script for transform 'cost', publicPrice.to, publicPrice.from, prixerPrice.to and prixerPrice.from to Number type
