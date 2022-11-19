"use strict";
const { upload } =
  // avatarUpload,
  require("../preferences/preferencesController");

const express = require("express");
const router = express.Router();
const prixerMiddlewares = require("./prixerMiddlewares");
const userMdw = require("../user/userMiddlewares");
const prixerControllers = require("./prixerControllers");
const prixerServices = require("./prixerServices");
router.post(
  "/prixer-registration",
  userMdw.ensureAuthenticated,
  upload.single("avatar"),
  prixerControllers.createPrixer
);
router.post("/prixer/read", prixerControllers.readPrixer);
router.get("/prixer/get/:id", prixerControllers.getPrixer);
router.get("/prixer/read-all", prixerControllers.readAllPrixers);
router.get("/prixer/read-all-full", prixerControllers.readAllPrixersFull);
router.get("/prixer/read-all-full-v2", prixerControllers.readAllPrixersFullv2);
router.post(
  "/prixer/update",
  upload.single("avatar"),
  userMdw.ensureAuthenticated,
  prixerControllers.updatePrixer
);
router.put("/prixer/update-home/:id", prixerControllers.updateVisibility);
router.put("/prixer/update-terms/:id", prixerControllers.updateTermsAgree);
router.put(
  "/prixer/update-home/updateTermsAgree/:id",
  prixerControllers.updateTermsAgreeGeneral
);

module.exports = router;
