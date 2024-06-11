import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import morgan from 'morgan';
import userRoutes from './route/user.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import courseRouter from './route/course.routes.js';
import cors from 'cors';
import paymentRoutes from './route/payment.routes.js';
import demoRoute from './route/demo.routes.js';
import stats from './route/Stats.routes.js';

config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Specify the front-end origin for CORS
app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow the specific origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

app.use(morgan('dev'));

// Route definitions
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/demo/video', demoRoute);
app.use('/api/v1/admin/stats', stats);

// Error handling middleware
app.use(errorMiddleware);

// Default route for testing
app.use('/', (req, res) => {
  res.status(200).json({
    message: "success",
    data: "don"
  });
});

// Catch-all route for undefined endpoints
app.all('*', (req, res) => {
  res.status(404).send('OOPS!! 404 NOT FOUND');
});

// Export the app
export default app;
