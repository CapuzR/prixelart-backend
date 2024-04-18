"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArtSchema = Schema({
  artId: { type: String, required: true },
  artLocation: { type: String, required: false },
  artType: { type: String, required: false },
  bestSeller: { type: Boolean, required: false },
  category: { type: String, required: false },
  exclusive: { type: String, required: false },
  crops: { type: Array, required: true },
  description: { type: String, required: true },
  disabledReason: { type: String, required: false },
  imageUrl: { type: String, required: true },
  largeThumbUrl: { type: String, required: true },
  mediumThumbUrl: { type: String, required: true },
  originalPhotoHeight: { type: String, required: false },
  originalPhotoIso: { type: String, required: false },
  originalPhotoPpi: { type: String, required: false },
  originalPhotoWidth: { type: String, required: false },
  owner: { type: String, required: false },
  points: { type: Number, default: 50 },
  prixerUsername: { type: String, required: true },
  publicId: { type: String, required: false },
  sells: { type: Number, required: false },
  smallThumbUrl: { type: String, required: true },
  squareThumbUrl: { type: String, required: true },
  status: { type: String, required: true },
  tags: { type: Array, required: true },
  thumbnailUrl: { type: String, required: false },
  title: { type: String, required: true },
  userId: { type: String, required: true },
  comission: { type: Number, required: false },
  visible: { type: Boolean, default: true },
  certificate: { type: String, required: false },
});

ArtSchema.index({
  title: "text",
  // 'description': 'text',
  // 'tags': 'text'
});

module.exports = mongoose.model("Art", ArtSchema, "arts");
