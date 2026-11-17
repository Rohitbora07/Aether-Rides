import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@/lib/auth";
import User from "@/models/user.model";
import Booking from "@/models/booking.model";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
        }
        const { driverId, vehicleId, pickUpAddress, dropAddress, pickUpCoords, dropCoords, mobileNumber, fare } = await req.json();
        if (!driverId || !vehicleId || !pickUpAddress || !dropAddress || !pickUpCoords?.coordinates || !dropCoords?.coordinates || !mobileNumber || fare === undefined) {
            return NextResponse.json({ message: "Missing required booking details." }, { status: 400 });
        }

        const driver = await User.findById(driverId);
        if (!driver) {
            return NextResponse.json({ message: "Driver not found." }, { status: 404 });
        }

        const existingBooking = await Booking.findOne({
            user: session.user.id,
            bookingStatus: {
                $in: ["requested", "awaiting_payment", "confirmed", "started"]
            },
            driver: driverId,
            vehicle: vehicleId,
            pickUpAddress: pickUpAddress,
            dropAddress: dropAddress
        });

        if (existingBooking) {
            return NextResponse.json({ newBooking: existingBooking }, { status: 200 });
        }

        const newBooking = await Booking.create({
            user: session.user.id,
            driver: driverId,
            vehicle: vehicleId,
            pickUpAddress,
            dropAddress,
            pickUpLocation: pickUpCoords,
            dropLocation: dropCoords,
            fare,
            userMobile: mobileNumber,
            driverMobile: driver.mobileNumber || "N/A",
            bookingStatus: "requested",
        });

        try {
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
            if (socketUrl) {
                await axios.post(`${socketUrl}/emit`, {
                    event: "new-booking",
                    userId: driverId,
                    data: newBooking
                }, { timeout: 4000 });
                console.log("New booking emitted to driver:", driverId);
            }
        } catch (socketErr) {
            console.warn("Socket broadcast to driver skipped or timed out:", socketErr);
        }

        return NextResponse.json({ newBooking }, { status: 201 });

    } catch (err) {
        console.error("Error creating booking:", err);
        return NextResponse.json({ message: `Failed to create booking: ${err}` }, { status: 500 });
    }
}
