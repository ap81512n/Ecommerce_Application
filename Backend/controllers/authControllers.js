import catchAsyncErrors from '../middleware/catchasyncError.js';
import User from '../models/user.js';
import sendToken from '../utils/sendToken.js';
import {resetPasswordEmailTemplate} from '../utils/emailTemplates.js';
import ErrorHandler from '../utils/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';



//Register a new user
// This function handles user registration by creating a new user in the database
export const registerUser = catchAsyncErrors (async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,email,password
    })

   sendToken(user, 201, res);

});

//Login user
export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password' });
    }

    // Find user by email and check password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });

    }

    //check if password matches
    const isPasswordMatch = await user.matchPassword(password);
    
    // If password does not match, return an error
    if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }


        
   sendToken(user, 200, res);
});


//Forgot password
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL}/api/v1/password/reset/${resetToken}`;

    const message = resetPasswordEmailTemplate(user?.name, resetUrl);
    try{
        
        await sendEmail({
            email: user.email,
            subject: 'Password Recovery',
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });

    
    }
    catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return next(new ErrorHandler(error.message, 500));
    }
});


//logout user
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});


//Reset password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hash the url token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    // Find user by the reset token and check if token has not expired
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400));
    }

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    

    // Set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    //confirm password

 

    await user.save();

    sendToken(user, 200, res);
});

// Upload user avatar   =>  /api/v1/me/upload_avatar
export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
  const avatarResponse = await upload_file(req.body.avatar, "../public/images");

  // Remove previous avatar
  if (req?.user?.avatar?.url) {
    await delete_file(req?.user?.avatar?.public_id);
  }

  const user = await User.findByIdAndUpdate(req?.user?._id, {
    avatar: avatarResponse,
  });

  res.status(200).json({
    user,
  });
});



// Get current logged in user details
export const getCurrentUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
}
);

//change password
export const changePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //check previous user password
    const isPasswordMatch = await user.matchPassword(req.body.oldPassword);
    if (!isPasswordMatch) {
        return next(new ErrorHandler('Old password is incorrect', 400));
    }

      // Check confirm password
   if (req.body.newPassword != req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

//update user profile
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    // Update avatar: TODO

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        user,
    });
});

//get all admin users
export const getAllAdminUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find({ role: 'admin' });

    if (!users) {
        return next(new ErrorHandler('No admin users found', 404));
    }

    res.status(200).json({
        success: true,
        users,
    });
}
);

export const getAdminUserById = catchAsyncErrors(async (req, res, next) => {
    const users = await User.findById(req.user.id, { role: 'admin' });

    if (!users) {
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        users,
    });
}
);
//update user profile -- admin
export const updateUserProfileByAdmin = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    // Update avatar: TODO

        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
    
        res.status(200).json({
            success: true,
            user,
        });
    });


    export const deleteUserByAdmin = catchAsyncErrors(async (req, res, next) => {
        const user = await User.findByIdAndDelete(req.params.id);
    
        if (!user) {
            return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`));
        }
    
        // Remove avatar from cloudinary - TODO
    
       // await user.remove();
    
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    });










    