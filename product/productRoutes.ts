//--- File: product/productRoutes.ts ---

import express from "express"
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts"
import * as productControllers from "./productControllers.ts"
import * as userAuthControllers from "../user/userControllers/userAuthControllers.ts"

const router = express.Router()

router.post(
  "/product/create",
  adminControllers.ensureAuthenticated,
  productControllers.createProduct
)

router.get(
  "/product/read/:id",
  adminControllers.ensureAuthenticated,
  productControllers.readById
)
router.get("/product/read-active/:id", productControllers.readActiveById)

router.get(
  "/product/getVariantPrice",
  userAuthControllers.ensureAuthenticated,
  productControllers.getVariantPrice
)
router.delete(
  "/product/delete/:id",
  adminControllers.ensureAuthenticated,
  productControllers.deleteProduct
)
router.get(
  "/product/read-all",
  adminControllers.ensureAuthenticated,
  productControllers.readAllProducts
)
router.get("/product/read-all-active", productControllers.readAllActiveProducts)

router.get(
  "/product/unique-production-lines",
  adminControllers.ensureAuthenticated,
  productControllers.getUniqueProductionLines
)

router.put(
  "/product/update/:id",
  adminControllers.ensureAuthenticated,
  productControllers.updateProduct
)

router.get("/product/bestSellers", productControllers.readBestSellers)

router.get("/product/tufotodivertida-special", productControllers.getTuFotoDivertidaProducts);

router.delete(
  "/product/deleteVariant",
  adminControllers.ensureAuthenticated,
  productControllers.deleteVariant
)

export default router