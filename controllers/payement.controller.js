import User from "../models/user.model.js"
import { razorpay } from "../server.js"
import AppError from "../utils/error.util.js"
import crypto from "crypto"
import Payement from '../models/payment.model.js'
import { log } from "console"
export const getRazorPayApiKey=async(req,res,next)=>{
    console.log(process.env.RAZORPAY_KEY_ID);
    try{
      console.log("kya hua.....");  
    // return res.status(200).json({
    //     success:true,
    //     message:"Razorpay Api Key",
    //     key:process.env.RAZORPAY_KEY_ID
    // })
    return res.status(200).json({
        success:true,
        message:"sucess",
        key:process.env.RAZORPAY_KEY_ID
    })
    console.log("ayush");
}catch(e){
    return (next(new AppError("Something Went Wrong",500)))
}
}
export const buySubscription = async (req, res, next) => {
    console.log("i am buy subscription")
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
            total_count: 1,
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
    console.log("verify i am");
    try{
    const {id}=req.user
    const {razorpay_payment_id,razorpay_signature,razorpay_subscription_id}=req.body
    console.log(razorpay_payment_id,razorpay_signature,razorpay_subscription_id);
     console.log("ver-1");
    const user=await User.findById(id)
    console.log(user);
    console.log("ver-2");
    if(!user)
    {
        return next(new AppError("User not exits",400))
    }
    console.log("ver-3");
    const subscriptionId=user.subscription.id
    console.log(subscriptionId);
    if(!subscriptionId){
        return(next(new AppError("Subscription not Verify",400)))
    }
    // console.log(razorpay_payement_id);
    console.log("ver-4");
    const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex')
        console.log(generatedSignature);
        console.log("ver-2121");
        if (generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment Unsuccessfull! Please try again', 400))
        }
        console.log(generatedSignature)
        console.log("ver-322")
        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })
        console.log("ver-5");
        user.subscription.status = 'active'
        await user.save()
        console.log("ver-6");
        res.status(200).json({
            success: true,
            message: "Verified successfully",
            subscription: user.subscription
        })
    }catch(e){
        return(next(new AppError(e,500)))
    }

}

export const cancelSubscription = async (req, res, next) => {
    try {
        // Extracting user ID from the request
        const { id } = req.user

        // Retrieving user details from the database
        const user = await User.findById(id)

        // Handling cases where user is not found or is an admin
        if (!user) {
            return next(new AppError('Please Login', 400))
        }

        if (user.role === 'ADMIN') {
            return next(new AppError('Admin Cannot cancel subscription', 400))
        }

        // Cancelling the subscription using Razorpay API
        const subscriptionId = user.subscription.id
        const subscription = await razorpay.subscriptions.cancel(subscriptionId)

        // Updating user's subscription status in the database
        user.subscription.status = subscription.status
        await user.save()

        // Sending success response
        res.status(200).json({
            success: true,
            message: "Subscription cancelled!"
        })

    } catch (error) {
        // Handling errors and passing them to the next middleware
        return next(new AppError(error.error, error.statusCode))
    }
}

export const allPayments = async (req, res, next) => {
    try {
        // Extracting count and skip parameters from the query
        const { count, skip } = req.query

        // Retrieving payment subscriptions using Razorpay API
        const subscription = await razorpay.subscriptions.all({
            count: count ? count : 100,
            skip: skip ? skip : 0
        })


        // Creates a list of month names to filter by. This is used to filter the list of months
        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        // Returns a map of months to be used for filtering. This map is indexed by month
        const finalMonths = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0,
        };

        // Mapping subscription start months to month names
        const monthlyWisePayments = subscription.items.map((payment) => {
            const monthsInNumbers = new Date(payment.start_at * 1000);
            return monthNames[monthsInNumbers.getMonth()];
        });

        // Counting subscriptions per month
        monthlyWisePayments.map((month) => {
            Object.keys(finalMonths).forEach((objMonth) => {
                if (month === objMonth) {
                    finalMonths[month] += 1;
                }
            });
        });

        // Creating a list of subscription counts per month
        const monthlySalesRecord = [];

        Object.keys(finalMonths).forEach((monthName) => {
            monthlySalesRecord.push(finalMonths[monthName]);
        });

        // Sending success response with payment subscription details
        res.status(200).json({
            success: true,
            message: 'All payments',
            subscription,
            finalMonths,
            monthlySalesRecord,
        });
    } catch (e) {
        // Handling errors and passing them to the next middleware
        return next(new AppError(e.message, 500))
    }
}