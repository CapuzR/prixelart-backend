"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = Schema({
  active: { type: Boolean, required: true},
  icon:  { type: String, required: false },
  image:  { type: String, required: false },
  name: { type: String, required: true },
});

module.exports = mongoose.model("Category", CategorySchema, "categories");
