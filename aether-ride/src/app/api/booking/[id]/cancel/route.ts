import connectDB from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import Booking from '@/models/booking.model'

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await context.params).id
        await connectDB()
        const booking = await Booking.findById(id)
        if (!booking && booking.bookingStatus !== "requested") {
            return NextResponse.json({ message: "Booking not found" },
                { status: 400 }
            )
        }
        booking.bookingStatus = "cancelled"
        await booking.save()
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: `Cancel Bookings error: ${error}` },
            { status: 500 }
        )
    }
}