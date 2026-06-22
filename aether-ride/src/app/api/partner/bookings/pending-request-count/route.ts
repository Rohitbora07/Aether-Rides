import { NextResponse } from 'next/server'
import  connectDB  from '@/lib/db'
import { auth } from '@/lib/auth'
import User from '@/models/user.model'
import Booking from '@/models/booking.model'
export async function GET(){
    try{
        await connectDB()
        const session = await auth()
        if( !session || !session.user?.email ){
            return NextResponse.json({message:"Unauthorized"},
                {status:400}
            )
        }
        const partner = await User.findOne({ email:session.user.email })
        if( !partner ){
            console.log("Partner not found for email:", session.user.email)
            return NextResponse.json({message:"User not found"},
                {status:400}
            )
        }
        const count = await Booking.countDocuments({
            driver: partner.id,
            bookingStatus: "requested"
        })
        console.log(`Pending request count for partner ${partner.email}: ${count}`)
        return NextResponse.json({count}, {status:200})
    }catch(error){
        return NextResponse.json({message:`Pending request count error: ${error}`},
            {status:500}
        )
    }
}