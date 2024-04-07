import express from "express"
import User from "../models/user.model.js"
import AppError from "../utils/error.util.js"
import emailValidator from 'email-validator'
import sendEmail from "../utils/sendEmail.js"
import nodemailer from 'nodemailer'
import cloudinary from 'cloudinary'
import crypto from 'crypto'
import { error, log } from "console"
import fs from 'fs/promises'
const cokkieOption={
    maxAge:7*24*60*60*1000,
    httpOnly:true,
    secure:true
}

const register=async(req,res,next)=>{
    console.log("mai aa gaya");
    const {fullName,email,password,role}=req.body
    if(!fullName || !email  || !password){
        return next(new AppError('All fields are required',400))
    }
    console.log("ayu1");
    const userExists=await User.findOne({email})
    
    if(userExists){
       return next(new AppError('Email already exits',400))
    }
    console.log("ayu2");
    if(fullName.length<5 || password.length<5){
        return next(new AppError('Number or Password should be atleast 5 character'))
    }
    console.log("ayu3");
    const validEmail=emailValidator.validate(email)
    if(!validEmail){
        return next(new AppError('Email is not valid',400))
    }
    console.log("ayu5");
    // if(number.toString().length<10){
    //     return next(new AppError('Invalid Number'))
    // }
    console.log("ayu6");
    const user=await User.create({
       fullName,
       email,
       password,  
       avatar:{
        public_id:'',
        secure_url:''
       }
    })
    console.log("ayu7");
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
         console.log(result);
         if(result){
            console.log("result kaise-1 ");
            user.avater.public_id=result.public_id;
            console.log("kk-2");
            // user.avatar.secure_url=result.secure_url;
            user.avater.secure_url=result.secure_url
            console.log("kaise-1");
            // Remove file
            fs.rm(`uploads/${req.file.filename}`)
            console.log("kaise-2");
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
   console.log("mai hu don"); 
   const {email,password}=req.body
   console.log("ayush1");
   console.log(email,password);
   if(!email || !password){
    return next(new AppError('All fields are required',400))
   }
   console.log("ayush2");
   const user=await User.findOne({
        email
   }).select('+password')

   
   console.log(user);

   console.log("ayush3");
   const isPassword=await user.comparePassword(password);
   if(!user || !isPassword){
    return next(new AppError('Email or Password not matched',400))
   }
   console.log("ayush4");
   const token=await user.generateJWTToken()

   user.password=undefined
   console.log("ayush5");
   res.cookie('token',token,cokkieOption)
   res.status(200).json({
    success:true,
    "message":"Login Succesfully",
    user,
   })
   console.log("ayush6");
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

   console.log("profile-1"); 
   const userId=req.user.id
   console.log("profile-2");
   const user=await User.findById(userId)
   console.log("profile-3");
   res.status(200).json({
    success:true,
    message:"User detial",
    user
   })
   console.log("profile-4");
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