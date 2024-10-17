import mongoose, { Schema, model } from "mongoose";
import { profile } from "../controllers/user.controller.js";
import  bcrypt from "bcryptjs";
import comparePassword from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { type } from "os";



const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Full Name is required"],
        minlength: [3, "Full Name must be at least 3 characters long"],
        trim: true,
        unique: false,
        index: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },

    // phoneNumber: {
    //     type: String,
    // },

    password: {
        type: String,
        required: [true, "Password is required"],
        unique: false,
        minlength: [8, "Password must be at least 8 characters long"],
        select: false
    },

    avater: {
        public_id: {
            type: String

        },
        secqure_url: {
            type: String
            
        }
    },

    forgotPassword: {
        type: String
    },

    forgotPasswordExpire: {
        type: Date
    },

    refreshToken: {
        type: String
    },

    // watchHistory: {
    //     type: Schema.Types.ObjectId,
    //     ref: "location"
    // },
    
    role: {
        type: String,
        required: false,
        enum: ["USER", "ADMIN", "DRIVER"],
            
        default: "USER"
    }
}, {
    
    timestamps: true,
});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods = {
    generateJwtToken: async function () {
            return await jwt.sign({ 
                _id: this._id, 
                fullName: this.fullName,
                email: this.email, 
                payment: this.payment, 
                role: this.role 
            }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_TIME,
            }
        );
    },

    comparePassword: async function (plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password);
    },

        // This will generate a token for password reset
    generatePasswordResetToken: async function () {
        // creating a random token using node's built-in crypto module
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Again using crypto module to hash the generated resetToken with sha256 algorithm and storing it in database
        this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        // Adding forgot password expiry to 15 minutes
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

        return resetToken;
    },
};


const User = mongoose.model("User", userSchema);

export default User;

