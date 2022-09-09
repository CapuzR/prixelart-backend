const { Testimonial } = require("./testimonialModel");

const {
  createTestimonial,
  readAllTestimonials,
  readTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("./testimonialController");
const express = require("express");
const testimonialRoutes = express.Router();

testimonialRoutes.get("/testimonial", readAllTestimonials);
testimonialRoutes.get("/testimonial/name", readTestimonial);
testimonialRoutes.post(
  "/testimonial",
  upload.single("testimonial"),
  createTestimonial
);
testimonialRoutes.put(
  "/testimonial/name",
  upload.single("newTestimonial"),
  updateTestimonial
);
testimonialRoutes.delete("/testimonial/name", deleteTestimonial);

// testimonialRoutes.get("/termsAndConditions/read", async (req, res) => {
//   try {
//     const result = await termsAndConditions.find();
//     res.send({ terms: result[0] });
//   } catch (error) {
//     console.log(error);
//     res.send({ message: 505 });
//   }
// });

testimonialRoutes.put("/termsAndConditions/update", async (req, res) => {
  try {
    const result = await testimonial.find();
    const updating = await testimonial.findOne({ name: result[0].name });
    updating.testimonial = req.body.testimonial;
    await updating.save();
    res.send({ testimonial: updating });
  } catch (error) {
    console.log(error);
    res.send({ message: 505 });
    2;
  }
});

module.exports = testimonialRoutes;
