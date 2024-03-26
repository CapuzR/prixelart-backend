"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const surchargeSchema = Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  active: { type: Boolean, required: false },
  description: { type: String, required: false },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  appliedProducts: { type: Array, required: false },
  appliedOwners: { type: Array, required: false },
  appliedArtist: { type: Array, required: false },
  appliedOn: { type: String, required: false },
});

module.exports = mongoose.model("Surcharge", surchargeSchema, "surcharges");
