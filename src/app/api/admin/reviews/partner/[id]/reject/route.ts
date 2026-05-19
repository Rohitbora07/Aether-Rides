import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export async function POST(
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
            const {rejectionReason} = await req.json()
            const partnerId = (await context.params).id
            const partner = await User.findById(partnerId)
            if( !partner || partner.role !== "partner"){
                return new Response("Partner not found", { status: 404 })
            }

            if( partner.partnerStatus === "approved"){
                return new Response("Partner already approved", { status: 400 })
            }
            partner.partnerStatus = "rejected"
            partner.rejectionReason = rejectionReason
            await partner.save()

            return Response.json({
                data:{
                    message: "Partner rejected successfully",
                    partner
                }
            }, { status: 200 })

        }catch(error){
            console.error("Error fetching partner review data:", error)
            return Response.json({
                message: "Internal Server Error"
            }, { status: 500 })
        }
}