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
  modifyDollar: { type: Boolean, required: true },
  createDiscount: { type: Boolean, required: false },
  deleteDiscount: { type: Boolean, required: false },
  prixerBan: { type: Boolean, required: false },
  createTestimonial: { type: Boolean, required: false },
  deleteTestimonial: { type: Boolean, required: false },
  modifyAdmins: { type: Boolean, required: false },
});

module.exports = mongoose.model("AdminRole", AdminRoleSchema, "adminRole");
