'use strict'

const express = require('express');
const router = express.Router();
const orderControllers = require('./orderControllers');
const adminAuthServices = require('../admin/adminServices/adminAuthServices');

// Order
router.post('/order/create', adminAuthServices.ensureAuthenticated, orderControllers.createOrder);
router.post('/order/read', adminAuthServices.ensureAuthenticated, orderControllers.readOrder);
router.post('/order/read-all', adminAuthServices.ensureAuthenticated, orderControllers.readAllOrders);
router.post('/order/update', adminAuthServices.ensureAuthenticated, orderControllers.updateOrder);

// Payment Method
router.post('/payment-method/create', adminAuthServices.ensureAuthenticated, orderControllers.createPaymentMethod);
router.post('/payment-method/read', adminAuthServices.ensureAuthenticated, orderControllers.readPaymentMethod);
router.post('/payment-method/read-all', adminAuthServices.ensureAuthenticated, orderControllers.readAllPaymentMethods);
router.post('/payment-method/update', adminAuthServices.ensureAuthenticated, orderControllers.updatePaymentMethod);

// Order Payment
router.post('/order-payment/create', adminAuthServices.ensureAuthenticated, orderControllers.createOrderPayment);
router.post('/order-payment/read', adminAuthServices.ensureAuthenticated, orderControllers.readOrderPayment);
router.post('/order-payment/read-all', adminAuthServices.ensureAuthenticated, orderControllers.readAllOrderPayments);
router.post('/order-payment/update', adminAuthServices.ensureAuthenticated, orderControllers.updateOrderPayment);


module.exports = router;