import mongoose from "mongoose";

type VehicleType = "car" | "bike" | "loading" | "truck" | "auto";

export interface IVehicle {
    owner: mongoose.Types.ObjectId;
    type: VehicleType;
    vehicleNumber: string;
    vehicleModel: string;
    imageUrl?: string;
    baseFare?: number;
    pricePerKm?: number;
    waitingChargePerMin?: number;
    status: "approved" | "pending" | "rejected";
    rejectionReason?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const vehicleSchema = new mongoose.Schema<IVehicle>({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["car", "bike", "loading", "truck", "auto"],
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
        unique: true,
    },
    vehicleModel: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
    },
    baseFare: {
        type: Number,
    },
    pricePerKm: {
        type: Number,
    },
    waitingChargePerMin: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["approved", "pending", "rejected"],
        default: "pending",
    },
    rejectionReason: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Vehicle = mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;