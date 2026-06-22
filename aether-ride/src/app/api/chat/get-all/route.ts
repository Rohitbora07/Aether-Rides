import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import ChatMessage from "@/models/chatMessage.model"

export async function POST( req: NextRequest ) {
    try{
        await connectDB()
        const { bookingId} = await req.json()
        if (!bookingId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const messages = await ChatMessage.find({
            bookingId,
        })

        return NextResponse.json({ message: "Messages retrieved successfully", messages: messages }, { status: 200 })

    }catch(error){
        console.error("Error in chat get-all route:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}