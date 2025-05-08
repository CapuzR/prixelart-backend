import express from "express";
import { readAllOrgFull, updateBio } from "./organizationControllers";
import * as userAuthControllers from "../user/userControllers/userAuthControllers";

const router = express.Router();

router.get("/organization/read-all", readAllOrgFull);

router.put("/organization/updateBio/:id", userAuthControllers.ensureAuthenticated, updateBio);

export default router;
