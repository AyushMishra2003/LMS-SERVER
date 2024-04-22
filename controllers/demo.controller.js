import Demos from "../models/demo.model.js"
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary'
const addDemoVideo=async()=>{

   const {title,description,demoVideo}=req.body
   
   if(!title || !description){
      return next(new AppError("All field are required",400))
   }

   const demoData=await Demos.create({
      title,
      description,
      demoVideo:{
         public_id:'',
         secure_url:''
      }
   })

   if(!demoData){
      return next(new AppError("Demo Lecture not added",400))
   }

   if(req.file){
      const result=await cloudinary.v2.uploader(req.file.path,{
         folder:'lms',
         resource_type: 'video'
      })
      if(result){
         demoData.demoVideo.public_id=result.public_id,
         demoData.demoVideo.secure_url=result.secure_url
      }
      fs.rm(`/uploads/${req.file.filename}`)
   }
   Demos.demos.push(demoData)

}


export default addDemoVideo