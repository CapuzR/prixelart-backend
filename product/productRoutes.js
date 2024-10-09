"use strict";

const express = require("express");
const router = express.Router();
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const productControllers = require("./productControllers");
const userMdw = require("../user/userMiddlewares");

router.post(
  "/product/create",
  adminAuthServices.ensureAuthenticated,
  productControllers.upload.array("productImages", 4),
  productControllers.createProduct
);
router.post("/product/read", productControllers.readById);
router.post("/product/read_v2", productControllers.readById_v2);
router.put(
  "/product/delete/:id",
  adminAuthServices.ensureAuthenticated,
  productControllers.deleteProduct
);
router.post(
  "/product/read-allv1",
  adminAuthServices.ensureAuthenticated,
  productControllers.readAllProductsAdmin
);
router.get("/product/read-all", productControllers.readAllProducts);
router.get("/product/read-all-v2",
  userMdw.isAuth,
  productControllers.readAllProducts_v2
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
  "/product/updateMockup/:id",
  adminAuthServices.ensureAuthenticated,
  productControllers.upload.single("newMockupImg"),
  productControllers.updateMockup
);

router.get("/product/bestSellers", productControllers.readBestSellers);
router.put(
  "/product/updateMany",
  adminAuthServices.ensureAuthenticated,
  productControllers.updateMany
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
router.get("/mockupImages/:productId", productControllers.readUrl);

router.get(
  "/product/read-categories",
  productControllers.readAllCategories
);

router.get(
  "/product/read-active-categories",
  productControllers.readActiveCategories
);

module.exports = router;
