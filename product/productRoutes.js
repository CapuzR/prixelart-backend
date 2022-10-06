'use strict'

const express = require('express');
const router = express.Router();
const adminAuthServices = require('../admin/adminServices/adminAuthServices');
const productControllers = require('./productControllers');


router.post('/product/create', adminAuthServices.ensureAuthenticated, productControllers.upload.array('productImages', 4) , productControllers.createProduct);
router.post('/product/read', productControllers.readById);
router.delete('/product/delete/:id', productControllers.deleteProduct);
router.get('/product/read-all', productControllers.readAllProducts);
router.put('/product/update/:id', adminAuthServices.ensureAuthenticated, productControllers.upload.fields([{name:'newProductImages', maxCount: 4}, {name: 'variantImage', maxCount: 1}]) , productControllers.updateProduct);

module.exports = router;
