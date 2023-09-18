"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = Schema({
  orderId: { type: String, required: true },
  consumerId: { type: String, required: false },
  orderType: { type: String, required: true },
  createdOn: { type: Date, required: true },
  createdBy: { type: Object, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  basicData: { type: Object, required: true },
  shippingData: { type: Object, required: false },
  shippingCost: { type: Number, required: false },
  billingData: { type: Object, required: false },
  requests: { type: Object, required: true, mutable: true },
  status: { type: String, required: true },
  paymentVoucher: { type: String, required: false },
  dollarValue: { type: Number, required: false },
  payStatus: { type: String, required: false },
  generalProductionStatus: { type: String, required: false },
  shippingStatus: { type: String, required: false },
  observations: { type: String, required: false },
  isSaleByPrixer: { type: Boolean, required: false },
  payDate: { type: Date, required: false },
  completionDate: { type: Date, required: false },
});

module.exports = mongoose.model("Order", OrderSchema, "order");
