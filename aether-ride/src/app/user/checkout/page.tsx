'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, MapPin, Navigation, Bike, Car, Truck, XCircle, Search, CheckCircle, IndianRupee, Clock, CreditCard, ShieldCheck, Loader2, Banknote, Wallet } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { CREATE_BOOKING_ROUTE, ACTIVE_BOOKING_ROUTE, CANCEL_BOOKING_ROUTE, CREATE_PAYMENT_ROUTE, VERIFY_PAYMENT_ROUTE, CONFIRM_BOOKING_ROUTE } from '@/constants/routes'
import {getSocket} from "@/lib/socket"

type BookingStatus = "idle" | "requested" | "rejected" | "awaiting_payment" | "payment" | "expired" | "confirmed"
const VEHICLE_META = {
    bike: { label: "Bike", Icon: Bike },
    car: { label: "Car", Icon: Car },
    truck: { label: "Truck", Icon: Truck },
    auto: { label: "Auto", Icon: Car },
    loading: { label: "Lorry", Icon: Truck },
}

function Page() {
    const router = useRouter()
    const params = useSearchParams()
    const mobile = params.get('mobile')
    const vehicle = params.get('vehicleType') || ""
    const pickUpLat = params.get('pickUpLat')
    const pickUpLon = params.get('pickUpLon')
    console.log("pickUpLat", pickUpLat, "pickUpLon", pickUpLon)
    const dropLat = params.get('dropLat')
    const driverId = params.get('driverId')
    const vehicleId = params.get('vehicleId')
    const dropLon = params.get('dropLon')
    const [pickUp, setPickUp] = useState(params.get('pickUp') || '')
    const [drop, setDrop] = useState(params.get('drop') || '')
    const [fare, setFare] = useState(params.get('fare') || '')
    console.log("vehicle", vehicle)
    const [status, setStatus] = useState<BookingStatus>("idle")
    const [loading, setLoading] = useState(false)
    const [booking, setBooking] = useState<{ _id?: string; bookingStatus?: BookingStatus } | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("cash")

    const { label, Icon } = VEHICLE_META[vehicle as keyof typeof VEHICLE_META]

    const createBooking = async () => {
        try {
            setLoading(true)
            const { data } = await axios.post(CREATE_BOOKING_ROUTE, {
                driverId: driverId,
                vehicleId: vehicleId,
                pickUpAddress: pickUp,
                dropAddress: drop,
                pickUpCoords: {
                    type: "Point",
                    coordinates: [pickUpLon, pickUpLat]
                },
                dropCoords: {
                    type: "Point",
                    coordinates: [dropLon, dropLat]
                },
                mobileNumber: mobile,
                fare: Number(fare)
            })
            setStatus("requested")
            setBooking(data.newBooking)
            if (data == null || data === undefined) console.error("No data returned from booking creation")
            console.log("Booking created:", data.newBooking)
        } catch (err) {
            console.log("Failed to create booking", err)
        } finally {
            setLoading(false)
        }
    }

    console.log("Current status:", status, "Booking:", booking)
    useEffect(() => {
        const fetchActiveBooking = async () => {
            try {
                const { data } = await axios.post(ACTIVE_BOOKING_ROUTE, {
                    driverId,
                    vehicleId: vehicleId,
                    pickUpAddress: pickUp,
                    dropAddress: drop
                })
                // console.log("Active booking data:", data)
                setStatus(data.booking?.bookingStatus || "idle")
                console.log("Active booking fetched:", data)
                setBooking(data.booking || null)
            } catch (error) {
                console.log("Failed to fetch active booking", error)
            }
        }
        fetchActiveBooking()
    }, [])

    const cancelBooking = async (id: string) => {
        try {
            const { data } = await axios.get(CANCEL_BOOKING_ROUTE(id))
            console.log("Booking cancelled:", data)
            setStatus("idle")
        } catch (err) {
            console.log("Failed to cancel booking", err)
        }
    }

    useEffect(() => {
        if (status !== "awaiting_payment") return
        const t = setTimeout(() => {
            setStatus("payment")
        }, 2000)
        return () => clearTimeout(t)
    }, [status])

    useEffect(() => {
        const socket = getSocket()
        socket.on("accept-booking", (data) => {
            setStatus(data)
        })
        socket.on("reject-booking", (data) => {
            setStatus(data)
        })
        return () => {
            socket.off("accept-booking")
            socket.off("reject-booking")
        }
    })

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (typeof window === "undefined") {
                resolve(false)
                return
            }
            if ((window as Window & { Razorpay?: unknown }).Razorpay) {
                resolve(true)
                return
            }
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => {
                resolve(true)
            }
            script.onerror = () => {
                resolve(false)
            }
            document.body.appendChild(script)
        })
    }

    const handleConfirmPayment = async () => {
        if (!booking || !paymentMethod) return
        setLoading(true)
        try {
            if (paymentMethod === "online") {
                const scriptLoaded = await loadRazorpayScript()
                if (!scriptLoaded) {
                    alert("Failed to load Razorpay script. Please try again.")
                    return
                }

                const { data } = await axios.post(CREATE_PAYMENT_ROUTE, {
                    bookingId: booking._id,
                })
                if (!data?.orderId) {
                    console.error("Invalid Razorpay order response", data);
                    return;
                }
                console.log("Create payment response", data);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (!process.env.NEXT_PUBLIC_RAZORPAY_API_KEY) {
                    console.error("Razorpay API key not set in environment variables");
                    return;
                }
                console.log("Using Razorpay API Key:", process.env.NEXT_PUBLIC_RAZORPAY_API_KEY);
                const paymentObject = new (window as any).Razorpay({
                    key: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY,
                    amount: data.amount,
                    currency: "INR",
                    name: "Aether Rides",
                    description: "Ride Payment",
                    order_id: data.orderId,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handler: async function (response: any) {
                        const { data } = await axios.post(VERIFY_PAYMENT_ROUTE, {
                            bookingId: booking._id,
                            ...response
                        })
                        if (data.success) {
                            setStatus("confirmed")
                            window.location.href = `/user/ride/${booking._id}`
                        }
                    }
                })

                paymentObject.open()
            } else {
                const { data } = await axios.get(CONFIRM_BOOKING_ROUTE(booking._id!))
                if (data.success) {
                    setStatus("confirmed")
                    window.location.href = `/user/ride/${booking._id}`
                }
            }
        } catch (error) {
            console.error("Payment error:", error)
        } finally {
            setLoading(false)
        }
    }


    return (
        // <div className="flex flex-row gap-4 items-center justify-center h-screen">
        //     <Image src="/pickup.png" width={500} height={500} alt="Checkout" />
        //     <Image src="/drop.png" width={500} height={500} alt="Checkout" />
        // </div>
        <div className="min-h-screen bg-zinc-100 px-4 py-12">
            <div className="relative max-w-6xl mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-px w-8 bg-zinc-900" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Booking</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900">Checkout</h1>
                    <p className="text-zinc-400 text-sm mt-1.5 font-medium">Review your ride and confirm</p>
                </motion.div>
                <div className="grid lg:grid-cols-2 gap-6" >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                        className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
                    >
                        <div className="h-1 bg-zinc-900" />
                        <div className="p-8 sm:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">Selected Vehicle</div>
                                    <div className="text-3xl font-black tracking-tight text-zinc-900">{vehicle}</div>
                                </div>
                                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Icon size={28} className="text-white" />
                                </div>
                            </div>
                            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden mb-6">
                                <div className="flex gap-4 px-5 py-4 border-b border-zinc-100">
                                    <div className="flex flex-col items-center shrink-0 pt-0.5">
                                        <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white ring ring-zinc-300" />
                                        <div
                                            className="w-px flex-1 bg-zinc-300 my-1"
                                            style={{ minHeight: 12 }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-0.5">Pickup</div>
                                        <div className="text-sm font-semibold text-zinc-900 leading-snug truncate">{pickUp}</div>
                                    </div>
                                    <MapPin size={14} className="text-zinc-500 mt-1 shrink-0" />
                                </div>

                                <div className="flex gap-4 px-5 py-4 border-b border-zinc-100">
                                    <div className="flex flex-col items-center shrink-0 pt-0.5">
                                        <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white ring ring-zinc-300" />
                                        <div
                                            className="w-px flex-1 bg-zinc-300 my-1"
                                            style={{ minHeight: 12 }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-0.5">Drop-off</div>
                                        <div className="text-sm font-semibold text-zinc-900 leading-snug truncate">{drop}</div>
                                    </div>
                                    <Navigation size={14} className="text-zinc-500 mt-1 shrink-0" />
                                </div>
                            </div>

                            <div className=" flex items-center justify-between pt-6 border-t border-zinc-100" >
                                <div>
                                    <p className="text-[13px] font-black uppercase tracking-[0.18em] text-zinc-700 mb-1">Total Fare</p>
                                    <p className="text-zinc-400 text-xs font-medium">Includes base + distance charges</p>
                                </div>

                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    className="flex items-baseline gap-1"
                                >
                                    <span className="text-zinc-400 text-lg font-black">
                                        <IndianRupee size={18} />
                                    </span>
                                    <span className="text-zinc-900 text-5xl font-black tracking-tight">
                                        {fare}
                                    </span>
                                </motion.div>
                            </div>

                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                        className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
                    >
                        <div className="h-1 bg-zinc-900" />

                        <div className="flex-1 p-8 sm:p-10 flex flex-col">
                            <AnimatePresence mode="wait">
                                {(status === "idle" || status === "rejected") && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col flex-1 justify-between"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">Ready to go</p>

                                            <h3 className="text-2xl font-black text-zinc-900 mb-6">Confirm Your Ride</h3>

                                            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 space-y-3">
                                                {[
                                                    {
                                                        icon: <Clock size={14} />, text: "Driver will respond within 2 minutes",
                                                    },
                                                    {
                                                        icon: <ShieldCheck size={14} />, text: "Verified & insured drivers only",
                                                    },
                                                    {
                                                        icon: <CreditCard size={14} />, text: "Pay after driver accepts",
                                                    },
                                                ].map((item, index) => (
                                                    <div key={index} className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">{item.icon}</div>
                                                        <p className="text-zinc-500 text-xs font-medium">{item.text}</p>
                                                    </div>
                                                ))
                                                }
                                            </div>
                                        </div>

                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={createBooking}
                                            className="w-full h-14 mt-8 bg-zinc-900 hover:bg-black disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-colors shadow-md"
                                        >
                                            <span>Request Ride</span>
                                            <ArrowRight size={15} />
                                        </motion.button>
                                    </motion.div>
                                )}

                                {status === "requested" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.35 }}
                                        className="flex flex-col flex-1 items-center justify-center gap-6 text-center"
                                    >
                                        <div className="relative mt-20">
                                            <motion.div
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 rounded-full bg-zinc-900"
                                            />

                                            <div className="relative w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
                                                <Loader2 size={28} className="text-zinc-900 animate-spin" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-zinc-900 mb-1">Finding Your Driver</h3>
                                            <p className="text-zinc-400 text-sm font-medium">Waiting for driver to accept...</p>
                                        </div>

                                        <motion.div
                                            onClick={() => booking?._id && cancelBooking(booking._id)}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors border border-zinc-200 hover:border-zinc-400 px-4 py-2.5 rounded-xl"
                                        >
                                            <XCircle size={13} />
                                            Cancel Request
                                        </motion.div>
                                    </motion.div>
                                )}

                                {status === "awaiting_payment" && (
                                    <motion.div
                                        key="awaiting_payment"
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.35 }}
                                        className="flex mt-20 flex-col flex-1 items-center justify-center gap-5 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 260, damping: 16 }}
                                            className="w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center"
                                        >
                                            <CheckCircle size={36} className=" text-zinc-900" />

                                        </motion.div>
                                        <div>
                                            <h3 className="text-xl font-black text-zinc-900 mb-1">Ride Accepted By Driver</h3>
                                            <p className="text-zinc-400 text-sm font-medium">Preparing payment options...</p>
                                        </div>
                                        <div className="w-48 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 2 }}
                                                className="h-full bg-zinc-900 rounded-full"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {status === "payment" && (
                                    <motion.div
                                        key="payment"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col flex-1 gap-6"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">Almost There</p>
                                            <h3 className="text-2xl font-black text-zinc-900">Select Payment Method</h3>
                                        </div>
                                        <div className=" space-y-4" >
                                            {[
                                                {
                                                    id: "cash", Icon: Banknote, title: "Cash", sub: "Pay driver after ride",
                                                },
                                                {
                                                    id: "online", Icon: Wallet, title: "Online Payment", sub: "UPI • Card • Netbanking",
                                                },
                                            ].map((p, i) => {
                                                const active = paymentMethod === p.id;

                                                return (
                                                    <motion.div
                                                        key={p.id}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={() => setPaymentMethod(p.id as "online" | "cash")}
                                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${active ? "bg-zinc-900 border-zinc-900" : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"}`}
                                                    >
                                                        <p.Icon size={20} className={active ? "text-white" : "text-zinc-700"} />

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={active ? "text-white font-bold" : "text-zinc-900 font-bold"}>
                                                                {p.title}
                                                            </h4>

                                                            <p className={active ? "text-zinc-400 text-sm" : "text-zinc-500 text-sm"}>
                                                                {p.sub}
                                                            </p>
                                                        </div>
                                                        <AnimatePresence>
                                                            {active && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    exit={{ scale: 0 }}
                                                                >
                                                                    <CheckCircle size={16} className="text-white shrink-0" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            whileHover={paymentMethod ? { scale: 1.02 } : {}}
                                            disabled={!paymentMethod}
                                            onClick={handleConfirmPayment}
                                            className="w-full h-14 bg-zinc-900 hover:bg-black disabled:opacity-30 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-colors shadow-md mt-auto"
                                        >
                                            {
                                                loading ?
                                                    <Loader2 size={16} className="animate-spin" />
                                                    :
                                                    paymentMethod === "cash" ?
                                                        (
                                                            <><Banknote size={16} /><span>Confirm Cash Ride</span>
                                                            </>
                                                        ) : (
                                                            <><span>Proceed to Payment</span><ArrowRight size={16} />
                                                            </>
                                                        )}
                                        </motion.button>
                                    </motion.div>
                                )}

                                {status === "confirmed" && (
                                    <motion.div
                                        key="confirmed"
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="flex flex-col mt-20 flex-1 items-center justify-center gap-6 text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0, rotate: -20 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.1 }}
                                            className="relative"
                                        >
                                            <div className="relative w-24 h-24 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
                                                <CheckCircle size={44} className="text-zinc-900" />
                                                {[0, 1].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ scale: 1, opacity: 0.5 }}
                                                        animate={{ scale: 2.2 + i * 0.6, opacity: 0 }}
                                                        transition={{ duration: 0.9, delay: 0.2 + i * 0.15 }}
                                                        className="absolute inset-0 rounded-full border-2 border-zinc-900"
                                                    />
                                                ))}
                                            </div>


                                        </motion.div>
                                        <div>
                                            <motion.h3
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="text-2xl font-black text-zinc-900 mb-1"
                                            >
                                                Ride Confirmed!
                                            </motion.h3>

                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="text-zinc-400 text-sm font-medium max-w-xs"
                                            >
                                                Your driver is on the way. Track live from the ride screen.
                                            </motion.p>
                                        </div>
                                        <motion.button
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            whileTap={{ scale: 0.97 }}
                                            whileHover={{ scale: 1.03 }}
                                            onClick={() => {
                                                if (!booking?._id) return;
                                                window.location.href = `/user/ride/${booking._id}`;
                                            }}
                                            className="flex items-center gap-2.5 bg-zinc-900 hover:bg-black text-white font-black text-sm px-8 py-4 rounded-2xl transition-colors shadow-md"
                                        >
                                            Track Your Ride
                                            <ArrowRight size={16} />
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Page
