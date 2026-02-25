//check if user is authenticated
import catchasyncError from '../middleware/catchasyncError.js';
import ErrorHandler from '../utils/errorHandler.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export const isAuthenticatedUser = catchasyncError(async(req, res, next) => {
    const { token } = req.cookies;
   if (!token) {
        return next(new ErrorHandler('Please login to access this resource', 401));
    }

    const decode =jwt.verify(token, process.env.JWT_SECRET);
    console.log("decode", decode);
    req.user = await User.findById(decode.id);


    next();

});

//authorize roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403));
        }
        next();
    };
};
