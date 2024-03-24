import { Router } from "express";
import { addLectureToCourseById, createCourse, getAllCourses, getLectureById, removeCourse, updateCourse} from "../controllers/course.controller.js";
import { authorizedRoles, isLoogedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const courseRouter=Router()



// courseRouter.get('/',getAllCourses)
courseRouter.route('/')
     .get(getAllCourses)
     .post(
        isLoogedIn,
        authorizedRoles('ADMIN'),        
        upload.single('thumbnail') ,
        createCourse
      )

courseRouter.route('/:id')
      .get(isLoogedIn,getLectureById)
      .put(
            isLoogedIn,
            authorizedRoles('ADMIN'),
            updateCourse
      )
      .delete(
            isLoogedIn,
            authorizedRoles('ADMIN'),
            removeCourse
      )
      .post(
            isLoogedIn,
            upload.single('lecture') ,
            addLectureToCourseById
      )
// courseRouter.get('/login',getlogin)



export default courseRouter


