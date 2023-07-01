"use strict";

const express = require("express");
const router = express.Router();
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const userMdw = require("../user/userMiddlewares");
const movementControllers = require("./movementControllers");

router.post(
  "/movement/create",
  adminAuthServices.ensureAuthenticated,
  movementControllers.createMovement
);
router.post("/movement/createv2", movementControllers.createMovement);

router.post(
  "/movement/readByAccount",
  userMdw.ensureAuthenticated,
  movementControllers.readByAccount
);

module.exports = router;
