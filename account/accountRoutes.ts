import { Router } from "express";
import * as accountControllers from "./accountControllers";
import * as adminAuthControllers from "../admin/adminControllers/adminAuthControllers";
import * as userAuthControllers from "../user/userControllers/userAuthControllers";

const router: Router = Router();

router.post("/account/readById", userAuthControllers.ensureAuthenticated, accountControllers.checkBalance);
router.post("/account/readAll", adminAuthControllers.ensureAuthenticated, accountControllers.readAll);

export default router;
