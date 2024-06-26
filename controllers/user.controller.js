import express from "express"
import User from "../models/user.model.js"
import AppError from "../utils/error.util.js"
import emailValidator from 'email-validator'
import sendEmail from "../utils/sendEmail.js"
import nodemailer from 'nodemailer'
import cloudinary from 'cloudinary'
import crypto from 'crypto'
import fs from 'fs/promises'
const cokkieOption={ 
    secure:process.env.NODE_ENV==='production'?true:false,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
}


const register=async(req,res,next)=>{
    const {fullName,email,password,role}=req.body
    if(!fullName || !email  || !password){
        return next(new AppError('All fields are required',400))
    }
    const userExists=await User.findOne({email})
    
    if(userExists){
       return next(new AppError('Email already exits',400))
    }
    if(fullName.length<5 || password.length<5){
        return next(new AppError('Number or Password should be atleast 5 character'))
    }
    const validEmail=emailValidator.validate(email)
    if(!validEmail){
        return next(new AppError('Email is not valid',400))
    }
    const user=await User.create({
       fullName,
       email,
       password,  
       avatar:{
        public_id:'',
        secure_url:''
       }
    })
    if(!user){
        return next(new AppError('User registraction failed',400))
    }
    // FILE UPLOAD
    console.log(req.file);
    if(req.file){
        try{
         const result=await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'lms',
            width:250,
            height:250,
            gravity:'faces',
            crop:'fill'
         })
         if(result){
            user.avater.public_id=result.public_id;
            // user.avatar.secure_url=result.secure_url;
            user.avater.secure_url=result.secure_url
            // Remove file
            fs.rm(`uploads/${req.file.filename}`)
         }
        }catch(e){  
           return next(
            new AppError("File not uploaded please try later",500)
           )    
        }
    }
 
    await user.save()
    
    user.password=undefined
    if(role){
        user.role=role
    }
    const token=await user.generateJWTToken()

    res.cookie('token',token,cokkieOption)

    res.status(200).json({
        success:true,
        "message":"REGISTRED SUCCEFULLY",
        user
    })
}


const login=async(req,res,next)=>{
  try{
   const {email,password}=req.body
   if(!email || !password){
    return next(new AppError('All fields are required',400))
   }
   
   const user=await User.findOne({
        email
   }).select('+password')

   
   const isPassword=await user.comparePassword(password);
   if(!user || !isPassword){
    return next(new AppError('Email or Password not matched',400))
   }
   const token=await user.generateJWTToken()
  
   console.log(res.cookie);


   console.log(token);

   user.password=undefined
   res.cookie('token',token,cokkieOption)

   console.log(res.cookie);
//    res.cookie('token', token, {
//     httpOnly: true,
//     secure: false, // Set to true if using HTTPS
//     sameSite: 'none', // Change if needed based on your CORS configuration
//     maxAge: 7 * 24 * 60 * 60 * 1000, // Example for a 7-day expiry
//   });


   res.status(200).json({
    success:true,
    "message":"Login Succesfully",
    user,
   })
}catch(e){
    return next(new AppError("Bad request is not found",500))
}
}


const logout=(req,res)=>{

    res.cookie('token',null,{
        secure:true,
        maxAge:0,
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:"User logged out successfully"
    })
}


const getProfile=async(req,res,next)=>{
try{
   console.log("profile-1"); 
   const { id } = req.query; // Assuming id is passed as a query parameter
   console.log(id);
//    console.log(req.user.id);
   console.log("profile-2");
   const user=await User.findById(id)
   if(!user){
      return next(new AppError("User not Found",400))
   }
   console.log("profile-3");
   res.status(200).json({
    success:true,
    message:"User detial",
    user
   })
   console.log("profile-4");
}catch(error){
    console.log(error);
}
}

const  forgot_password = async (req, res, next) => {
        const { email } = req.body
        console.log(email);
        if (!email) {
            return next(new AppError("Email is Required", 400))
        }
    
        // Finding the user with the provided email
        const user = await User.findOne({ email })
    
        // Handling scenarios where the user is not found
        if (!user) {
            return next(new AppError("Email is not registered", 400))
        }

        const resetToken = await user.generatePasswordResetToken()
        await user.save()
    
        const resetPasswordURL = `http://localhost:5000/reset-password/${resetToken}`
        console.log(resetPasswordURL);
        const subject = 'Reset Password'
        const message = `Reset your Password by clicking on this link <a href=${resetPasswordURL}/>`
        

        try {
            console.log("ayu3");
            await sendEmail(email,subject,message)
            console.log("ayu4");
            res.status(200).json({
                success: true,
                message: 'Password reset link has been sent to your email'
            })
    
    
        } catch (e) {
            user.forgotPasswordToken= undefined
            user.forgotPasswordExpiry = undefined
    
            await user.save()
            return next(new AppError(e.message, 500))
        }
    
}
    

const reset_password=async(req,res,next)=>{
    const {resetToken}=req.params;
    console.log(resetToken);
    const {password}=req.body

    // const forgotPasswordToken=crypto
    //    .create('sha256')
    //    .update(resetToken)
    //    .digest('hex')

    const forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

    const user=await User.findOne({
        forgotPasswordToken,
        // forgetPasswordExpiry: { $gt: Date.now() }
    })  
    
    if(!user){
        return next(new AppError('Token Not exsits please try ',400))
    }
    User.password=password
    User.forgetPasswordExpiry=undefined
    User.forgotPasswordToken=undefined
    user.save()

    res.status(200).json({
        success:true,
        "message":"Reset Successfully"
    })
}

const getlogin=(req,res)=>{
    res.status(200).json({
        "messgae":"i am  babay"
    })
}


const changePassoword=async(req,res,next)=>{
    const {oldPassword,newPassword}=req.body

    const {id}=req.user

    if(!oldPassword || !newPassword){
        return next(new AppError('Every field is Required',400))
    }
   
    const user=await User.findById(id).select('+password')
    if(!user){
        return next(new AppError("User does not exits"))
    }
    const isPasswordValid=await user.comparePassword(oldPassword)
    
    if(!isPasswordValid){
        return next(new AppError("Invalid old password"))
    }
    user.password=newPassword
    await user.save()
    user.password=undefined

    return res.status(200).json({
        success:true,
        "message":"Changed Successfully"
    })
}

const updateUser=async(req,res,next)=>{
    const {fullName}=req.body
    
    const {id}=req.user
    
    if(!fullName){
        return next().AppError("Field is Required",400)
    }

    const user=await User.findById(id)

    user.fullName=fullName

    await user.save()

    return res.status(200).json({
        success:true,
        "message":"Profile update"
    })
}

export {
    register,
    login,
    logout,
    getProfile,
    forgot_password,
    reset_password,
    changePassoword,
    updateUser,
    getlogin
}