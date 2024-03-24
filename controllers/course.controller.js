import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import clodinary from 'cloudinary'
import fs from 'fs/promises'
import { log } from "console";
const getAllCourses=async(req,res,next)=>{
    try{
    const courses=await Course.find({}).select('-lectures')
    if(!courses){
        return res.status(400).json({
            success:false,
            "message":"Course Not Found"
        })
    }
    return res.status(200).json({
        success:true,
        "message":"Your course be like:-",
         data:courses
    })
 }catch(e){
    return res.status(500).json({
        success:false,
        "message":e.message
    })
 }
}
 
const getLectureById=async(req,res,next)=>{
    try{
        const {id}=req.params
        console.log(id);
        const user=await Course.findById(id)
        if(!user){
            return next(new AppError("Not get lecture",400))
        }
        res.status(200).json({
         success:true,
         message:"User detial are:-",
         user
        })
    }catch(e){
         return( new AppError(e.message,500))
    }
}

const createCourse=async(req,res,next)=>{

    try{
    const {title,description,category,createdBy}=req.body

    if(!title || !description || !category || !createdBy ){
        next(new AppError("Every Field are Required",400))
    }

    const course=await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail:{
            public_id:'Dummy',
            secure_url:'Dummy'
        }
    })
     
    console.log(course);
    if(!course){
        return next(
            new AppError("Course not Created,Please try again",400)
        )
    }
    if(req.file){
        const result=await clodinary.v2.uploader.upload(req.file.path,{
            folder:'lms'
        })
        if(result){
            course.thumbnail.public_id=result.public_id,
            course.thumbnail.secure_url=result.secure_url
        }
        fs.rm(`uploads/${req.file.filename}`)
        console.log("c-4");
    }

    await course.save()

    return res.status(200).json({
      success:true,
      "message":"Course created Succesfully",
       course,
    })
}catch(e){
    return(next(new AppError("Something Went Wrong",500)))
}
}

const updateCourse=async(req,res,next)=>{
   try{
      const {id}=req.params
      const course=await Course.findByIdAndUpdate(
        id,
        {
            $set:req.body
        },
        {
           runValidators:true
        }
    )
    if(!course){
        return next(new AppError("Course not found",400))
    }
    
    res.status(200).json({
        success:true,
        "message":"Course update sucessfully",
        course
    })

   }catch(e){
     return (new AppError("Something Went Wrong",500))
   }
}

const removeCourse=async(req,res,next)=>{
  try{
    const {id}=req.params
    const course=await Course.findById(id)
    if(!course){
        return next(new AppError("Course not found",400))
    }
    console.log(course);
    await Course.findByIdAndDelete(id)
    console.log("ayu4");
    res.status(200).json({
        success:true,
        "message":"Course delete Sucessfully"
    })
  }catch(e){
    return (new AppError("Something Went Wrong",500))
  }
}

const addLectureToCourseById=async(req,res,next)=>{
  const {title,description}=req.body
  const {id}=req.params
 try{
  const course=await Course.findById(id)
  if(!course){
     return res.status(400).json({
        success:false,
        "message":"Course Not Found"
     })
  }
  console.log(course);
  const lectureData={
    title,
    description,
    lecture:{
        public_id:'Dummy',
        secure_url:'Dummy'
    }
  }
  if(req.file){
    console.log("c-1");
    const result=await clodinary.v2.uploader.upload(req.file.path,{
        folder:'lms'
    })
    console.log("c-2");
    if(result){
        console.log("c-3");
        lectureData.lecture.public_id=result.public_id,
        lectureData.lecture.secure_url=result.secure_url
    }
    console.log("c-3");
    fs.rm(`uploads/${req.file.filename}`)
    console.log("c-4");
  }

  course.lectures.push(lectureData)
//   course.numberOfLecture=course.lectures.length
 course.numberOfLecture=course.lectures.length

  await course.save()

  res.status(200).json({
    success:true,
    "message":"Lecture add successfully",
    course

  })
}catch(e){
    res.status(400).json({
        success:false,
        "message":"not found"
    })
}
}






export {
    getAllCourses,
    getLectureById,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById
}