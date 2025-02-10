"use strict"

const express = require("express")
const router = express.Router()
const orderControllers = require("./orderControllers")
const adminAuthServices = require("../admin/adminServices/adminAuthServices")
const userMdw = require("../user/userMiddlewares")

// Order
router.post(
  "/order/create",
  adminAuthServices.ensureAuthenticated,
  orderControllers.createOrder
)
router.post("/order/createv2", orderControllers.createOrder4Client)
router.post("/order/sendEmail", orderControllers.sendEmail)

router.post(
  "/order/read",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readOrder
)

router.post("/order/readByPrixer", orderControllers.readOrder)
router.get("/order/readById/:id", orderControllers.readOrderByShred)
router.get("/order/getClients",  adminAuthServices.ensureAuthenticated,
  orderControllers.readAllOrdersClients)
router.post(
  "/order/read-all",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readAllOrders
)
router.post(
  "/order/read-allv2",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readAllOrdersv2
)
router.post(
  "/order/byPrixer",
  userMdw.ensureAuthenticated,
  orderControllers.readOrdersByPrixer
)
router.post("/order/byEmail", orderControllers.readOrdersByEmail)

router.put(
  "/order/addVoucher/:id",
  orderControllers.upload.single("paymentVoucher"),
  orderControllers.addVoucher
)
router.put(
  "/order/update/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateOrder
)
router.put(
  "/order/updatePayStatus/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateOrderPayStatus
)
router.put(
  "/order/updateSeller/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateSeller
)

router.put(
  "/order/updateItemStatus",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateItemStatus
)

router.put(
  "/order/addComissions",
  adminAuthServices.ensureAuthenticated,
  orderControllers.addComissions
)
router.delete(
  "/order/delete/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.deleteOrder
)

// Payment Method
router.post(
  "/payment-method/create",
  adminAuthServices.ensureAuthenticated,
  orderControllers.createPaymentMethod
)
router.post(
  "/payment-method/read",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readPaymentMethod
)
router.post(
  "/payment-method/read-all",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readAllPaymentMethods
)
router.get(
  "/payment-method/read-all-v2",
  orderControllers.readAllPaymentMethodsV2
)
router.put(
  "/payment-method/update",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updatePaymentMethod
)
router.put(
  "/payment-method/delete/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.deletePaymentMethod
)
// Shipping method

router.post(
  "/shipping-method/create",
  adminAuthServices.ensureAuthenticated,
  orderControllers.createShippingMethod
)

router.post(
  "/shipping-method/read-all",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readAllShippingMethod
)

router.get(
  "/shipping-method/read-all-v2",
  orderControllers.readAllShippingMethodV2
)
router.put(
  "/shipping-method/update",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateShippingMethod
)

router.delete(
  "/shipping-method/delete/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.deleteShippingMethod
)

module.exports = router
