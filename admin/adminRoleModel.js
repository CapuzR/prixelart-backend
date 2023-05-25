"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminRoleSchema = Schema({
  area: { type: String, required: true },
  detailOrder: { type: Boolean, required: true },
  detailPay: { type: Boolean, required: true },
  orderStatus: { type: Boolean, required: true },
  createOrder: { type: Boolean, required: true },
  createProduct: { type: Boolean, required: true },
  deleteProduct: { type: Boolean, required: true },
  modifyBanners: { type: Boolean, required: true },
  modifyTermsAndCo: { type: Boolean, required: true },
  createPaymentMethod: { type: Boolean, reqiured: true },
  deletePaymentMethod: { type: Boolean, required: true },
  createShippingMethod: { type: Boolean, required: true },
  deleteShippingMethod: { type: Boolean, required: true },
});

module.exports = mongoose.model("AdminRole", AdminRoleSchema, "adminRole");
