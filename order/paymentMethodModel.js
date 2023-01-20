"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentMethodSchema = Schema({
  active: { type: Boolean, required: true },
  name: { type: String, required: true },
  createdOn: { type: Date, required: true },
  createdBy: { type: Object, required: true },
  instructions: { type: String, required: true },
  paymentData: { type: String, required: false },
});

module.exports = mongoose.model(
  "PaymentMethod",
  PaymentMethodSchema,
  "paymentMethod"
);
