import AppError from "../utils/error.util.js"
import jwt from 'jsonwebtoken'

const isLoogedIn=async(req,res,next)=>{
     
     const {token}=await req.cookies
     console.log(token);

     if(!token){
        return next(new AppError("Not login in",401))
     }

     const userDetails=await jwt.verify(token,process.env.SECRET)

     req.user=userDetails

     next()
}

const authorizedRoles=(...roles)=>async(req,res,next)=>{
   const currentUserRoles=req.user.role

   if(!roles.includes(currentUserRoles)){
      return next(new AppError('You do not have permission to access this route',403))  
   }
   next()
}
export {
    isLoogedIn,
    authorizedRoles
}