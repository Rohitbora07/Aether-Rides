import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import ChatMessage from "@/models/chatMessage.model"

export async function POST( req: NextRequest ) {
    try{
        await connectDB()
        const { bookingId, sender, message } = await req.json()
        if (!bookingId || !sender || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const msg = await ChatMessage.create({
            bookingId,
            sender,
            message,
        })

        return NextResponse.json({ message: "Message sent successfully", msg: msg }, { status: 201 })

    }catch(error){
        console.error("Error in chat route:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}