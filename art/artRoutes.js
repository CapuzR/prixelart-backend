"use strict";

const express = require("express");
const router = express.Router();
const userMdw = require("../user/userMiddlewares");
const artControllers = require("./artControllers");
const artMiddlewares = require("./artMiddlewares");
const adminAuthServices = require('../admin/adminServices/adminAuthServices');
//TODO

router.post(
  "/art/create",
  userMdw.ensureAuthenticated,
  artMiddlewares.uploadThumbnail,
  artControllers.createArt
);
router.get("/art/get-by-id/:id", artControllers.getOneById);
router.post("/art/read-by-prixer", artControllers.readAllByUsername);
router.get("/art/read-all", artControllers.readAllArts);
router.get("/art/read-by-query", artControllers.readByQuery);
router.get(
  "/art/read-by-username-by-query",
  artControllers.readByUsernameByQuery
);
router.post("/art/read-by-id", artControllers.readOneById);
router.get("/art/random", artControllers.randomArts);
router.put(
  "/art/update/:id",
  userMdw.ensureAuthenticated,
  artControllers.updateArt
);
router.delete(
  "/art/delete/:id",
  userMdw.ensureAuthenticated,
  artControllers.deleteArt
);
router.put(
  "/art/disable/:id",
  adminAuthServices.ensureAuthenticated,
  artControllers.disableArt
);

module.exports = router;
