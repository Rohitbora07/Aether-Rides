import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
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

    }catch(error){

    }
}