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
router.put(
  "/discount/update",
  adminAuthServices.ensureAuthenticated,
  discountControllers.updateDiscount
);
// router.post(
//   "/discount/read",
//   adminAuthServices.ensureAuthenticated,
//   discountControllers.readById
// );

router.get(
  "/discount/read-allv1",
  adminAuthServices.ensureAuthenticated,
  discountControllers.readAllDiscountsAdmin
);

router.post("/discount/read-allv2", discountControllers.readAllDiscounts);

router.put(
  "/discount/delete/:id",
  adminAuthServices.ensureAuthenticated,
  discountControllers.deleteDiscount
);

module.exports = router;
