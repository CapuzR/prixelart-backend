"use strict";
const { upload } = require("./organizationControllers");

const express = require("express");
const router = express.Router();
const orgMiddlewares = require("../prixer/prixerMiddlewares");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const userMdw = require("../user/userMiddlewares");
const orgControllers = require("./organizationControllers");

router.post(
  "/turn-to-association",
  adminAuthServices.ensureAuthenticated,
  orgControllers.turnToOrg
);

router.post(
  "/turn-to-prixer",
  adminAuthServices.ensureAuthenticated,
  orgControllers.turnToPrixer
);
router.get("/organization/read-all-full", orgControllers.readAllOrgFull);
router.get("/organization/read-all-full-v2", orgControllers.readAllOrgFullv2);
router.get("/organization/getBio/:id", orgControllers.getBio);

router.put(
  "/organization/updateComission/:id",
  adminAuthServices.ensureAuthenticated,
  orgControllers.updateComission
);

module.exports = router;
