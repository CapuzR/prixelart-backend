"use strict";

const express = require("express");
const router = express.Router();
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const productControllers = require("./productControllers");

router.post(
  "/product/create",
  adminAuthServices.ensureAuthenticated,
  productControllers.upload.array("productImages", 4),
  productControllers.createProduct
);
router.post("/product/read", productControllers.readById);
router.put(
  "/product/delete/:id",
  adminAuthServices.ensureAuthenticated,
  productControllers.deleteProduct
);
router.get("/product/read-all", productControllers.readAllProducts);
router.post(
  "/product/read-all-admin",
  // adminAuthServices.ensureAuthenticated,
  productControllers.readAllProductsAdmin
);

router.put(
  "/product/update/:id",
  adminAuthServices.ensureAuthenticated,
  productControllers.upload.fields([
    { name: "newProductImages", maxCount: 4 },
    { name: "variantImage", maxCount: 4 },
  ]),
  productControllers.updateProduct
);
router.put(
  "/product/updateVariants/:id",
  adminAuthServices.ensureAuthenticated,
  productControllers.upload.array("variantImage", 4),
  productControllers.updateVariants
);
router.put(
  "/product/deleteVariant",
  adminAuthServices.ensureAuthenticated,
  productControllers.deleteVariant
);

module.exports = router;
