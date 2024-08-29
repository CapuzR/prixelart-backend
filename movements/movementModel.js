"use strict"

const mongoose = require("mongoose")
const Schema = mongoose.Schema

const MovementSchema = Schema({
  _id: { type: String, required: true },
  date: { type: Date, required: false },
  destinatary: { type: String, required: false },
  description: { type: String, required: false },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  order: { type: String, required: false },
  createdOn: { type: Date, required: true },
  createdBy: { type: String, required: false },
  item: { type: Object, required: false },
})

module.exports = mongoose.model("Movement", MovementSchema, "movements")
