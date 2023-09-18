"use strict";

const express = require("express");
const router = express.Router();
const orderControllers = require("./orderControllers");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");

// Order
router.post(
  "/order/create",
  adminAuthServices.ensureAuthenticated,
  orderControllers.createOrder
);
router.post("/order/createv2", orderControllers.createOrder4Client);
router.post("/order/sendEmail", orderControllers.sendEmail);

router.post(
  "/order/read",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readOrder
);
router.post(
  "/order/read-all",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readAllOrders
);
router.post("/order/byPrixer", orderControllers.readOrdersByPrixer);
router.put(
  "/order/addVoucher/:id",
  orderControllers.upload.single("paymentVoucher"),
  orderControllers.addVoucher
);
router.put(
  "/order/update/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateOrder
);
router.put(
  "/order/updatePayStatus/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateOrderPayStatus
);
router.put(
  "/order/updateSeller/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateSeller
);

router.put(
  "/order/updateItemStatus",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateItemStatus
);

router.delete(
  "/order/delete/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.deleteOrder
);

// Payment Method
router.post(
  "/payment-method/create",
  adminAuthServices.ensureAuthenticated,
  orderControllers.createPaymentMethod
);
router.post(
  "/payment-method/read",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readPaymentMethod
);
router.post(
  "/payment-method/read-all",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readAllPaymentMethods
);
router.get(
  "/payment-method/read-all-v2",
  orderControllers.readAllPaymentMethodsV2
);
router.put(
  "/payment-method/update",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updatePaymentMethod
);
router.put(
  "/payment-method/delete/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.deletePaymentMethod
);
// Shipping method

router.post(
  "/shipping-method/create",
  adminAuthServices.ensureAuthenticated,
  orderControllers.createShippingMethod
);

router.post(
  "/shipping-method/read-all",
  adminAuthServices.ensureAuthenticated,
  orderControllers.readAllShippingMethod
);

router.get(
  "/shipping-method/read-all-v2",
  orderControllers.readAllShippingMethodV2
);
router.put(
  "/shipping-method/update",
  adminAuthServices.ensureAuthenticated,
  orderControllers.updateShippingMethod
);

router.put(
  "/shipping-method/delete/:id",
  adminAuthServices.ensureAuthenticated,
  orderControllers.deleteShippingMethod
);
// Order Payment
// router.post(
//   "/order-payment/create",
//   adminAuthServices.ensureAuthenticated,
//   orderControllers.createOrderPayment
// );
// router.post(
//   "/order-payment/read",
//   adminAuthServices.ensureAuthenticated,
//   orderControllers.readOrderPayment
// );
// router.post(
//   "/order-payment/read-all",
//   adminAuthServices.ensureAuthenticated,
//   orderControllers.readAllOrderPayments
// );
// router.post(
//   "/order-payment/update",
//   adminAuthServices.ensureAuthenticated,
//   orderControllers.updateOrderPayment
// );

// Excel
router.get(
  "/downloadOrders",
  adminAuthServices.ensureAuthenticated,
  orderControllers.downloadOrders
);
module.exports = router;
