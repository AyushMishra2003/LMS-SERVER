import User from "../models/user.model.js"
import { razorpay } from "../server.js"
import AppError from "../utils/error.util.js"
import crypto from "crypto"
import Payement from '../models/payment.model.js'
export const getRazorPayApiKey=async(req,res,next)=>{
    try{
    res.status(200).json({
        success:true,
        message:"Razorpay Api Key",
        key:process.env.RAZORPAY_KEY_ID
    })
}catch(e){
    return (next(new AppError("Something Went Wrong",500)))
}
}


export const buySubscription = async (req, res, next) => {
    try {
        const { id } = req.user

        const user = await User.findById(id)
        
        if (!user) {
            return next(new AppError('Please Login', 400))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin Cannot purchase subscription', 400))
        }

        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID, 
            customer_notify: 1,
            total_count: 12,
        });
        
        if(!subscription){
            return (next(new AppError("Subscription not done at all",500)))
        }
        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Subscribed successfully",
            subscription_id: subscription.id
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}


export const verifySubscription=async(req,res,next)=>{
    try{
    const {id}=req.user

    const user=await User.findById(id)

    if(!user)
    {
        return next(new AppError("User not exits",400))
    }

    const subscriptionId=user.subscription.id
    if(!subscriptionId){
        return(next(new AppError("Subscription not Verify",400)))
    }
    const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex')

        if (generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment Unsuccessfull! Please try again', 400))
        }

        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })

        user.subscription.status = 'active'
        await user.save()

        res.status(200).json({
            success: true,
            message: "Verified successfully",
            subscription: user.subscription
        })
    }catch(e){
        return(next(new AppError("Something Went Wrong",500)))
    }

}



export const cancelSubscription=async(req,res,next)=>{
   try{
     console.log("I AM CANCEL SUBSCRIPTION");
   }catch(e){
    return(next(new AppError("Something Went Wrong",500)))
   }
}


export const allPayements=async(req,res,next)=>{
    try{
    console.log("This is all payment Subscripton");
    }catch(e){
        return(next(new AppError("Something Went Wrong",500)))
    }

}