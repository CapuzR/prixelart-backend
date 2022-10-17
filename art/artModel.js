"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArtSchema = Schema({
  artId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], required: true },
  imageUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: false },
  largeThumbUrl: { type: String, required: true },
  mediumThumbUrl: { type: String, required: true },
  smallThumbUrl: { type: String, required: true },
  squareThumbUrl: { type: String, required: true },
  userId: { type: String, required: true },
  prixerUsername: { type: String, required: true },
  status: { type: String, required: true },
  publicId: { type: String, required: false },
  artType: { type: String, required: false },
  originalPhotoWidth: { type: String, required: false },
  originalPhotoHeight: { type: String, required: false },
  originalPhotoIso: { type: String, required: false },
  originalPhotoPpi: { type: String, required: false },
  artLocation: { type: String, required: false },
  disabledReason: { type: String, required: false },
  visible: { type: Boolean, required: false },
  crops: { type: Array, required: true },
  points: {type: Number, required: false}
});

ArtSchema.index(
  {
    title: "text",
    // 'description': 'text',
    // 'tags': 'text'
  }
  // {
  //     default_language: "none"
  // }
);

module.exports = mongoose.model("Art", ArtSchema, "arts");
