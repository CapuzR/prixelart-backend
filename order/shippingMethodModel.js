"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShippingMethodSchema = Schema({
  active: { type: Boolean, required: true },
  inter: { type: Boolean, required: false },
  name: { type: String, required: true },
  createdOn: { type: Date, required: true },
  createdBy: { type: Object, required: true },
  price: { type: String, required: true },
  //   instruccions: { type: String, required: false },
});

module.exports = mongoose.model(
  "ShippingMethod",
  ShippingMethodSchema,
  "shippingMethod"
);
