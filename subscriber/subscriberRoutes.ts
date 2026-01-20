import express, { Router } from "express"
import * as subscriberControllers from "./subscriberControllers.ts"

const router: Router = express.Router()


router.post("/send-wallpaper", subscriberControllers.handleWallpaperRequest);

export default router 