import e from "express";
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import crypto from "crypto";
import fs from "fs/promises";


console.log(AppError);

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,   //cookie set for 7 days login
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
};

const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;
    //validation fields

    if (!fullName || !email || !password) {
        
        return next (new AppError ('All fields are required', 400));
    }
    //check if user is already registered

    try {
        const userExists = await User.findOne({ email });
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
                public_id: email,
                secqure_url: "https://cdn.pixabay.com/photo/2014/03/25/16/54/user-297566_640.png",
            },
        });
    
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
                        secqure_url: result.secqure_url,
                    };
    
                    //remove file from server
                    fs.rm(`uploads/${req.file.filename}`);
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
        if (error.code === 11000) {
            return res.status(409).json({ status: "error", success: false, message: "Duplicate key error: User already exists" });
        }
        return next(new AppError('An error occurred while registering the user', 500));
    }
    
    
};

const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return next (new AppError ('All fields are required', 400));
        };

        const user = await User. findOne({email
        }).select("+password");

        if (!user || !user.comparePassword(password)) {
            return next (new AppError ('Email or password does not match', 400));
        };

        const token = await user.generateJwtToken();
        user.password = undefined;

        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user,
        });

    } catch (e) {
            return next (new AppError (e.message, 500));
        };
    
};

const logout = (_req, res, _next) => {
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

const profile = async (req, res, next) => {

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



export { 
    register, 
    login, 
    logout, 
    profile 
};