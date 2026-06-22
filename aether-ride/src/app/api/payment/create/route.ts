import {NextResponse, NextRequest} from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";
import razorpay from "@/lib/razorpay";

export async function POST(req: NextRequest) {
    try{
        await connectDB();
        const {bookingId} = await req.json();
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({message: "Booking not found"}, {status: 404});
        }

        const order = await razorpay.orders.create({
            amount: booking.fare * 100, 
            currency: "INR",
            receipt: bookingId.toString(),
        })

        booking.bookingStatus = "awaiting_payment";
        await booking.save();
        console.log("RAZORPAY ORDER:", order);

        return NextResponse.json({orderId: order.id, amount: order.amount}, {status: 200});

    }catch (error){
        return NextResponse.json({message: `Payment creation error: ${error}`}, {status: 500});
    }
}
