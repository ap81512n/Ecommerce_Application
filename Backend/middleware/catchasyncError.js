const catchAsyncErrors = (controllerFunction) => (req, res, next) => {
  Promise.resolve(controllerFunction(req, res, next)).catch(next);
};

export default catchAsyncErrors;
// This middleware is used to catch errors in asynchronous controller functions.
// It wraps the controller function and ensures that any errors thrown are passed to the next middleware (error handler).