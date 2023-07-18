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

// ChechPermissions
router.post("/admin/CheckPermissions", adminAuthServices.checkPermissions);
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
router.put(
  "/admin/update/:id",
  adminAuthServices.ensureAuthenticated,
  adminControllers.updateAdmin
);
router.use(
  "/admin/preferences",
  adminAuthServices.ensureAuthenticated,
  preferencesRoutes
);

router.delete(
  "/admin/delete/:username",
  adminAuthServices.ensureAuthenticated,
  adminControllers.deleteAdmin
);

router.get("/admin/getSellers", adminControllers.getSellers);
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

router.put(
  "/adminRole/update/:id",
  adminAuthServices.ensureAuthenticated,
  adminControllers.updateAdminRole
);
router.delete(
  "/adminRole/delete/:id",
  adminAuthServices.ensureAuthenticated,
  adminControllers.deleteAdminRole
);
module.exports = router;
