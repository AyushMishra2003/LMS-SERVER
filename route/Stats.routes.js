import { Router } from "express";
import { userStat } from "../controllers/Stats.controller.js";
import { authorizedRoles, isLoogedIn } from "../middlewares/auth.middleware.js";



const stats=Router()

stats.get("/",authorizedRoles('ADMIN'), userStat)



export default stats