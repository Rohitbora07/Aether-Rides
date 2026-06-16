import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()
        const bookingId = (await context.params).id
        if (!bookingId) {
            return NextResponse.json({ message: "Booking ID is required" },
                { status: 400 }
            )
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ message: "Booking not found", success: false });
        }

        booking.paymentStatus = "cash";
        booking.bookingStatus = "confirmed";
        await booking.save();

        return NextResponse.json({ message: "Payment verified and booking confirmed", success: true }, { status: 200 });


    } catch (error) {
        return NextResponse.json({ message: `Payment verification error: ${error}`, success: false }, { status: 500 });
    }
}