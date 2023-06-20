"use strict";

const express = require("express");
const router = express.Router();
const accountControllers = require("./accountControllers");
// const adminAuthServices = require("../admin/adminServices/adminAuthServices");

// const adminAuthServices = require("../admin/adminServices/adminAuthServices");
// const userMdw = require("../user/userMiddlewares");
// const prixerControllers = require("./prixerControllers");
// const prixerServices = require("./prixerServices");
// const userControllers = require("./userControllers/userControllers");
// const userAuthControllers = require("./userControllers/userAuthControllers");

router.post(
  "/account/create",
  //   adminAuthServices.ensureAuthenticated,
  accountControllers.createAccount
);

module.exports = router;
