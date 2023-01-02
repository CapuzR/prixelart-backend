"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConsumerSchema = Schema({
  active: { type: Boolean, required: true },
  consumerType: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  billingAddress: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  contactedBy: { type: Object, required: true },
  birthdate: { type: Date, required: false },
  instagram: { type: String, required: false },
  facebook: { type: String, required: false },
  twitter: { type: String, required: false },
  nationalIdType: { type: String, required: false },
  nationalId: { type: String, required: false },
  gender: { type: String, required: false },
});

ConsumerSchema.index(
  {
    firstname: "text",
    lastname: "text",
    email: "text",
    // 'description': 'text',
    // 'tags': 'text'
  }
  // {
  //     default_language: "none"
  // }
);

module.exports = mongoose.model("Consumer", ConsumerSchema, "consumer");
