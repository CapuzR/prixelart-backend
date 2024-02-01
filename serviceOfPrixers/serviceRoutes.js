"use strict";

const express = require("express");
const router = express.Router();
const userMdw = require("../user/userMiddlewares");
const serviceControllers = require("./serviceControllers");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");

router.post(
  "/service/create",
  userMdw.ensureAuthenticated,
  serviceControllers.upload.array("serviceImages", 6),
  serviceControllers.createService
);

router.get("/service/getAll", serviceControllers.getAll);
router.get("/service/getAllActive", serviceControllers.getAllActive);
router.post(
  "/service/readMyServices",
  userMdw.ensureAuthenticated,
  serviceControllers.readMyServices
);

router.get(
  "/service/getServiceByPrixer/:prixer",
  serviceControllers.getServicesByPrixer
);

router.put(
  "/service/updateMyService/:id",
  serviceControllers.upload.array("newServiceImages", 6),
  userMdw.ensureAuthenticated,
  serviceControllers.updateMyService
);

router.put(
  "/service/disable/:id",
  adminAuthServices.ensureAuthenticated,
  serviceControllers.disableService
);

router.put(
  "/service/deleteService/:id",
  userMdw.ensureAuthenticated,
  serviceControllers.deleteService
);

module.exports = router;
