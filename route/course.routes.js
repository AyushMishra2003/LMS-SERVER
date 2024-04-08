import { Router } from "express";
import { addLectureToCourseById, createCourse, deleteLecture, getAllCourses, getLectureById, removeCourse, updateCourse} from "../controllers/course.controller.js";
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
            authorizedRoles('ADMIN'),
            upload.single('lecture') ,
            addLectureToCourseById
      )

// courseRouter.route('/:id&lectureId')
//       .delete(
//             isLoogedIn,
//             authorizedRoles('ADMIN'),
//             deleteLecture
//       )
courseRouter.delete('/remove/lecture/:id/:lectureId', isLoogedIn,deleteLecture);
// courseRouter.get('/login',getlogi


export default courseRouter


