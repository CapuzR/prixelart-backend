'use strict'

const express = require('express');
const router = express.Router();
const manufacturerMiddlewares = require('./manufacturerMiddlewares');
const userMdw = require('../user/userMiddlewares');
const manufacturerControllers = require('./manufacturerControllers');

//Esta todo sin hacer, solo se cambió la palabra prixer por manufacturer
router.post('/manufacturer-registration', userMdw.ensureAuthenticated, manufacturerControllers.createManufacturer);
router.post('/manufacturer/read', manufacturerControllers.readManufacturer);
router.get('/manufacturer/read-all', manufacturerControllers.readAllManufacturers);
router.get('/manufacturer/read-all-full', manufacturerControllers.readAllManufacturersFull);
router.post('/manufacturer/update', userMdw.ensureAuthenticated, manufacturerMiddlewares.avatarUpload, manufacturerControllers.updateManufacturer);

module.exports = router;