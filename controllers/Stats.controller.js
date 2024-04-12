import User from "../models/user.model.js"
import AppError from "../utils/error.util.js"

export const userStat=async(req,res,next)=>{
  try{  

   const usersCount=await User.countDocuments()

   const subscribedUser=await User.countDocuments({
    'subscription.status':'active'
   })

   res.status(200).json({
    success:true,
    message:"Users stats",
    usersCount,
    subscribedUser
   })
}catch(e){
    return next(new AppError(e.message,500))
}

}

