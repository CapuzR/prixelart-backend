"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminRoleSchema = Schema({
  area: { type: String, required: true },
  createDiscount: { type: Boolean, required: false },
  createOrder: { type: Boolean, required: true },
  createPaymentMethod: { type: Boolean, reqiured: true },
  createProduct: { type: Boolean, required: true },
  createShippingMethod: { type: Boolean, required: true },
  createTestimonial: { type: Boolean, required: false },
  deleteDiscount: { type: Boolean, required: false },
  deletePaymentMethod: { type: Boolean, required: true },
  deleteProduct: { type: Boolean, required: true },
  deleteShippingMethod: { type: Boolean, required: true },
  deleteTestimonial: { type: Boolean, required: false },
  detailOrder: { type: Boolean, required: true },
  detailPay: { type: Boolean, required: true },
  modifyAdmins: { type: Boolean, required: false },
  modifyBanners: { type: Boolean, required: true },
  modifyDollar: { type: Boolean, required: true },
  modifyTermsAndCo: { type: Boolean, required: true },
  orderStatus: { type: Boolean, required: true },
  prixerBan: { type: Boolean, required: false },
  readMovements: { type: Boolean, required: false },
  setPrixerBalance: { type: Boolean, required: false },
  createConsumer: { type: Boolean, required: false },
  readConsumers: { type: Boolean, required: false },
  deleteConsumer: { type: Boolean, required: false },
  artBan: { type: Boolean, required: false },
  modifyBestSellers: { type: Boolean, required: false },
  modifyArtBestSellers: { type: Boolean, required: false },
});

module.exports = mongoose.model("AdminRole", AdminRoleSchema, "adminRole");
