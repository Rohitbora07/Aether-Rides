import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Booking from "@/models/booking.model";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "");
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json({ message: "Payment verification failed", success: false }, { status: 400 });
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ message: "Booking not found", success: false });
        }

        const adminCommission = booking.fare * 0.10;
        const partnerAmount = booking.fare - adminCommission;
        booking.paymentStatus = "paid";
        booking.bookingStatus = "confirmed";
        booking.adminCommission = adminCommission;
        booking.partnerAmount = partnerAmount;
        await booking.save();

        return NextResponse.json({ message: "Payment verified and booking confirmed", success: true }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: `Payment verification error: ${error}`, success: false }, { status: 500 });
    }
}