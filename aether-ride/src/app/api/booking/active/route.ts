import {NextResponse, NextRequest} from "next/server";
import  connectDB  from '@/lib/db'
import { auth } from '@/lib/auth'
import User from '@/models/user.model'
import Booking from '@/models/booking.model'


export async function POST( req: NextRequest ){
    try{
        await connectDB()
        const session = await auth()
        if( !session || !session?.user?.id ){
            return NextResponse.json(
                {booking:null}
            )
        }
        const { driverId, vehicleId, pickUpAddress, dropAddress } = await req.json()
        if( !driverId || !vehicleId || !pickUpAddress || !dropAddress ){
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }
        const user = await User.findOne({ email:session.user.email })
        if( !user ){
            return NextResponse.json({message:"User not found"},
                {status:400}
            )
        }
        const booking = await Booking.findOne({ 
            user: user._id,
            bookingStatus : {
                $in: ["requested", "awaiting_payment", "confirmed", "started"]
            },
            driver: driverId,
            vehicle: vehicleId,
            pickUpAddress: pickUpAddress,
            dropAddress: dropAddress
        })
        if(!booking){
            return NextResponse.json({booking:null})
        }
        return NextResponse.json({booking})
    }catch(error){  
        return NextResponse.json({message:`Active booking error: ${error}`},
            {status:500}
        )
    }
}