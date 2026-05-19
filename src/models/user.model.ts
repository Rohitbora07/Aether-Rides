import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    name:string;
    email: string;
    password? : string;
    role: "user" | "partner" | "admin"
    createdAt: Date;
    isEmailVerified?: boolean;
    partnerOnboardingStep?: number;
    partnerStatus?: "pending" | "approved" | "rejected";
    mobileNumber?: string;
    rejectionReason?: string;
    otp?: string;
    otpExpiresAt?: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
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


const User = mongoose.models.User ||  mongoose.model("User", userSchema)

export default User