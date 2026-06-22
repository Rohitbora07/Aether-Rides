import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@/lib/auth";
import User from "@/models/user.model";
import Booking from "@/models/booking.model";


export async function POST( req: NextRequest ) {
    try{
        await connectDB()
        const session = await auth()
        if(!session?.user?.id){
            return NextResponse.json({ message: "Unauthorized" }, { status: 400 })
        }
        const { driverId, vehicleId, pickUpAddress, dropAddress, pickUpCoords, dropCoords, mobileNumber, fare } = await req.json()
        if( !driverId || !vehicleId || !pickUpAddress || !dropAddress || !pickUpCoords.coordinates || !dropCoords.coordinates || !mobileNumber || !fare ){
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
        }

        const driver = await User.findById(driverId)
        if(!driver){
            return NextResponse.json({ message: "Driver not found" }, { status: 404 })
        }
        const existingBooking = await Booking.findOne({
            user: session.user.id,
            bookingStatus : {
                $in: ["requested", "awaiting_payment", "confirmed", "started"]
            },
            driver: driverId,
            vehicle: vehicleId,
            pickUpAddress: pickUpAddress,
            dropAddress: dropAddress
        })

        if(existingBooking){
            // console.log("Existing booking found:", existingBooking)
            return NextResponse.json(existingBooking)
        }

        const newBooking = await Booking.create({
            user: session.user.id,
            driver,
            vehicle: vehicleId,
            pickUpAddress,
            dropAddress,    
            pickUpLocation: pickUpCoords,
            dropLocation: dropCoords,
            fare,
            userMobile: mobileNumber,
            driverMobile: driver.mobileNumber,
            bookingStatus: "requested",
        })

        return NextResponse.json({newBooking}, { status: 201 })

    } catch (err) {
        return NextResponse.json({ message: `Failed to create booking: ${err}` }, { status: 500 })
    }
}