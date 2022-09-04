const { termsAndConditions } = require("./preferencesModel");

const {
  createImageCarousel,
  upload,
  readAllImagesCarousel,
  readImageCarousel,
  updateImageCarousel,
  deleteImageCarousel,
} = require("./preferencesController");
const express = require("express");
const preferencesRoutes = express.Router();

preferencesRoutes.get("/carousel", readAllImagesCarousel);
preferencesRoutes.get("/carousel/:id", readImageCarousel);
preferencesRoutes.post(
  "/carousel",
  upload.single("bannerImages"),
  createImageCarousel
);
preferencesRoutes.put(
  "/carousel/:id",
  upload.single("newBannerImages"),
  updateImageCarousel
);
preferencesRoutes.delete("/carousel/:id", deleteImageCarousel);

preferencesRoutes.get("/termsAndConditions/read", async (req, res) => {
  try {
    const result = await termsAndConditions.find();
    res.send({ terms: result[0] });
  } catch (error) {
    console.log(error);
    res.send({ message: 505 });
  }
});

preferencesRoutes.put("/termsAndConditions/update", async (req, res) => {
  try {
    const result = await termsAndConditions.find();
    const updating = await termsAndConditions.findOne({ _id: result[0]._id });
    updating.termsAndConditions = req.body.termsAndConditions;
    await updating.save();
    res.send({ terms: updating });
  } catch (error) {
    console.log(error);
    res.send({ message: 505 });
  }
});

module.exports = preferencesRoutes;
