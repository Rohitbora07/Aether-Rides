import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";

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
                return Response.json("Partner not found", { status: 404 })
            }


            const vehicle = await Vehicle.findOne({ owner: partnerId })
            if( !vehicle ){
                return Response.json("Vehicle not found", { status: 404 })
            }
            vehicle.status = "approved"
            vehicle.rejectionReason = undefined
            await vehicle.save()
            partner.partnerStatus = "approved"
            partner.partnerOnboardingStep = 6
            await partner.save()
            

            return Response.json({
                vehicle: vehicle,
                message: "Vehicle approved successfully"
            }, { status: 200 })

        }catch(error){
            console.error("Error fetching partner review data:", error)
            return Response.json({
                message: "Internal Server Error"
            }, { status: 500 })
        }
}