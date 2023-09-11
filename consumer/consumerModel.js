"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConsumerSchema = Schema({
  // _id: { type: String, required: true },
  active: { type: Boolean, required: true },
  consumerType: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: false },
  ci: { type: String, required: false },
  phone: { type: String, required: false },
  email: { type: String, required: false },
  address: { type: String, required: false },
  billingAddress: { type: String, required: false },
  shippingAddress: { type: String, required: false },
  contactedBy: { type: Object, required: false },
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
