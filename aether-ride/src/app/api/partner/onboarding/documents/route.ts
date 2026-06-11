import { auth } from "@/lib/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import PartnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest) {
    try{
        await connectDB()
        const session = await auth()
        if( !session || !session.user?.email ){
            return Response.json({message:"Unauthorized"},
                {status:400}
            )
        }
        const user = await User.findOne({ email:session.user.email })
        if( !user ){
            return Response.json({message:"User not found"},
                {status:400}
            )
        }

        const formData = await req.formData()
        const aadharCard = formData.get("aadharCard") as Blob
        const rc = formData.get("rc") as Blob
        const license = formData.get("license") as Blob

        if( !aadharCard || !rc || !license ){
            return Response.json({message:"All documents are required"},
                {status:400}
            )
        }

        const updatePayload: {
            status: "pending";
            aadharCardUrl?: string;
            rcUrl?: string;
            licenseUrl?: string;
        } = {
            status:"pending"
        }
        if( aadharCard ){
            const aadharUrl = await uploadOnCloudinary(aadharCard)
            if( !aadharUrl ){
                return Response.json({message:"Failed to upload aadhar card"},
                    {status:500}
                )
            }
            updatePayload.aadharCardUrl = aadharUrl
        }   

        if( rc ){
            const url = await uploadOnCloudinary(rc)
            if( !url ){
                return Response.json({message:"Failed to upload RC"},
                    {status:500}
                )
            }
            updatePayload.rcUrl = url
        }
        if( license ){
            const url = await uploadOnCloudinary(license)
            if( !url ){
                return Response.json({message:"Failed to upload license"},
                    {status:500}
                )
            }
            updatePayload.licenseUrl = url
        }

        const partnerDocs = await PartnerDocs.findOneAndUpdate(
            { owner: user._id },
            {$set: updatePayload},
            { new: true, upsert: true }
        )

        if( user.partnerOnboardingStep < 2 ){
            user.partnerOnboardingStep = 2
        }else{
            user.partnerOnboardingStep = 3
        }
        user.partnerStatus = "pending"
        await user.save()

        return Response.json(partnerDocs,
            {status:201}
        )

    }catch(error){
        return Response.json({message:`Internal server error: ${error}`},
            {status:500}
        )
    }
}