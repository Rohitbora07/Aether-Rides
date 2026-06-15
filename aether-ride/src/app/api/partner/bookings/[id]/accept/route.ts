import connectDB from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import Booking from '@/models/booking.model'

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await context.params).id
        if( !id ){
            return NextResponse.json({ message: "Booking ID is required" },
                { status: 400 }
            )
        }
        console.log("Accepting booking with ID:", id)
        await connectDB()
        const booking = await Booking.findById(id)
        if (!booking  && booking.bookingStatus !== "requested") {
            return NextResponse.json({ message: "Booking not found" },
                { status: 400 }
            )
        }
        booking.bookingStatus = "awaiting_payment"
        booking.paymentDeadLine = new Date(Date.now() + 5 * 60 * 1000) // 15 minutes from now
        await booking.save()
        return NextResponse.json({ success: true }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: `Accept Bookings error: ${error}` },
            { status: 500 }
        )
    }
}