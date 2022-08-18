'use strict'

const express = require('express');
const router = express.Router();
const adminAuthServices = require('../admin/adminServices/adminAuthServices');
const productControllers = require('./productControllers');

router.post('/product/create', adminAuthServices.ensureAuthenticated, productControllers.createProduct);
router.post('/product/read', productControllers.readById);
router.get('/product/read-all', productControllers.readAllProducts);
router.post('/product/update', adminAuthServices.ensureAuthenticated, productControllers.updateProduct);

module.exports = router;