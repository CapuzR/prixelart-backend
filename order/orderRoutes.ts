import express from "express";
import * as orderControllers from "./orderControllers.ts";
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts";
import * as userAuthControllers from "../user/userControllers/userAuthControllers.ts";

const router = express.Router();

// Order Routes
router.post("/order/create", adminControllers.ensureAuthenticated, orderControllers.createOrder);
router.post("/order/createv2", userAuthControllers.ensureAuthenticated, orderControllers.createOrder4Client);
router.get("/order/read/:id", orderControllers.readOrder);
router.get("/order/read-all", adminControllers.ensureAuthenticated, orderControllers.readAllOrders);
router.post("/order/byEmail", orderControllers.readOrdersByEmail);

router.get('/orders', adminControllers.ensureAuthenticated, orderControllers.getGlobalOrders);
router.get('/stats', adminControllers.ensureAuthenticated, orderControllers.getGlobalDashboardStats);
router.get('/top-items', adminControllers.ensureAuthenticated, orderControllers.getGlobalTopPerformingItems);

router.put("/order/addVoucher/:id", orderControllers.addVoucher);
router.put("/order/update/:id", adminControllers.ensureAuthenticated, orderControllers.updateOrder);
router.delete("/order/delete/:id", adminControllers.ensureAuthenticated, orderControllers.deleteOrder);

// Payment Method Routes
router.post("/payment-method/create", adminControllers.ensureAuthenticated, orderControllers.createPaymentMethod);
router.get("/payment-method/read/:id", adminControllers.ensureAuthenticated, orderControllers.readPaymentMethod);
router.get("/payment-method/read-all", adminControllers.ensureAuthenticated, orderControllers.readAllPaymentMethods);
router.get("/payment-method/read-all-active", orderControllers.readAllActivePaymentMethods);
router.put("/payment-method/update", adminControllers.ensureAuthenticated, orderControllers.updatePaymentMethod);
router.delete("/payment-method/delete/:id", adminControllers.ensureAuthenticated, orderControllers.deletePaymentMethod);

// Shipping Method Routes
router.post("/shipping-method/create", adminControllers.ensureAuthenticated, orderControllers.createShippingMethod);
router.get("/shipping-method/read/:id", adminControllers.ensureAuthenticated, orderControllers.readShippingMethod);
router.get("/shipping-method/read-all", adminControllers.ensureAuthenticated, orderControllers.readAllShippingMethod);
router.get("/shipping-method/read-all-active", orderControllers.readAllActiveShippingMethod);
router.put("/shipping-method/update", adminControllers.ensureAuthenticated, orderControllers.updateShippingMethod);
router.delete("/shipping-method/delete/:id", adminControllers.ensureAuthenticated, orderControllers.deleteShippingMethod);

export default router;
