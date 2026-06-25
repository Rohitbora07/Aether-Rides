import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";

export async function POST(req: NextRequest) {
    try{
        await connectDB()
        const { bookingId, otp } = await req.json()
        if (!bookingId || !otp) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
        const booking = await Booking.findById(bookingId)
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }   
        
        if(!booking.pickUpOtp || booking.pickUpOtp !== otp){
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
        }

        if(booking.pickUpOtpExpiry < new Date()){
            return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
        }

        booking.bookingStatus = "started"
        booking.pickUpOtp = ""
        booking.pickUpOtpExpiry = null

        await booking.save()

        return NextResponse.json({ message: "Pickup OTP verified successfully" }, { status: 200 })
    } catch (error) {
        console.error("Error in pickup OTP verify route:", error)
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
    }
}