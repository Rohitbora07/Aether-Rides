import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank.models";
import PartnerDocs from "@/models/partnerDocs.model";
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
                return new Response("Partner not found", { status: 404 })
            }

            if( partner.partnerStatus === "approved"){
                return new Response("Partner already approved", { status: 400 })
            }
            const partnerDocs = await PartnerDocs.findOne({ owner: partnerId })
            const partnerBank = await PartnerBank.findOne({ owner: partnerId })

            if( !partnerDocs || !partnerBank){
                return new Response("Partner documents or bank details not found", { status: 404 })
            }

            partner.partnerStatus = "approved"
            partner.partnerOnboardingStep = 4
            await partner.save()
            partnerDocs.status = "approved"
            await partnerDocs.save()
            partnerBank.status = "verified"
            await partnerBank.save()

            return Response.json({
                message: "Partner approved successfully"
            }, { status: 200 })

        }catch(error){
            console.error("Error fetching partner review data:", error)
            return Response.json({
                message: "Internal Server Error"
            }, { status: 500 })
        }
}