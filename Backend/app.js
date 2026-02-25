import express from 'express';
import dotenv from 'dotenv';
import productRoutes from './routes/products.js';
import {connectDatabase} from './config/dbConnect.js';
import errorMiddleware from './middleware/middleware.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/order.js';
import productReviewRoutes from './routes/productreview.js';
import cookieParser from 'cookie-parser';

//Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception Error: ${err}`);
  console.log(err.stack);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1); // Exit with failure
});




dotenv.config({path: 'Backend/config/config.env'});
//connect to the database
connectDatabase();
const app = express();




app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

app.use('/api/v1', productRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', productReviewRoutes);
app.use(errorMiddleware); // Middleware for handling errors




const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection Error: ${err}`);
  console.log(err.stack);

  console.log('Shutting down the server due to unhandled promise rejection');

  server.close(() => {
    process.exit(1); // Exit with failure
  });
});






