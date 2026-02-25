
// Error handler for Express applications 
// This utility class can be used to create custom error responses with a status code and message.

class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;


