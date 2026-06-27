import {auth} from "@/lib/auth"
import connectDB from "@/lib/db"
import {NextResponse, NextRequest} from "next/server"
import Booking from "@/models/booking.model"

export async function POST(req: NextRequest) {
    try{
        await connectDB()
        const session = await auth()
        if( !session || !session?.user?.email){
            return NextResponse.json({message: "Unauthorized"}, {status: 401})
        }

        const { bookingId } = await req.json()
        if(!bookingId){
            return NextResponse.json({message: "Booking ID is required"}, {status: 400})
        }
        const booking = await Booking.findById(bookingId).populate("user vehicle driver")
        return NextResponse.json({booking}, {status: 200})
    }catch(err){
        console.log(err)
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}