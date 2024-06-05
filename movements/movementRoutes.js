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

router.post(
  "/movement/readByPrixer",
  adminAuthServices.ensureAuthenticated,
  movementControllers.readByAccount
);

router.post(
  "/movement/readAllMovements",
  adminAuthServices.ensureAuthenticated,
  movementControllers.readAllMovements
);

router.post(
  "/movement/readMovementByOrderId",
  adminAuthServices.ensureAuthenticated,
  movementControllers.readByOrderId
);

router.put(
  "/movement/deleteByPrixer",
  adminAuthServices.ensureAuthenticated,
  movementControllers.deleteByPrixer
);
module.exports = router;
