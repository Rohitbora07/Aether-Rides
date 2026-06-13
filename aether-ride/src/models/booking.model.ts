import mongoose from "mongoose"

export type BookingStatus = "requested" | "awaiting_payment" | "confirmed" | "completed" | "cancelled" | "started" | "rejected" | "expired"

export type PaymentStatus = "pending" | "paid" | "failed" | "cash"

export interface IBooking {
    user: mongoose.Types.ObjectId
    driver: mongoose.Types.ObjectId
    vehicle: mongoose.Types.ObjectId

    pickUpAddress: string
    dropAddress: string

    pickUpLocation: {
        type: string
        coordinates: number[]
    }
    dropLocation: {
        type: string
        coordinates: number[]
    }
    fare: number
    userMobile: string
    driverMobile: string
    bookingStatus: BookingStatus
    paymentStatus: PaymentStatus

    adminCommission: number
    partnerAmount: number

    pickUpOtp: string
    dropOtp: string
    pickUpOtpExpiry: Date
    dropOtpExpiry: Date
    createdAt?: Date
    updatedAt?: Date
}

const bookingSchema = new mongoose.Schema<IBooking>({
    user:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    driver:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    vehicle:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    pickUpAddress: {
        type: String,
        required: true
    },
    dropAddress: {
        type: String,
        required: true
    },
    pickUpLocation: {
        type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
        }
    },
    dropLocation: {
        type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
        }
    },
    fare: {
        type: Number,
        required: true
    },
    userMobile: {
        type: String,
        required: true
    },
    driverMobile: {
        type: String,
        required: true
    },
    bookingStatus: {
        type: String,
        enum: ["requested", "awaiting_payment", "confirmed", "completed", "cancelled", "started", "rejected", "expired"],
        default: "requested"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "cash"],
        default: "pending"
    },
    adminCommission: {
        type: Number,
        default: 0,
        required: true
    },
    partnerAmount: {
        type: Number,
        default: 0,
        required: true
    },
    pickUpOtp: {
        type: String,
    },
    dropOtp: {
        type: String,
    },
    pickUpOtpExpiry: {
        type: Date,
    },
    dropOtpExpiry: {
        type: Date,
    }
},{timestamps: true})


const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema)

export default Booking