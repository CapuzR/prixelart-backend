"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const surchargeSchema = Schema({
  surchargeId: { type: String, required: true },
  name: { type: String, required: true },
  active: { type: Boolean, required: false },
  description: { type: String, required: false },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  appliedProducts: { type: Array, required: false },
  appliedUsers: { type: Array, required: false },
  // appliedArtist: { type: Array, required: false },
  appliedPercentage: { type: String, required: false },
  considerations: { type: Object, required: false },
});

module.exports = mongoose.model("Surcharge", surchargeSchema, "surcharges");
