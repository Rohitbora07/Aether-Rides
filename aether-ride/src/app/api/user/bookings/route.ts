import connectDB from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import User from '@/models/user.model'
import Booking from '@/models/booking.model'
import mongoose from "mongoose";  

export async function GET() {
    try {
        await connectDB()
        const session = await auth()
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" },
                { status: 400 }
            )
        }

        console.log("Registered models:", mongoose.modelNames());  

        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return NextResponse.json({ message: "User not found" },
                { status: 400 }
            )
        }

        const bookings = await Booking.find({
            user: user._id,
        }).populate("user driver vehicle").sort({ createdAt: -1 })
        return NextResponse.json({ bookings }, { status: 200 })
    }catch (error) {
        return NextResponse.json({ message: `Bookings error: ${error}` },
            { status: 500 }
        )
    }
}