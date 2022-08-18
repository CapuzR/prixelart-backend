'use strict'

const express = require('express');
const router = express.Router();
const consumerControllers = require('./consumerControllers');
const adminAuthServices = require('../admin/adminServices/adminAuthServices');

// Incapaz de crear el usuario.
router.post('/consumer/create', adminAuthServices.ensureAuthenticated, consumerControllers.createConsumer);
router.post('/consumer/read', adminAuthServices.ensureAuthenticated, consumerControllers.readConsumer);
router.post('/consumer/read-by-query', adminAuthServices.ensureAuthenticated, consumerControllers.readConsumerByQuery);
router.post('/consumer/read-all', adminAuthServices.ensureAuthenticated, consumerControllers.readAllConsumers);
router.post('/consumer/update', adminAuthServices.ensureAuthenticated, consumerControllers.updateConsumer);

module.exports = router;