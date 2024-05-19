import { Router } from "express";
import { changePassoword, forgot_password, getProfile, getlogin, login, logout, register, reset_password, updateUser } from "../controllers/user.controller.js";
import { authorizedRoles, isLoogedIn } from "../middlewares/auth.middleware.js";
import { updateCourse } from "../controllers/course.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { addProduct, deleteProduct, getProduct, updateProduct } from "../controllers/product.controller.js";

const userRoutes=Router() 


userRoutes.post('/register',upload.single("avatar"),register)
userRoutes.post('/login',login)
userRoutes.get('/logout',logout) 
userRoutes.get('/me',  getProfile)
userRoutes.post('/forgot_password',forgot_password)
userRoutes.post('/reset_password/:resetToken',reset_password)
userRoutes.post('/changed-password',isLoogedIn,changePassoword)
userRoutes.put('/update',isLoogedIn,updateUser)
userRoutes.get('/getlogin',getlogin)

// isLoogedIn,
// authorizedRoles('ADMIN'),


userRoutes.post('/product',isLoogedIn,authorizedRoles('ADMIN'),upload.single("productImage"),addProduct)
userRoutes.get("/product",isLoogedIn,authorizedRoles('ADMIN'),getProduct)
userRoutes.delete("/product/:id",isLoogedIn,authorizedRoles('ADMIN'),deleteProduct)
userRoutes.put("/product/:id",isLoogedIn,authorizedRoles('ADMIN'),upload.single("productImage"),updateProduct)


export default userRoutes