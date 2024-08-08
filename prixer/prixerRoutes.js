"use strict";
const { upload, upload2 } =
  // avatarUpload
  require("./prixerControllers");

const express = require("express");
const router = express.Router();
const prixerMiddlewares = require("./prixerMiddlewares");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
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
router.get("/prixer/getBio/:id", prixerControllers.getBio);
router.get("/prixer/read-all", prixerControllers.readAllPrixers);
router.post(
  "/prixer/getOwnersAndPrixers",
  adminAuthServices.ensureAuthenticated,
  prixerControllers.getOwnersAndPrixers
);
router.get("/prixer/read-all-full", prixerControllers.readAllPrixersFull);
router.get("/prixer/read-all-full-v2", prixerControllers.readAllPrixersFullv2);
router.post(
  "/prixer/update",
  upload2.single("avatar"),
  // prixerMiddlewares.avatarUpload,
  userMdw.ensureAuthenticated,
  prixerControllers.updatePrixer
);
router.put(
  "/prixer/updateBio/:id",
  userMdw.ensureAuthenticated,
  upload2.array("newBioImages", 4),
  prixerControllers.updateBio
);
router.put(
  "/prixer/update-home/:id",
  adminAuthServices.ensureAuthenticated,
  prixerControllers.updateVisibility
);
router.put(
  "/prixer/update-terms/:id",
  userMdw.ensureAuthenticated,
  prixerControllers.updateTermsAgree
);
router.put(
  "/prixer/update-home/updateTermsAgree",
  adminAuthServices.ensureAuthenticated,
  prixerControllers.updateTermsAgreeGeneral
);
router.put(
  "/prixers/addRole",
  adminAuthServices.ensureAuthenticated,
  prixerServices.addRole
);

module.exports = router;
