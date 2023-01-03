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
  total: { type: Number, required: true }, //Arreglo
  shippingAddress: { type: String, required: true }, //Arreglo,
  billingAddress: { type: String, required: true },
  requests: { type: Array, required: true },
  orderPaymentMethod: { type: String, required: true },
  status: { type: String, required: true },
  shippingPhone: { type: String, required: false },
  internalShippingMethod: { type: String, required: false }, //(Yalo, DH, etc)
  domesticShippingMethod: { type: String, required: false }, //(Tealca, Zoom, etc)
  internationalShippingMethod: { type: String, required: false }, //(DHL, FedEx, Particular, etc)
  generalProductionStatus: { type: String, required: false },
  paymentStatus: { type: String, required: false }, //(Por pagar, Pagado parcialmente, Pagado)
  shippingStatus: { type: String, required: false }, //(No entregado, Entregado)
  observations: { type: String, required: false },
  isSaleByPrixer: { type: Boolean, required: false },
  // artProductionStatus (Solicitado, En diseño, En impresión, Listo)
  // baseProductionStatus (Solicitado, En producción, Listo)
});

module.exports = mongoose.model("Order", OrderSchema, "order");
