"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = Schema({
  orderId: { type: String, required: true },
  // active: {type: String, required: true},
  // consumerId: {type: String, required: true},
  orderType: { type: String, required: true },
  createdOn: { type: Date, required: true },
  createdBy: { type: Object, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  basicData: { type: Object, required: true },
  shippingData: { type: Object, required: false },
  billingData: { type: Object, required: false },
  requests: { type: Array, required: true },
  status: { type: String, required: true },
  payStatus: { type: String, required: false },
  generalProductionStatus: { type: String, required: false },
  shippingStatus: { type: String, required: false }, //(No entregado, Entregado)
  observations: { type: String, required: false },
  isSaleByPrixer: { type: Boolean, required: false },
  // artProductionStatus (Solicitado, En diseño, En impresión, Listo)
  // baseProductionStatus (Solicitado, En producción, Listo)
});

module.exports = mongoose.model("Order", OrderSchema, "order");
