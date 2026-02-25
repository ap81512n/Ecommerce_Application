import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// User model schema for MongoDB using Mongoose


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            
        },
        url: {
            type: String,
           
        }
    },
 role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

//ecrpty password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    // Hash the password using bcrypt
    //const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//Return JWT token
userSchema.methods.getJWTToken = function () {
    //const jwt = require('jsonwebtoken');
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

//Compare user password
userSchema.methods.matchPassword = async function (enteredPassword) {
    //const bcrypt = require('bcryptjs');
    return await bcrypt.compare(enteredPassword, this.password);
};


//Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate a token using crypto
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token using sha256
    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken).digest('hex');

    
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Set expiration time

    return resetToken;
};









const User =mongoose.model('User', userSchema);

export default User;

