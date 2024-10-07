"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = Schema({
  name: { type: String, required: true },
  icon:  { type: String, required: false },
  image:  { type: String, required: false },
  active: { type: Boolean, required: true}
});

module.exports = mongoose.model("Category", CategorySchema, "categories");
