import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";



const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/;
export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const session = await auth()
        if (!session || !session.user?.email) {
            return Response.json({ message: "Unauthorized" },
                { status: 400 }
            )
        }
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return Response.json({ message: "User not found" },
                { status: 400 }
            )
        }
        const { type, vehicleNumber, vehicleModel } = await req.json()
        if (!type || !vehicleNumber || !vehicleModel) {
            return Response.json({ message: "All fields are required" },
                { status: 400 }
            )
        }

        if (!VEHICLE_REGEX.test(vehicleNumber)) {
            return Response.json({ message: "Invalid vehicle number format" },
                { status: 400 }
            )
        }

        const duplicateVehicle = await Vehicle.findOne({
            vehicleNumber: vehicleNumber.toUpperCase(),
            // Find a vehicle with same number BUT owner should NOT be this user.
            owner: { $ne: user._id }
        })
        if (duplicateVehicle) {
            return Response.json({ message: "Vehicle number already exists" },
                { status: 400 }
            )
        }

        const number = vehicleNumber.toUpperCase()
        const vehicle = await Vehicle.findOne({ owner: user._id })
        if (vehicle) {
            vehicle.type = type
            vehicle.vehicleNumber = number
            vehicle.vehicleModel = vehicleModel
            vehicle.status = "pending"
            if (user.partnerOnboardingStep < 2) {
                user.partnerOnboardingStep = 2
                user.partnerStatus = "pending"
                await user.save()
            } else {
                user.partnerOnboardingStep = 3
                user.partnerStatus = "pending"
                await user.save()
            }
            await vehicle.save()
            return Response.json(vehicle,
                { status: 200 }
            )
        }
        const newVehicle = new Vehicle({
            owner: user._id,
            type,
            vehicleNumber: number,
            vehicleModel,
        })
        await newVehicle.save()
        if (user.partnerOnboardingStep < 1) {
            user.partnerOnboardingStep = 1
        }
        user.partnerStatus = "pending"
        user.role = "partner"
        await user.save()


        return Response.json(
            newVehicle,
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
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return Response.json({ message: "User not found" },
                { status: 400 }
            )
        }
        const vehicle = await Vehicle.findOne({ owner: user._id })
        if (!vehicle) {
            return Response.json({ message: "Vehicle not found" },
                { status: 404 }
            )
        }
        return Response.json(
            vehicle,
            { status: 200 }
        )
    } catch (error) {
        return Response.json({ message: `Internal server error: ${error}` },
            { status: 500 }
        )
    }
}