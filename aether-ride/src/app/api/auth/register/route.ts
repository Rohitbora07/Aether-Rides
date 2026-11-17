import connectDB from "@/lib/db";
import { verifyEmailTemplate } from "@/lib/emailTemplates/verifyEmail";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email: rawEmail, name, password } = await req.json();
        if (!rawEmail || !name || !password) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 },
            );
        }

        const email = rawEmail.trim().toLowerCase();

        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters long" },
                { status: 400 },
            );
        }

        await connectDB();

        const existingUser = await User.findOne({ email });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
        const html = verifyEmailTemplate(otp);

        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingUser && existingUser.isEmailVerified === false) {
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.otp = otp;
            existingUser.otpExpiresAt = otpExpiresAt;
            await existingUser.save();

            try {
                await sendMail(email, "Verify your email for AETHER RIDES", html);
            } catch (mailErr) {
                console.error("Error sending verification mail:", mailErr);
            }

            return NextResponse.json(
                {
                    user: existingUser,
                    message: "OTP sent to your email. Please verify.",
                },
                { status: 200 },
            );
        }

        if (existingUser) {
            return NextResponse.json(
                { message: "An account with this email already exists" },
                { status: 400 },
            );
        }

        const user = await User.create({
            email,
            name,
            password: hashedPassword,
            otp,
            otpExpiresAt,
            isEmailVerified: false,
        });

        try {
            await sendMail(email, "Verify your email for AETHER RIDES", html);
        } catch (mailErr) {
            console.error("Error sending verification mail:", mailErr);
        }

        return NextResponse.json(
            { user, message: "User registered successfully. Please verify your email with the OTP sent." },
            { status: 201 },
        );
    } catch (error) {
        console.error("Registration route error:", error);
        return NextResponse.json(
            { message: "Failed to register user. Please try again." },
            { status: 500 },
        );
    }
}
