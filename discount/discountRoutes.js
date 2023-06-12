"use strict";

const express = require("express");
const router = express.Router();
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const discountControllers = require("./discountControllers");

router.post(
  "/discount/create",
  adminAuthServices.ensureAuthenticated,
  discountControllers.createDiscount
);
// router.post(
//   "/discount/read",
//   adminAuthServices.ensureAuthenticated,
//   discountControllers.readById
// );

router.post(
  "/discount/read-allv1",
  adminAuthServices.ensureAuthenticated,
  discountControllers.readAllDiscountsAdmin
);

// router.put(
//   "/discount/update/:id",
//   adminAuthServices.ensureAuthenticated,
//   discountControllers.updateDiscount
// );

// router.put(
//   "/discount/deleteDiscount",
//   adminAuthServices.ensureAuthenticated,
//   discountControllers.deleteDiscount
// );

module.exports = router;
