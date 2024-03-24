import { Router } from "express";
import { changePassoword, forgot_password, getProfile, getlogin, login, logout, register, reset_password, updateUser } from "../controllers/user.controller.js";
import { isLoogedIn } from "../middlewares/auth.middleware.js";
import { updateCourse } from "../controllers/course.controller.js";
import upload from "../middlewares/multer.middleware.js";

const userRoutes=Router()


userRoutes.post('/register',upload.single("avatar"),register)
userRoutes.post('/login',login)
userRoutes.get('/logout',logout) 
userRoutes.get('/me', isLoogedIn, getProfile)
userRoutes.post('/forgot_password',forgot_password)
userRoutes.post('/reset_password/:resetToken',reset_password)
userRoutes.post('/changed-password',isLoogedIn,changePassoword)
userRoutes.put('/update',isLoogedIn,updateUser)
userRoutes.get('/getlogin',getlogin)



export default userRoutes