"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiscountSchema = Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  active: { type: Boolean, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: String, required: true },
  appliedProducts: { type: Array, required: false },
});

module.exports = mongoose.model("Discount", DiscountSchema, "discounts");
