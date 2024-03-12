"use strict";

const express = require("express");
const router = express.Router();
const userMdw = require("./userMiddlewares");
const userControllers = require("./userControllers/userControllers");
const userAuthControllers = require("./userControllers/userAuthControllers");
const adminAuthServices = require("../admin/adminServices/adminAuthServices");
router.post("/login", userAuthControllers.login);
router.post("/register", userAuthControllers.register);
router.post("/logout", userAuthControllers.logout);
router.post(
  "/password-change",
  userMdw.ensureAuthenticated,
  userAuthControllers.changePassword
);

router.post("/forgot-password", userAuthControllers.forgotPassword);
router.post("/reset-password", userAuthControllers.resetPassword); //token, newPassword
router.post("/pw-token-check", userAuthControllers.checkPasswordToken); //token

router.get(
  "/user/read",
  userMdw.ensureAuthenticated,
  userControllers.readUserById
);
router.post(
  "/update-user-data",
  userMdw.ensureAuthenticated,
  userControllers.updateUser
);
router.post(
  "/emergency-reset",
  adminAuthServices.ensureAuthenticated,
  userAuthControllers.resetByAdmin
);

module.exports = router;
