import { Router } from "express";
import {  allPayments, buySubscription, cancelSubscription, getRazorPayApiKey, verifySubscription } from "../controllers/payement.controller.js";
import { authorizedRoles, isLoogedIn } from "../middlewares/auth.middleware.js";

const router=Router()

router
    .route('/razorpay-key')
    .get(
        getRazorPayApiKey
    )



router
   .route('/subscribe')
   .post(
      buySubscription
    )


router
  .route('/verify')
  .post(
    verifySubscription
  )
  
  
router
   .route('/unSubscribe')
   .post(
      isLoogedIn,
      cancelSubscription
    )


router
   .route('/')
   .get(
        isLoogedIn,
        authorizedRoles('ADMIN'),
        allPayments
    )
 

export default router  