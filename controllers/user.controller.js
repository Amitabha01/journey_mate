
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import crypto from "crypto";
import { json } from "express";
import fs from "fs/promises";


console.log(AppError);

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,   //cookie set for 7 days login
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
};

const register = async function (req, res, next) {
    const { fullName, email, password } = req.body;
    //validation fields

    if (!fullName || !email || !password) {
        
        return next (new AppError ('All fields are required', 400));
    }
    //check if user is already registered

    try {
        const userExists = await User.findOne({ email });
        console.log('userExists', userExists);
        
        if (userExists) {
            return next (new AppError ('User already exists', 409));
        }
        // Ensure name is not null to avoid MongoServerError
    
        if (!fullName) {
            return next(new AppError('Name cannot be null', 400));
        }
    
        
        const user = await User.create({
            fullName, 
            email, 
            password,
            avater: {
                public_id: 'somethingID',
                secure_url: "https://cdn.pixabay.com/photo/2014/03/25/16/54/user-297566_640.png",
            
            },
        });
        console.log('user', user);
        
    
        if(!user) {
            return next (new AppError ('Registration failed, Please try again', 400));
        }
    
        //T0D0: file upload
        if (req.file) {
            console.log(req.file);
    
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });

            console.log('before try');
            
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "journeymate/avaters",
                    width: 150,
                    height: 150,
                    crop: "fill",
                    gravity: "face",
                });
    
                if (result) {
                    user.avater = {
                        public_id: result.public_id,
                        secure_url: result.secure_url,
                    };
    
                    //remove file from server
                    try {
                        await fs.rm(`uploads/${req.file.filename}`);
                    } catch (error) {
                        return next(new AppError(error || "File removal failed, Please try again", 500));
                    }
                }
                
            } catch (error) {
                return next (new AppError (error || 'File upload failed, Please try again', 500));
                
            }
        }
    
        await user.save();
    
        user.password = undefined;
    
        const token = await user.generateJwtToken();
    
        res.cookie("token", token, cookieOptions);
    
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success: false,
            message: "An error occurred while registering user",
            error,
          });
    }
    
    
};

const login = async function (req, res, next) {

    try {

        const { email, password } = req.body;
        console.log(email, password);
        if (!email || !password) {
            return next (new AppError ('All fields are required', 400));
        };
        
        const user = await User. findOne({email
        }).select("+password");

        // Check if user exists

        if (!user) {
            return next (new AppError ('User does not exists', 400));
        };

       // Check if password is correct
       const isMatch = await user.comparePassword(password);
       if (!isMatch) {
        return next (new AppError ('Password does not match', 401));
       }

       // Generate token

        const token = await user.generateJwtToken();

        //Remove password from response

        user.password = undefined;

        // Set cookie and send response

        res.cookie("token", token, cookieOptions);

        

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user,
        });

    } catch (error) {
        console.log(error);
        console.log(error.message);
        
        
        return next (new AppError (error.message, 500));
    };
    
};

const logout = async function (_req, res, _next) {
    res.cookie("token", null, { 
        httpOnly: true,
        maxAge: 0,
        secure: process.env.NODE_ENV === 'production' ? true : false,
    });
    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    });
};

const profile = async function (req, res, next) {

    try {

        const userId = req.user.id;
        const user = await User.findById(userId);

        res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user,
        });
    } catch (error) {
        return next (new AppError ('Failed to fetch userdetails', 400));
    }
};

const forgotPassword = async function (req, res, next) {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Email is required here', 400));
        
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(new AppError('User does not exists here', 404));
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetpasswordURL = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

        // Send resetToken to user's email (implementation depends on your email service)

        try {

            await sendEmail(email, subject, message, resetpasswordURL);

             res.status(200).json({
                success: true,
                message: `Password reset token sent to ${email}`,
            });

        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new AppError('Failed to send password reset token', 500));
            
        }

        // Example: await sendEmail(user.email, resetToken);

        res.status(200).json({
            success: true,
            message: 'Password reset token sent to email',
        });
    } catch (error) {
        return next(new AppError('Failed to send password reset token', 500));
    }
};

const resetPassword = async function (req, res, next) {
    const { token, password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const newToken = user.generateJwtToken();
        res.cookie("token", newToken, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            user,
        });
    } catch (error) {
        return next(new AppError('Failed to reset password', 500));
    }
};


export { 
    register, 
    login, 
    logout, 
    profile,
    forgotPassword,
    resetPassword
};