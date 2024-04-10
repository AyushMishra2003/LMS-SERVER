import express from 'express'
import cookieParser from 'cookie-parser'
import {config} from 'dotenv'
import morgan from 'morgan'
import userRoutes from './route/user.routes.js'
import errorMiddleware from './middlewares/error.middleware.js'
import courseRouter from './route/course.routes.js'
import cors from 'cors'
import payementRoutes from './route/payment.routes.js'
import demoRoute from './route/demo.routes.js'

config()


const app=express()

app.use(express.json())
app.use(cookieParser())


app.use(express.urlencoded({extended:true}))
app.use(morgan('dev'))
app.use(cors({credentials: true, origin: process.env.FRONTEND_URL}));
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/courses',courseRouter)
app.use('/api/v1/payements',payementRoutes)
app.use('/api/v1/demo/video',demoRoute)



app.use(errorMiddleware)
app.use('/',(req,res)=>{
   res.status(200).json({
      message:"suceess",
      "data":"don"
   })
})



app.all('*',(req,res)=>{
    res.status(404).send('OOPS!! 404 NOT FOUND')
})

// app.all('*',(req,res)=>{
//    res.status(404).send('OPPS! 404 NOT FOUND')
// }) 

// 3 moduele


export default app