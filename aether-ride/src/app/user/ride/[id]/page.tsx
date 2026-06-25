'use client'
import { useState, useEffect } from 'react'
import { USER_ACTIVE_BOOKING_ROUTE } from "@/constants/routes"
import axios from "axios"
import { motion } from "motion/react"
import { IBooking } from "../../../partner/pending-request/page"
import LiveRideMap from '../../../../components/partner/LiveRideMap'
import { BookingStatus } from '@/models/booking.model'
import { ChevronUp, Zap } from 'lucide-react'
import PanelContent from '../../../../components/partner/PanelContent'
import { PaymentStatus } from '@/models/booking.model'
import { useParams } from 'next/navigation'
import { getSocket } from '@/lib/socket'
import CompletedScreen from '@/components/partner/CompletedScreen'

function Page() {
    const [booking, setBooking] = useState<IBooking | null>(null);
    const [loading, setLoading] = useState(true);
    const [driverPos, setDriverPos] = useState<[number, number] | null>(null)
    const [pickUpPos, setPickUpPos] = useState<[number, number] | null>(null)
    const [dropPos, setDropPos] = useState<[number, number] | null>(null)
    const [distanceToPickup, setDistanceToPickup] = useState(0)
    const [distanceToDrop, setDistanceToDrop] = useState(0)
    const [etaToPickup, setEtaToPickup] = useState(0)
    const [etaToDrop, setEtaToDrop] = useState(0)
    const [status, setStatus] = useState("")
    const [chatOpen, setChatOpen] = useState(false)
    const [extended, setExtended] = useState(false)

    const MAP_STATUS: Record<BookingStatus, "arriving" | "ongoing" | "completed"> = {
        idle: "arriving",
        requested: "arriving",
        awaiting_payment: "arriving",
        confirmed: "arriving",
        started: "ongoing",
        completed: "completed",
        cancelled: "completed",
        rejected: "completed",
        expired: "completed",
    };

    const PAYMENT_BADGE: Record<PaymentStatus, { label: string; cls: string }> = {
        pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
        paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
        cash: { label: "Cash", cls: "bg-zinc-100 text-zinc-700" },
        failed: { label: "Failed", cls: "bg-red-100 text-red-700" }
    };

    const STATUS_LABEL: Record<BookingStatus, { label: string; sublabel: string; dot: string }> = {
        idle: { label: "Awaiting Confirmation", sublabel: "Booking is being processed", dot: "bg-amber-400" },
        requested: { label: "Awaiting Confirmation", sublabel: "Booking is being processed", dot: "bg-amber-400" },
        awaiting_payment: { label: "Payment Pending", sublabel: "Customer payment is pending", dot: "bg-purple-400" },
        confirmed: { label: "Heading to Pickup", sublabel: "Drive to the pickup location", dot: "bg-amber-400" },
        started: { label: "Ride in Progress", sublabel: "Heading to drop location", dot: "bg-emerald-400" },
        completed: { label: "Ride Completed", sublabel: "Trip has ended successfully", dot: "bg-zinc-400" },
        cancelled: { label: "Ride Cancelled", sublabel: "This ride was cancelled", dot: "bg-red-400" },
        rejected: { label: "Ride Rejected", sublabel: "Ride was rejected", dot: "bg-red-400" },
        expired: { label: "Request Expired", sublabel: "Booking timed out", dot: "bg-orange-400" }
    };

    const { id } = useParams()

    useEffect(() => {
        const fetchActiveBooking = async () => {
            setLoading(true)
            try {
                const { data } = await axios.post(USER_ACTIVE_BOOKING_ROUTE,{
                    bookingId: id
                })
                setPickUpPos([data.booking.pickUpLocation.coordinates[1], data.booking.pickUpLocation.coordinates[0]])
                setDropPos([data.booking.dropLocation.coordinates[1], data.booking.dropLocation.coordinates[0]])
                setBooking(data.booking)
                setStatus(data.booking.bookingStatus)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }
        fetchActiveBooking()
    }, [id])

    useEffect(() => {
        const socket = getSocket()
        socket.emit("join-ride",id)
        socket.on("driver-location",({latitude,longitude}) => {
            console.log("Driver location update received:", latitude, longitude)
            setDriverPos([latitude, longitude])
        })
        return () => { 
            socket.off("join-ride")
            socket.off("driver-location")
        }
    }, [id])


    const onChatToggle = () => {
        setChatOpen(prev => !prev)
    }
    const isActive = ["confirmed", "started"].includes(status)
    const displayEta = status === "confirmed" ? etaToPickup : etaToDrop
    const displayDistance = status === "confirmed" ? distanceToPickup : distanceToDrop
    const canChat = booking?.bookingStatus === "confirmed"

    if (loading) {
        return (
            <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />

                    <p className="text-white/40 text-sm tracking-widest uppercase font-medium">
                        Loading Ride...
                    </p>
                </div>
            </div>
        );
    }

    if( booking && status==="completed" ) {
        return <CompletedScreen booking={booking} role="user" />
    }

    const cfg = STATUS_LABEL[booking?.bookingStatus || "idle"]
    const paymentStatus = PAYMENT_BADGE[booking?.paymentStatus || "pending"]

    return (
        <div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden">
            <div className="relative flex-1 h-full z-0">
                <LiveRideMap
                    driverLocation={driverPos}
                    pickUpLocation={pickUpPos}
                    dropLocation={dropPos}
                    map_status={MAP_STATUS[booking?.bookingStatus || "idle"]}
                    onStats={({ distanceToPickup, etaToPickup, distanceToDrop, etaToDrop }) => {
                        setDistanceToPickup(distanceToPickup)
                        setEtaToPickup(etaToPickup)
                        setDistanceToDrop(distanceToDrop)
                        setEtaToDrop(etaToDrop)
                    }}
                />
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-500 pointer-events-none"
                >
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-zinc-100">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                        <span className="text-xs font-semibold tracking-wide text-zinc-900">
                            {cfg.label}
                        </span>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:flex w-105 xl:w-115 bg-white border- flex-col border-zinc-100 overflow-hidden"
            >
                <div className="bg-zinc-950 px-6 py-5  shrink-0">
                    <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
                        User Panel
                    </p>
                    <div className="flex items-center justify-between">
                        <h1 className="text-white text-xl font-bold">Active Ride</h1>

                        {isActive && (
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                                <Zap size={12} className="text-amber-400" />
                                <span className="text-white text-xs font-semibold">
                                    {Math.round(displayEta)} min
                                </span>
                            </div>
                        )}
                    </div>

                </div>

                <div className=" flex flex-1 flex-col overflow-hidden" >
                    <div className=" flex-1 overflow-y-auto no-scrollbar" >
                        <PanelContent
                            isActive={isActive}
                            displayDistance={displayDistance}
                            displayEta={displayEta}
                            cfg={cfg}
                            status={status}
                            booking={booking}
                            paymentStatus={paymentStatus}
                            canChat={canChat}
                            onChatToggle={onChatToggle}
                            chatOpen={chatOpen}
                            currentRole="user"
                        />
                    </div>
                </div>


            </motion.div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
                <motion.div
                    className="bg-white rounded-t-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
                    animate={{ height: extended ? "82vh" : 142 }}
                    transition={{ type: "spring", stiffness: 320, damping: 38 }}
                >
                    <div
                        onClick={() => setExtended(p => !p)}
                        className="shrink-0 cursor-pointer select-none">
                        <div className="pt-3 pb-1">
                            <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto" />
                        </div>

                        <div className="px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                                <div>
                                    <p className="text-sm font-bold text-zinc-900 leading-tight">{cfg.label}</p>
                                    <p className="text-xs text-zinc-400 leading-tight">{cfg.sublabel}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {isActive && (
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-zinc-900 leading-none">
                                            {Math.round(displayEta)}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                                            min
                                        </p>
                                    </div>
                                )}
                                <motion.div
                                    animate={{ rotate: extended ? 180 : 0 }}
                                    transition={{ duration: 0.28 }}
                                    className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
                                >
                                    <ChevronUp size={16} className="text-zinc-600" />
                                </motion.div>
                            </div>
                        </div>

                        <div className=" h-px mx-5 bg-zinc-200" />
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
                        <PanelContent
                            isActive={isActive}
                            displayDistance={displayDistance}
                            displayEta={displayEta}
                            cfg={cfg}
                            status={status}
                            booking={booking}
                            paymentStatus={paymentStatus}
                            canChat={canChat}
                            onChatToggle={onChatToggle}
                            chatOpen={chatOpen}
                            currentRole="user"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Page
