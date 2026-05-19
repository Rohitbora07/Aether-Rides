import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import PartnerBank from "@/models/partnerBank.models";
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

        const { accountHolderName, accountNumber, ifscCode, upiId, mobileNumber } = await req.json()
        if( !accountHolderName || !accountNumber || !ifscCode || !mobileNumber ){
            return Response.json({message:"Required fields are missing"},
                {status:400}
            )
        }

        const partnerBank = await PartnerBank.findOneAndUpdate(
            { owner: user._id },
            {
                accountHolderName,
                accountNumber,
                ifscCode: ifscCode.toUpperCase(),
                upiId,
                status: "added"
            },
            { new: true, upsert: true }
        )
        user.mobileNumber = mobileNumber
            user.partnerOnboardingStep = 3
        user.partnerStatus = "pending"
        await user.save()

        return Response.json(partnerBank,
            {status:200}
        )


    }catch(error){
        return Response.json({message:`Internal server error: ${error}`},
            {status:500}
        )
    }
}

export async function GET() {
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
        const partnerBank = await PartnerBank.findOne({ owner: user._id })
        if( !partnerBank ){
            return Response.json({message:"Bank details not found"},
                {status:404}
            )
        }
        return Response.json(
            {partnerBank, mobileNumber: user.mobileNumber},
            {status:200}
        )
    }catch(error){
        return Response.json({message:`Internal server error: ${error}`},
            {status:500}
        )
    }
}