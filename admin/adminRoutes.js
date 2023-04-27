"use strict";

const express = require("express");
const router = express.Router();
const adminControllers = require("./adminControllers/adminControllers");
const adminAuthControllers = require("./adminControllers/adminAuthControllers");
const adminAuthServices = require("./adminServices/adminAuthServices");
const productControllers = require("../product/productControllers");
const preferencesRoutes = require("../preferences/preferencesRoutes");

// Login
router.post("/admin/login", adminAuthControllers.adminLogin);

// Admin
router.post(
  "/admin/create",
  adminAuthServices.ensureAuthenticated,
  adminAuthControllers.createAdmin
);
router.post(
  "/admin/read",
  adminAuthServices.ensureAuthenticated,
  adminControllers.readAdmin
);
router.post(
  "/admin/read-all",
  adminAuthServices.ensureAuthenticated,
  adminControllers.readAllAdmins
);
router.post(
  "/admin/read-products",
  adminAuthServices.ensureAuthenticated,
  productControllers.readAllProductsAdmin
);
router.post(
  "/admin/update",
  adminAuthServices.ensureAuthenticated,
  adminControllers.updateAdmin
);
router.use(
  "/admin/preferences",
  // adminAuthServices.ensureAuthenticated,
  preferencesRoutes
);

router.delete(
  "/admin/delete/:username",
  adminAuthServices.ensureAuthenticated,
  adminControllers.deleteAdmin
);

// Admin Roles
router.post(
  "/adminRole/create",
  adminAuthServices.ensureAuthenticated,
  adminControllers.createAdminRole
);

router.post(
  "/admin/read-roles",
  adminAuthServices.ensureAuthenticated,
  adminControllers.readAdminRoles
);
module.exports = router;
