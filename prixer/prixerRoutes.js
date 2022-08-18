'use strict'

const express = require('express');
const router = express.Router();
const prixerMiddlewares = require('./prixerMiddlewares');
const userMdw = require('../user/userMiddlewares');
const prixerControllers = require('./prixerControllers');

router.post('/prixer-registration', userMdw.ensureAuthenticated, prixerControllers.createPrixer);
router.post('/prixer/read', prixerControllers.readPrixer);
router.get('/prixer/read-all', prixerControllers.readAllPrixers);
router.get('/prixer/read-all-full', prixerControllers.readAllPrixersFull);
router.post('/prixer/update', userMdw.ensureAuthenticated, prixerMiddlewares.avatarUpload, prixerControllers.updatePrixer);

module.exports = router;