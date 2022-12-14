"use strict";

const express = require("express");
const router = express.Router();
const userMdw = require("../user/userMiddlewares");
const artControllers = require("./artControllers");
const artMiddlewares = require("./artMiddlewares");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
//TODO

router.post(
  "/art/create",
  userMdw.ensureAuthenticated,
  artMiddlewares.uploadThumbnail,
  artControllers.createArt
);
router.get("/art/get-by-id/:id", artControllers.getOneById);
router.post("/art/read-by-prixer", artControllers.readAllByUsername);
router.get("/art/read-by-prixerid", artControllers.readAllByPrixerId);
router.get("/art/read-all", artControllers.readAllArts);
router.get("/art/read-by-query", artControllers.readByQuery);
router.get(
  "/art/read-by-query-and-category",
  artControllers.readByQueryAndCategory
);
router.get("/art/read-by-category", artControllers.readByCategory);
router.get(
  "/art/read-by-username-query-and-category",
  artControllers.readByUsernameQueryAndCategory
);
router.get(
  "/art/read-by-username-and-category",
  artControllers.readByUsernameAndCategory
);
router.get(
  "/art/read-by-username-and-query",
  artControllers.readByUsernameAndQuery
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
router.put(
  "/art/rank/:id",
  adminAuthServices.ensureAuthenticated,
  artControllers.rankArt
);

module.exports = router;
