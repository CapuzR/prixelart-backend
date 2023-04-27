"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminRoleSchema = Schema({
  area: { type: String, required: true },
  detailOrder: { type: Boolean, required: true },
  detailPay: { type: Boolean, required: true },
  orderStatus: { type: Boolean, required: true },
});

module.exports = mongoose.model("AdminRole", AdminRoleSchema, "adminRole");
