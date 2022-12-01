const { Testimonial } = require("./testimonialModel");
const { upload } =
  // avatarUpload,
  require("../preferences/preferencesController");

const {
  createTestimonial,
  readAllTestimonials,
  readById,
  updateTestimonial,
  updateVisibility,
  deleteTestimonial,
  updatePosition,
} = require("./testimonialController");
const express = require("express");
// const { updatePosition } = require("./testimonialServices");
const testimonialRoutes = express.Router();

testimonialRoutes.get("/testimonial/read-all", readAllTestimonials);
testimonialRoutes.get("/testimonial/:id", readById);
testimonialRoutes.post(
  "/testimonial/create",
  upload.single("avatar"),
  createTestimonial
);
testimonialRoutes.put(
  "/testimonial/update/:id",
  upload.single("avatar"),
  updateTestimonial
);
testimonialRoutes.put("/testimonial/update-home/:id", updateVisibility);
testimonialRoutes.put("/testimonial/update-position/:id", updatePosition);

testimonialRoutes.delete("/testimonial/read/:id", deleteTestimonial);

module.exports = testimonialRoutes;
