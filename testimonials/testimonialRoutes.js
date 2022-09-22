const { Testimonial } = require("./testimonialModel");
const { upload } =
  // avatarUpload,
  require("../preferences/preferencesController");

const {
  createTestimonial,
  readAllTestimonials,
  readById,
  updateTestimonial,
  deleteTestimonial,
} = require("./testimonialController");
const express = require("express");
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
testimonialRoutes.delete("/testimonial/read/:id", deleteTestimonial);

module.exports = testimonialRoutes;
