import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import { log } from "console";
import { lchown } from "fs";
const getAllCourses=async(req,res,next)=>{
    console.log("get all course");
    try{
    const courses=await Course.find({}).select('-lectures')
    // console.log("create-1");
    if(!courses){
        return res.status(400).json({
            success:false,
            "message":"Course Not Found"
        })
    }
    // console.log(courses);
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
        console.log("i am get lecture by id");
        const {id}=req.params
        console.log(id);
        const course=await Course.findById(id)
        if(!course){
            return next(new AppError("Not get lecture",400))
        }
        res.status(200).json({
         success:true,
         message:"Lectures are :-",
         lectures:course.lectures
        })
    }catch(e){
         return( new AppError(e.message,500))
    }
}

const createCourse=async(req,res,next)=>{

    try{
    const {title,description,category,createdBy}=req.body
    console.log(title,description,category,createdBy);

    if(!title || !description || !category || !createdBy ){
        next(new AppError("Every Field are Required",400))
    }
    console.log("c-123")
    const course=await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail:{
            public_id:'',
            secure_url:''
        }
    })
     
    console.log(course);
    console.log("c-124");
    if(!course){
        return next(
            new AppError("Course not Created,Please try again",400)
        )
    }
    if(req.file){
        const result=await cloudinary.v2.uploader.upload(req.file.path,{
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
    console.log(e.message);
    return(next(new AppError(e.message,500)))
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
    await Course.findByIdAndDelete(id)
    res.status(200).json({
        success:true,
        "message":"Course delete Sucessfully"
    })
  }catch(e){
    return (new AppError("Something Went Wrong",500))
  }
}

const addLectureToCourseById=async(req,res,next)=>{
//   const {title,description,lecture}=req.body
//   const {id}=req.params
//  try{
//   const course=await Course.findById(id)
//   if(!course){
//      return res.status(400).json({
//         success:false,
//         "message":"Course Not Found"
//      })
//   }
//   console.log(course);
//   const lectureData={
//     title,
//     description,
//     lecture:{
//         public_id:'',
//         secure_url:''
//     }
//   }
//   if (!lectureData) {
//     return next(new AppError('Failed to save lecture', 400))
//  }
//   if(req.file){
//     console.log("c-1");
//     const result=await cloudinary.v2.uploader.upload(req.file.path,{
//         folder:'lms',
//         resource_type: 'video'
//     })
//     console.log("c-2");
//     if(result){
//         console.log("c-3");
//         lectureData.lecture.public_id=result.public_id,
//         lectureData.lecture.secure_url=result.secure_url
//     }
//     console.log("c-3");
//     fs.rm(`uploads/${req.file.filename}`)
//     console.log("c-4");
//   }

//   course.lectures.push(lectureData)
// //   course.numberOfLecture=course.lectures.length
//  course.numberOfLecture=course.lectures.length

//   await course.save()

//   res.status(200).json({
//     success:true,
//     "message":"Lecture add successfully",
//     course

//   })
// }catch(e){
//     res.status(400).json({
//         success:false,
//         "message":"not found"
//     })
// }

try {
    const { id } = req.params

    const { title, description, lecture } = req.body

    const course = await Course.findById(id)

    if (!course) {
        return next(new AppError('No Course Found', 400))
    }

    
    if (!title ||  !description) {
        return next(new AppError('All fields are required', 400))
    }

    
    const lectureData = {
        title,
        description,
        lecture: {
            public_id: '',
            secure_url: '',
        }
    }

    
    if (!lectureData) {
        return next(new AppError('Failed to save lecture', 400))
    }

    console.log("lecture adding");
    if (req.file) {
        console.log("le le baba");
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms',
            resource_type: 'video'
        })
        console.log("11");

        if (result) {
            lectureData.lecture.public_id = result.public_id
            lectureData.lecture.secure_url =result.secure_url
        }        
        fs.rm(`uploads/${req.file.filename}`)
    }

    console.log("1");
    course.lectures.push(lectureData)
    course.numberOfLecture = course.lectures.length

    
    await course.save()

    res.status(200).json({
        success: true,
        message: "Lectures successfully added to the course",
        course
    })
} catch (e) {
    
    return next(new AppError(e.message, 500))
}
}


const addDemoVideo=async(req,res,next)=>{
    const {title,description,demoVideo}=req.body
}

const deleteLecture = async (req, res, next) => {
    try {
        // Extract course and lecture IDs from the request parameters
        console.log("i am delete lectures");
        const { id } = req.params
        const { lectureId } = req.params
        
        console.log(id);
        // Find the course by ID
        const course = await Course.findById(id)
        console.log(course);
        // Check if the course exists
        if (!course) {
            return next(new AppError('No Course Found', 400))
        }

        // Find the index of the lecture in the course's lectures array
        const lectureIndex = course.lectures.findIndex(
            (lecture) => lecture._id.toString() === lectureId.toString())

        // Check if the lecture exists
        console.log(lectureIndex);
        if (lectureIndex === -1) {
            return next(new AppError('No Lecture Found', 400))
        }

        // Delete the lecture video from Cloudinary
        await cloudinary.v2.uploader.destroy(
            course.lectures[lectureIndex].lecture.public_id,
            {
                resource_type: 'video',
            }
        )
        console.log("ruko");
        // Remove the lecture from the course's lectures array
        course.lectures.splice(lectureIndex, 1)

        // Update the course's lecture count
        course.numberOfLecture = course.lectures.length

        // Save the updated course to the database
        await course.save()
        console.log(course);
        // Send a success response with details of the updated course
        res.status(200).json({
            status: true,
            message: "Lecture deleted successfully",
            course
        })
        console.log("okay ji ho gaya");
    } catch (e) {
        // Handle unexpected errors
        return next(new AppError(e.message, 500))
    }
}

export {
    getAllCourses,
    getLectureById,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    deleteLecture,
    addDemoVideo
}