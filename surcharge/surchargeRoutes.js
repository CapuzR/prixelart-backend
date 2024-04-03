"use strict";

const express = require("express");
const router = express.Router();
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const surchargeControllers = require("./surchargeControllers");

router.post(
  "/surcharge/create",
  adminAuthServices.ensureAuthenticated,
  surchargeControllers.createSurcharge
);
router.put(
  "/surcharge/update",
  adminAuthServices.ensureAuthenticated,
  surchargeControllers.updateSurcharge
);
// // router.post(
// //   "/discount/read",
// //   adminAuthServices.ensureAuthenticated,
// //   discountControllers.readById
// // );

router.post(
  "/surcharge/read-all",
  adminAuthServices.ensureAuthenticated,
  surchargeControllers.readAllSurcharge
);

router.get(
  "/surcharge/read-active",
  // adminAuthServices.ensureAuthenticated,
  surchargeControllers.readActiveSurcharge
);

// router.post("/discount/read-allv2", discountControllers.readAllDiscounts);

router.put(
  "/surcharge/delete/:id",
  adminAuthServices.ensureAuthenticated,
  surchargeControllers.deleteSurcharge
);

module.exports = router;
