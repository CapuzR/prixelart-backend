import express from "express";
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts";
import * as userControllers from "./userControllers/userControllers.ts";
import * as userAuthControllers from "./userControllers/userAuthControllers.ts";

const router = express.Router();

router.post("/login", userAuthControllers.login);
router.post("/register", userAuthControllers.register);
router.post("/logout", userAuthControllers.logout);
router.get("/me", userAuthControllers.ensureAuthenticated, userControllers.readMyUser)
router.post("/password-change", userAuthControllers.ensureAuthenticated, userAuthControllers.changePassword);
router.post("/forgot-password", userAuthControllers.forgotPassword);
router.post("/reset-password", userAuthControllers.resetPassword);
router.post("/pw-token-check", userAuthControllers.checkPasswordToken);
router.get("/user/read/:id", adminControllers.ensureAuthenticated, userControllers.readUserById);
router.get("/user/read-all", adminControllers.ensureAuthenticated, userControllers.readAllUsers);
router.post("/users/by-ids", adminControllers.ensureAuthenticated, userControllers.getUsersByIds);
router.post("/user/create", adminControllers.ensureAuthenticated, userControllers.createUser);
router.put("/user/update/:id", adminControllers.ensureAuthenticated, userControllers.updateUser);
router.delete("/user/delete/:username", adminControllers.ensureAuthenticated, userControllers.deleteUser);
router.post("/user/getByAccount", adminControllers.ensureAuthenticated, userControllers.readUserByAccount);
router.post("/emergency-reset", adminControllers.ensureAuthenticated, userAuthControllers.resetByAdmin);

export default router;