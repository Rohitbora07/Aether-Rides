import mongoose, { Document } from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role:{
        type: String,
        default: "user",
        enum: ["user","partner","admin"]
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    partnerOnboardingStep: {
        type: Number,
        min: 0,
        max: 8,
        default: 0
    },
    partnerStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String
    },
    socketId: {
        type: String,
        default: null
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    isOnline: {
        type: Boolean,
        default: false,
        index: true
    },
    mobileNumber: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    }
},
{
    timestamps: true
})

userSchema.index({location: "2dsphere"})    
const User = mongoose.model("User", userSchema)

export default User