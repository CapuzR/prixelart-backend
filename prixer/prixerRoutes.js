"use strict";

const express = require("express");
const router = express.Router();
const prixerMiddlewares = require("./prixerMiddlewares");
const userMdw = require("../user/userMiddlewares");
const prixerControllers = require("./prixerControllers");

router.post(
  "/prixer-registration",
  userMdw.ensureAuthenticated,
  prixerControllers.createPrixer
);
router.post("/prixer/read", prixerControllers.readPrixer);
router.get("/prixer/read-all", prixerControllers.readAllPrixers);
router.get("/prixer/read-all-full", prixerControllers.readAllPrixersFull);
router.get("/prixer/read-all-full-v2", prixerControllers.readAllPrixersFullv2);
router.post(
  "/prixer/update",
  userMdw.ensureAuthenticated,
  prixerMiddlewares.avatarUpload,
  prixerControllers.updatePrixer
);
router.put("/prixer/update-home/:id", prixerControllers.updateVisibility);

module.exports = router;
