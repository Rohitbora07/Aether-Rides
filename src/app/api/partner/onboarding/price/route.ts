import { auth } from "@/lib/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const session = await auth()
        if (!session || !session.user?.email) {
            return Response.json({ message: "Unauthorized" },
                { status: 400 }
            )
        }
        const partner = await User.findOne({ email: session.user.email })
        if (!partner) {
            return Response.json({ message: "Partner not found" },
                { status: 400 }
            )
        }

        const vehicle = await Vehicle.findOne({ owner: partner._id })
        if (!vehicle) {
            return Response.json({ message: "Vehicle details not found" },
                { status: 404 }
            )
        }

        const formaData = await req.formData()
        const vehicleImage = formaData.get("vehicleImage") as File
        const baseFare = formaData.get("baseFare")
        const pricePerKm = formaData.get("pricePerKm")
        const waitingChargePerMin = formaData.get("waitingChargePerMin")
        let updated = false
        if (vehicleImage && vehicleImage.size > 0) {
            const imageUrl = await uploadOnCloudinary(vehicleImage)
            vehicle.imageUrl = imageUrl
            updated = true
        }
        if (baseFare !== null) {
            vehicle.baseFare = Number(baseFare)
            updated = true
        }
        if (pricePerKm !== null) {
            vehicle.pricePerKm = Number(pricePerKm)
            updated = true
        }
        if (waitingChargePerMin !== null) {
            vehicle.waitingChargePerMin = Number(waitingChargePerMin)
            updated = true
        }

        if (!updated) {
            return Response.json({ message: "No data to update" },
                { status: 400 }
            )
        }
        vehicle.status = "pending"
        vehicle.rejectionReason = undefined
        await vehicle.save()
        partner.partnerOnboardingStep = 5
        await partner.save()

        return Response.json({ message: "Vehicle details updated successfully" },
            { status: 200 }
        )


    } catch (error) {
        return Response.json({ message: `Internal server error: ${error}` },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        await connectDB()
        const session = await auth()
        if (!session || !session.user?.email) {
            return Response.json({ message: "Unauthorized" },
                { status: 400 }
            )
        }
        const partner = await User.findOne({ email: session.user.email })
        if (!partner) {
            return Response.json({ message: "Partner not found" },
                { status: 400 }
            )
        }

        const vehicle = await Vehicle.findOne({ owner: partner._id })
        if (!vehicle) {
            return Response.json({ message: "Vehicle details not found" },
                { status: 404 }
            )
        }

        return Response.json( vehicle ,
            { status: 200 }
        )


    } catch (error) {
        return Response.json({ message: `Internal server error: ${error}` },
            { status: 500 }
        )
    }
}