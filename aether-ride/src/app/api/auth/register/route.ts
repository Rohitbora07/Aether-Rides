import connectDB from "@/lib/db";
import { verifyEmailTemplate } from "@/lib/emailTemplates/verifyEmail";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {



    try {
        const { email, name, password } = await req.json();
        if (!email || !name || !password) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 },
            );
        }

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
        const html = verifyEmailTemplate(otp)

        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingUser && existingUser.isEmailVerified === false) {
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.email = email;
            existingUser.otp = otp;
            existingUser.otpExpiresAt = otpExpiresAt;
            await existingUser.save();
            return NextResponse.json(
                {
                    user: existingUser,
                    message: "OTP resent. Please verify your email.",
                },
                { status: 200 },
            );
        }

        if (existingUser) {
            return NextResponse.json(
                { message: "User with the same email already exists" },
                { status: 400 },
            );
        }

        const user = await User.create({
            email,
            name,
            password: hashedPassword,
            otp,
            otpExpiresAt,
        });
        await sendMail(
            email,
            "Verify your email for AETHER RIDES",
            html
        )
        return NextResponse.json(
            { user, message: "User registered successfully" },
            { status: 201 },
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 },
        );
    }
}
