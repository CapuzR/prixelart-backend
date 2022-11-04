const {
  createImageCarousel,
  upload,
  readAllImagesCarousel,
  readImageCarousel,
  updateImageCarousel,
  deleteImageCarousel,
  readTermsAndConditions,
  updateTermsAndConditions,
} = require("./preferencesController");
const express = require("express");
const preferencesRoutes = express.Router();

preferencesRoutes.get("/carousel", readAllImagesCarousel);
preferencesRoutes.get("/carousel/:id", readImageCarousel);
preferencesRoutes.post(
  "/carousel",
  upload.fields([{name: "bannerImagesDesktop", maxCount: 1}, {name: "bannerImagesMobile", maxCount: 1}]),
  createImageCarousel
);
preferencesRoutes.put(
  "/carousel/:id",
  upload.fields([{name: "bannerImagesDesktop", maxCount: 1}, {name: "bannerImagesMobile", maxCount: 1}]),
  updateImageCarousel
);
preferencesRoutes.delete("/carousel/:id", deleteImageCarousel);

preferencesRoutes.get("/termsAndConditions/read", readTermsAndConditions);
preferencesRoutes.put("/termsAndConditions/update", updateTermsAndConditions);

module.exports = preferencesRoutes;
