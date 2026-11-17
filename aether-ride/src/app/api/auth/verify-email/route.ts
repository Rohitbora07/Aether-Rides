import connectDB from "@/lib/db";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email: rawEmail, otp } = await req.json();
        if (!rawEmail || !otp) {
            return NextResponse.json(
                { message: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const email = rawEmail.trim().toLowerCase();
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        if (user.isEmailVerified) {
            return NextResponse.json(
                { message: "Email is already verified. You can log in." },
                { status: 200 }
            );
        }

        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return NextResponse.json(
                { message: "OTP has expired. Please request a new one." },
                { status: 400 }
            );
        }

        if (!user.otp || user.otp.trim() !== String(otp).trim()) {
            return NextResponse.json(
                { message: "Invalid OTP. Please check your email and try again." },
                { status: 400 }
            );
        }

        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        return NextResponse.json(
            { message: "Email verified successfully! You can now log in." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error verifying email:", error);
        return NextResponse.json(
            { message: "Internal server error during verification" },
            { status: 500 }
        );
    }
}
