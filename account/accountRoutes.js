"use strict";

const express = require("express");
const router = express.Router();
const accountControllers = require("./accountControllers");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
const userMdw = require("../user/userMiddlewares");

// const adminAuthServices = require("../admin/adminServices/adminAuthServices");
// const userMdw = require("../user/userMiddlewares");
// const prixerControllers = require("./prixerControllers");
// const prixerServices = require("./prixerServices");
// const userControllers = require("./userControllers/userControllers");
// const userAuthControllers = require("./userControllers/userAuthControllers");

router.post(
  "/account/create",
  adminAuthServices.ensureAuthenticated,
  accountControllers.createAccount
);

router.post(
  "/account/readById",
  userMdw.ensureAuthenticated,
  accountControllers.checkBalance
);

router.post(
  "/account/readAll",
  adminAuthServices.ensureAuthenticated,
  accountControllers.readAll
);

module.exports = router;
