'use strict'

const express = require('express');
const router = express.Router();
const userMdw = require('../user/userMiddlewares');
const artControllers = require('./artControllers');
const artMiddlewares = require('./artMiddlewares');

//TODO

router.post('/art/create', userMdw.ensureAuthenticated, artMiddlewares.uploadThumbnail, artControllers.createArt);
router.post('/art/read-by-prixer', artControllers.readAllByUsername);
router.get('/art/read-all', artControllers.readAllArts);
router.get('/art/read-by-query', artControllers.readByQuery);
router.get('/art/read-by-username-by-query', artControllers.readByUsernameByQuery);
router.post('/art/read-by-id', artControllers.readOneById);
router.get('/art/random', artControllers.randomArts);
router.post('/art/update', userMdw.ensureAuthenticated, artControllers.updateArt);
// router.post('/art/disable', userMdw.ensureAuthenticated, artControllers.disableArt);

module.exports = router;