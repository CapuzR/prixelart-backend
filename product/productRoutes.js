'use strict'

const express = require('express');
const router = express.Router();
const adminAuthServices = require('../admin/adminServices/adminAuthServices');
const productControllers = require('./productControllers');


router.post('/product/create', adminAuthServices.ensureAuthenticated, productControllers.upload.array('productImages', 4) , productControllers.createProduct);
router.post('/product/read', productControllers.readById);
router.delete('/product/delete/:id', productControllers.deleteProduct);
router.get('/product/read-all', productControllers.readAllProducts);
router.put('/product/update/:id', adminAuthServices.ensureAuthenticated, productControllers.upload.array('newProductImages', 4) , productControllers.updateProduct);
router.put('/product/create/variant/:id', productControllers.upload.single('variantImage'), productControllers.updateProductWithVariants);

module.exports = router;
