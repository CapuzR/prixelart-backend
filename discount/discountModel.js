"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiscountSchema = Schema({
  name: { type: String, required: true },
  active: { type: Boolean, required: false },
  description: { type: String, required: false },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  appliedProducts: { type: Array, required: false },
  applyBy: { type: String, required: false },
  applyFor: { type: Array, required: false },
  appliedPercentage: { type: String, required: false },
});

module.exports = mongoose.model("Discount", DiscountSchema, "discounts");
