import ErrorHandler from '../utils/errorHandler.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Invalid Mongoose ID Error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new ErrorHandler(message, 404);
  }

  //Handle Validation Errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(value => value.message).join(', ');
    error = new ErrorHandler(message, 400);
  }
  
  
  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(', ')}`;
    error = new ErrorHandler(message, 400);
  }


  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'JSON Web Token is invalid. Try again.';
    error = new ErrorHandler(message, 401);
  }

  //Handle JWT Expire Error
  if (err.name === 'TokenExpiredError') {
    const message = 'JSON Web Token has expired. Try again.';
    error = new ErrorHandler(message, 401);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
      stack: err.stack
    });
  }

  if (process.env.NODE_ENV === 'PRODUCTION') {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Fallback for when NODE_ENV is not set
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;