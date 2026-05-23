import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";

export async function GET() {
    try {
        await connectDB()
        const session = await auth()
        if (!session || !session.user?.email || session.user.role !== "admin") {
            return Response.json({ message: "Unauthorized" },
                { status: 400 }
            )
        }
        const totalPartners = await User.countDocuments({ role: "partner" })
        const totalApprovedPartners = await User.countDocuments({ role: "partner", partnerStatus: "approved" })
        const totalRejectedPartners = await User.countDocuments({ role: "partner", partnerStatus: "rejected" })
        const totalPendingPartners = await User.countDocuments({ role: "partner", partnerStatus: "pending" })

        const totalVehicles = await Vehicle.countDocuments({ baseFare: { $exists: true }, pricePerKm: { $exists: true }, waitingChargePerMin: { $exists: true } })
        const totalApprovedVehicles = await Vehicle.countDocuments({ status: "approved", baseFare: { $exists: true }, pricePerKm: { $exists: true }, waitingChargePerMin: { $exists: true } })
        const totalRejectedVehicles = await Vehicle.countDocuments({ status: "rejected", baseFare: { $exists: true }, pricePerKm: { $exists: true }, waitingChargePerMin: { $exists: true } })
        const totalPendingVehicles = await Vehicle.countDocuments({ status: "pending", baseFare: { $exists: true }, pricePerKm: { $exists: true }, waitingChargePerMin: { $exists: true } })

        const pendinPartnerUsers = await User.find({
            role: "partner",
            partnerStatus: "pending",
            partnerOnboardingStep: { $gte: 3 }
        })

        const partnerIds = pendinPartnerUsers.map(user => user._id)

        const partnerVehicles = await Vehicle.find({
            owner: { $in: partnerIds }
        })

        const vehicleType = new Map(
            partnerVehicles.map(vehicle => [String(vehicle._id), vehicle.type])
        )

        const pendingPartnersReviews = pendinPartnerUsers.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            vehicleType: vehicleType.get(String(user._id))
        }))


        const pendingVehicles = await Vehicle.find({
            status: "pending",
            baseFare: { $exists: true },
            pricePerKm: { $exists: true },
            waitingChargePerMin: { $exists: true },
        }).populate("owner", "name email")
        return Response.json({
            pendingVehicles,
            vehicleStats: {
                totalVehicles,
                totalApprovedVehicles,
                totalRejectedVehicles,
                totalPendingVehicles
            },
            stats: {
                totalPartners,
                totalApprovedPartners,
                totalRejectedPartners,
                totalPendingPartners
            },
            pendingPartnersReviews
        },
            { status: 200 }
        )

    } catch (error) {
        return Response.json({ message: `Internal server error: ${error}` },
            { status: 500 }
        )
    }
}