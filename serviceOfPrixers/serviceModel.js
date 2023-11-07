"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = Schema({
  // serviceId: { type: String, required: true },
  title: { type: String, required: true },
  active: { type: Boolean, required: true },
  description: { type: String, required: true },
  prixer: { type: String, required: true },
  isLocal: { type: Boolean, required: false },
  isRemote: { type: Boolean, required: false },
  location: { type: String, required: false },
  sources: {
    images: { type: Array, required: true },
    video: { type: String, required: false },
  },
  serviceArea: { type: String, required: true },
  productionTime: { type: String, required: false },
  // considerations: { type: String, required: true },
  publicPrice: {
    from: { type: Number, required: true },
    to: { type: Number, required: false },
  },
  appliedProducts: { type: Array, required: false },
});

module.exports = mongoose.model("Service", ServiceSchema, "services");
