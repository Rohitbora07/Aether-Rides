import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import {auth} from "@/lib/auth";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";

export async function GET(){
    try {
        await connectDB();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const session = await auth()

        const driver = await User.findOne({ email: session?.user?.email });
        if (!driver) {
            return NextResponse.json({ message: "Driver not found" }, { status: 404 });
        }

        const bookings = await Booking.find({
            driver: driver._id,
            paymentStatus:"paid",
            createdAt: { $gte: sevenDaysAgo }
        }).select("partnerAmount createdAt");

        const earningMap: Record<string, number> = {}

        bookings.forEach( b => {
            const dateKey = new Date(b.createdAt).toLocaleDateString("en-IN",{
                day: "2-digit",
                month:"short"
            })
            if(!earningMap[dateKey]){
                earningMap[dateKey] = 0
            }
            earningMap[dateKey] = earningMap[dateKey] + b.partnerAmount || 0
        })

        const earnings = Object.entries(earningMap).map(([date, earning]) => ({
            date,
            earning
        }))

        return NextResponse.json({ earnings }, { status: 200 });
    } catch (error) {
        console.error("Error fetching partner earnings:", error);
        return NextResponse.json({ error: "Failed to fetch partner earnings" }, { status: 500 });
    }
}