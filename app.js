import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import morgan from 'morgan';
import userRoutes from './route/user.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
import courseRouter from './route/course.routes.js';
import paymentRoutes from './route/payment.routes.js';
import demoRoute from './route/demo.routes.js';
import stats from './route/Stats.routes.js';

config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// CORS configuration
app.use((req, res, next) => {
  // Allow any origin when credentials are not present
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials like cookies
  next();
});

// Routes
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
