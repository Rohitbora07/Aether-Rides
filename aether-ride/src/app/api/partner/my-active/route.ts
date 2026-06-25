import {auth} from "@/lib/auth"
import connectDB from "@/lib/db"
import {NextResponse} from "next/server"
import User from "@/models/user.model"
import Booking from "@/models/booking.model"
import Vehicle from "@/models/vehicle.model"

export async function GET() {
    try{
        await connectDB()
        const session = await auth()
        if( !session || !session?.user?.email){
            return NextResponse.json({message: "Unauthorized"}, {status: 401})
        }
        const user = await User.findOne({email: session.user.email})
        if(!user){
            return NextResponse.json({message: "Unauthorized"}, {status: 401})
        }
        const booking = await Booking.findOne({
            driver: user._id,
            bookingStatus: { $in: ["confirmed", "started"] }
        }).populate("user vehicle driver")
        return NextResponse.json({booking}, {status: 200})
    }catch(err){
        console.log(err)
        return NextResponse.json({message: "Internal Server Error"}, {status: 500})
    }
}