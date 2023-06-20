"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = Schema({
  _id: { type: String, required: true },
  balance: { type: Number, required: true },
});

module.exports = mongoose.model("Account", AccountSchema, "account");
