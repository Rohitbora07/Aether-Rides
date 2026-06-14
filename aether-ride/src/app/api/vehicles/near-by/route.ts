import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db"
import User from "@/models/user.model"
import Vehicle from "@/models/vehicle.model"
export async function POST(req: NextRequest) {
    try{
        await connectDB()
        const { latitude, longitude, vehicleType } = await req.json()
        if(!latitude || !longitude ) {
            return NextResponse.json({ message: "Coordinates are required" }, { status: 400 })
        }
        if(!vehicleType){
            return NextResponse.json({ message: "Vehicle type is required" }, { status: 400 })
        }
        const partner = await User.find({
            role: "partner",
            isOnline: true,
            partnerStatus: "approved",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 5000
                }
            }
        })

        const partnerIds = partner.map((p) => p._id)
        if( partnerIds.length === 0){
            return NextResponse.json([], { status: 200 })
        }
        const vehicles = await Vehicle.find({
            owner: { $in: partnerIds },
            type: vehicleType,
            status: "approved",
            isActive: true
        }).lean()

        return NextResponse.json({ vehicles }, { status: 200 })


    }catch(err){
        return NextResponse.json({ message: `message occurred while fetching nearby vehicles: ${err}` }, { status: 500 })
    }
}