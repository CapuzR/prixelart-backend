import { Router } from "express";
import * as userAuthControllers from "../user/userControllers/userAuthControllers";
import * as manufacturerControllers from "./manufacturerControllers";

const router: Router = Router();

//Esta todo sin hacer, solo se cambió la palabra prixer por manufacturer
router.post('/manufacturer-registration', userAuthControllers.ensureAuthenticated, manufacturerControllers.createManufacturer);
router.post('/manufacturer/read', manufacturerControllers.readManufacturer);
router.get('/manufacturer/read-all', manufacturerControllers.readAllManufacturers);
router.post('/manufacturer/update', userAuthControllers.ensureAuthenticated, manufacturerControllers.updateManufacturer);

export default router;
