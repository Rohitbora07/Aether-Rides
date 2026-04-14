import connectDB from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    
    try {
        
        const { email, name, password } = await req.json()
        await connectDB()
        if( !email || !name || !password ){
            return NextResponse.json(
                {message: "All fields are required"},
                {status:400}
            )
        }
        const existingUser = await User.findOne({email})
        if( existingUser ){
            return NextResponse.json(
                {message: "User with the same email already exists"},
                {status:400}
            )
        }
        if( password.length < 8 ){
            return NextResponse.json(
                {message: "Password must be at least 8 characters long"},
                {status:400}
            )
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            email,
            name,
            password: hashedPassword
        })
        await user.save()
        return NextResponse.json(
            {message: "User created successfully"},
            {status:201}
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            {message: "Something went wrong"},
            {status:500}
        )
    }

}