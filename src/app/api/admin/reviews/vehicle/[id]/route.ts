import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";
import User from "@/models/user.model";
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
){
    try{
            const session = await auth()
            if( !session || !session?.user?.email || session.user?.role !== "admin"){
                return Response.json({
                    message: "Unauthorized"
                }, { status: 401 })
            }
            await connectDB()
            const partnerId = (await context.params).id
            const partner = await User.findById(partnerId)
            if( !partner || partner.role !== "partner"){
                return Response.json({
                    message: "Partner not found",
                }, { status: 404 })
            }

            const vehicle = await Vehicle.findOne({ owner: partnerId }).populate("owner", "name email")
            if( !vehicle ){
                return Response.json({
                    message: "Vehicle not found"
                }, { status: 404 })
            }

            return Response.json({
                vehicle: vehicle
            },
            { status: 200 }
        )
        }catch(error){
            console.error("Error fetching vehicle review data:", error)
            return Response.json({
                message: "Internal Server Error"
            }, { status: 500 })
        }
}