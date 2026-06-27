'use client'
import { motion } from "motion/react"
import { useEffect, useState } from 'react'
import axios from "axios"
import { PARTNER_PENDING_BOOKINGS_ROUTE, PARTNER_ACCEPT_BOOKING_ROUTE, PARTNER_REJECT_BOOKING_ROUTE } from "@/constants/routes"
import { Loader2, MapPin, Navigation, Clock, IndianRupee } from "lucide-react"
import { BookingStatus, PaymentStatus } from "@/models/booking.model"
import { useRouter } from "next/navigation"
import {getSocket} from "@/lib/socket"

export interface IBooking {
    _id: string
    user: {
        _id: string
        name: string
    }
    driver: {
        _id: string
        name: string
    }
    vehicle: {
        _id: string
        vehicleModel: string
        vehicleNumber: string
        type: string
    }

    pickUpAddress: string
    dropAddress: string

    pickUpLocation: {
        type: string
        coordinates: number[]
    }
    dropLocation: {
        type: string
        coordinates: number[]
    }
    paymentDeadLine: Date
    fare: number
    userMobile: string
    driverMobile: string
    bookingStatus: BookingStatus
    paymentStatus: PaymentStatus

    adminCommission: number
    partnerAmount: number

    pickUpOtp: string
    dropOtp: string
    pickUpOtpExpiry: Date
    dropOtpExpiry: Date
    createdAt?: Date
    updatedAt?: Date
}

function Page() {

    const [bookings, setBookings] = useState<IBooking[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const pendingBookings = async () => {
            setLoading(true)
            try {
                const { data } = await axios.get(PARTNER_PENDING_BOOKINGS_ROUTE)
                setBookings(data.bookings)
            } catch (error) {
                console.error("Error fetching pending bookings:", error)
            } finally {
                setLoading(false)
            }
        }
        pendingBookings()
    }, [])

    const handleAccept = async (id: string) => {
        try {
            // console.log("Accepting booking with ID:", id)
            await axios.get(PARTNER_ACCEPT_BOOKING_ROUTE(id))
            router.push("/partner/bookings")
            // console.log("Booking accepted:", data)
        } catch (err) {
            console.error("Error accepting booking:", err)
        }
    }

    const handleReject = async (id: string) => {
        try {
            await axios.get(PARTNER_REJECT_BOOKING_ROUTE(id))
            // // console.log("Booking rejected:", data)
            window.location.reload()
        } catch (err) {
            console.error("Error rejecting booking:", err)
        }
    }

    useEffect(() => {
        const socket = getSocket()
        const handleNewBooking = (data: IBooking) => {
            // console.log("New booking received:", data)
            setBookings((prev) => [...prev, data])
        }
        socket.on("new-booking",(data: IBooking) => {
            handleNewBooking(data)
        })
        return () => {
            socket.off("new-booking")
        }
    })

    return (
        <div className="min-h-screen bg-[#f4f5f7]">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <h1 className="text-4xl font-semibold text-gray-900">
                        Ride Requests
                    </h1>
                    <p className="mt-3 text-gray-500 text-lg">
                        Manage incoming ride requests and respond in real time.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin w-8 h-8 text-gray-700" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                        <p className="text-gray-500 text-lg">No pending ride requests.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((b, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.25 }}
                                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                                    {/* Left Column */}
                                    <div className="flex-1 space-y-6">

                                        {/* Pickup Location */}
                                        <div className=" flex gap-4" >
                                            <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase text-gray-400 mb-1">Pickup Location</p>
                                                <p className="text-gray-900 font-medium">{b.pickUpAddress}</p>
                                            </div>
                                        </div>

                                        {/* Drop Location */}
                                        <div className=" flex gap-4" >
                                            <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center">
                                                <Navigation size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase text-gray-400 mb-1">Drop Location</p>
                                                <p className="text-gray-900 font-medium">{b.dropAddress}</p>
                                            </div>
                                        </div>

                                        {/* Booking Time */}
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                            <Clock size={14} className="opacity-70" />

                                            <span className="font-medium">
                                                {b.createdAt ? new Date(b.createdAt).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }) : "—"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="flex flex-col justify-between lg:items-end gap-6 w-full lg:w-auto">
                                        <div className="text-left lg:text-right">
                                            <p className="text-xs tracking-wide text-gray-400 uppercase mb-1">Estimated Fare</p>

                                            <div className="flex items-center gap-2 text-3xl font-bold text-gray-900 lg:justify-end">
                                                <IndianRupee size={20} />
                                                {b.fare}
                                            </div>
                                        </div>

                                        {/* Reject and Accept Buttons */}
                                        <div className="flex gap-4 w-full lg:w-auto">
                                            <button className="flex-1 lg:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                                                onClick={() => handleReject(b?._id)}
                                            >
                                                Reject
                                            </button>

                                            <button
                                                onClick={() => handleAccept(b._id)}
                                                className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 transition-all duration-200 active:scale-[0.98] disabled:opacity-50">
                                                Accept Ride
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Page
