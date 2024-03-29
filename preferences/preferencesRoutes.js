const {
  createImageCarousel,
  upload,
  readAllImagesCarousel,
  readImageCarousel,
  updateImageCarousel,
  deleteImageCarousel,
  readTermsAndConditions,
  updateTermsAndConditions,
  readDollarValue,
  updateDollarValue,
  getBestSellers,
  getArtBestSellers,
  updateBestSellers,
  updateArtBestSellers,
} = require("./preferencesController");
const express = require("express");
const preferencesRoutes = express.Router();
const adminAuthServices = require("../admin/adminServices/adminAuthServices");

preferencesRoutes.get("/carousel", readAllImagesCarousel);
preferencesRoutes.get("/carousel/:id", readImageCarousel);
preferencesRoutes.post(
  "/carousel",
  adminAuthServices.ensureAuthenticated,
  upload.fields([
    { name: "bannerImagesDesktop", maxCount: 1 },
    { name: "bannerImagesMobile", maxCount: 1 },
  ]),
  createImageCarousel
);
preferencesRoutes.put(
  "/carousel/:id",
  adminAuthServices.ensureAuthenticated,
  upload.fields([
    { name: "bannerImagesDesktop", maxCount: 1 },
    { name: "bannerImagesMobile", maxCount: 1 },
  ]),
  updateImageCarousel
);
preferencesRoutes.delete(
  "/carousel/:id",
  adminAuthServices.ensureAuthenticated,
  deleteImageCarousel
);

preferencesRoutes.get("/termsAndConditions/read", readTermsAndConditions);
preferencesRoutes.put(
  "/termsAndConditions/update",
  adminAuthServices.ensureAuthenticated,
  updateTermsAndConditions
);

preferencesRoutes.get("/dollarValue/read", readDollarValue);
preferencesRoutes.post(
  "/dollarValue/update",
  adminAuthServices.ensureAuthenticated,
  updateDollarValue
);
preferencesRoutes.get("/getBestSellers", getBestSellers);
preferencesRoutes.get("/getArtBestSellers", getArtBestSellers);
preferencesRoutes.put(
  "/updateBestSellers",
  adminAuthServices.ensureAuthenticated,
  updateBestSellers
);

preferencesRoutes.put(
  "/updateArtBestSellers",
  adminAuthServices.ensureAuthenticated,
  updateArtBestSellers
);

module.exports = preferencesRoutes;
