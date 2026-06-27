import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";

export async function GET(){
    try {
        await connectDB();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const bookings = await Booking.find({
            paymentStatus:"paid",
            createdAt: { $gte: sevenDaysAgo }
        }).select("adminCommission createdAt");

        const earningMap: Record<string, number> = {}

        bookings.forEach( b => {
            const dateKey = new Date(b.createdAt).toLocaleDateString("en-IN",{
                day: "2-digit",
                month:"short"
            })
            if(!earningMap[dateKey]){
                earningMap[dateKey] = 0
            }
            earningMap[dateKey] = earningMap[dateKey] + b.adminCommission || 0
        })

        const earnings = Object.entries(earningMap).map(([date, earning]) => ({
            date,
            earning
        }))

        return NextResponse.json({ earnings }, { status: 200 });
    } catch (error) {
        console.error("Error fetching admin earnings:", error);
        return NextResponse.json({ error: "Failed to fetch admin earnings" }, { status: 500 });
    }
}