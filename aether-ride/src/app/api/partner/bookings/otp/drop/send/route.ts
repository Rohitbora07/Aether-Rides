import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import { sendMail } from "@/lib/sendMail"
import { dropOtpTemplate } from "@/lib/emailTemplates/dropOtpTemplate";

export async function POST(req: NextRequest) {
    try{
        await connectDB()
        const { bookingId } = await req.json()
        if (!bookingId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
        const booking = await Booking.findById(bookingId)
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }   

        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        booking.dropOtp = otp
        booking.dropOtpExpiry = new Date(Date.now() + 5 * 60 * 1000) 

        await booking.populate("user vehicle driver")

        console.log("Booking:", booking)

        const html = dropOtpTemplate(otp, booking.driver.name, booking.vehicle.vehicleModel, booking.vehicle.vehicleNumber)

        await booking.save()

        if(booking.user.email){
            await sendMail(
                booking.user.email,
                `Drop OTP for your ride`,
                html
            )
        }

        return NextResponse.json({ message: "Drop OTP sent successfully" }, { status: 200 })
    } catch (error) {
        console.error("Error in drop OTP send route:", error)
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
    }
}