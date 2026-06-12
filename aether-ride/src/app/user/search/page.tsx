'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, MapPin, Navigation, Bike, Car, Truck, Zap, Search, RefreshCcw } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchMap from '@/components/vehicleSearch/SearchMap'
import axios from 'axios'
import { NEARBY_VEHICLES_ROUTE } from '@/constants/routes'
import VehicleCard from '@/components/vehicleSearch/vehicleCard'
import {VehicleType} from '@/models/vehicle.model'

const VEHICLE_META = {
    bike: { label: "Bike", Icon: Bike },
    car: { label: "Car", Icon: Car },
    truck: { label: "Truck", Icon: Truck },
    auto: { label: "Auto", Icon: Car },
    loading: { label: "Lorry", Icon: Truck },
}

type IVehicle = {
    owner: string;
    type: VehicleType;
    vehicleNumber: string;
    vehicleModel: string;
    imageUrl?: string;
    baseFare?: number;
    pricePerKm?: number;
    waitingChargePerMin?: number;
    status: "approved" | "pending" | "rejected";
    rejectionReason?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

function Page() {
    const router = useRouter()
    const params = useSearchParams()
    const mobile = params.get('mobile')
    const vehicle = params.get('vehicle')
    const pickupLat = params.get('pickuplat')
    const pickupLon = params.get('pickuplon')
    const dropLat = params.get('droplat')
    const dropLon = params.get('droplon')
    const [pickUp, setPickUp] = useState(params.get('pickup') || '')
    const [drop, setDrop] = useState(params.get('drop') || '')
    const [km, setKm] = useState(0)
    const [nearbyVehicles, setNearbyVehicles] = useState<IVehicle[]>([])
    const [loading, setLoading] = useState(false)
    const meta = vehicle ? VEHICLE_META[vehicle as keyof typeof VEHICLE_META] : null

    const getNearbyVehicles = async (latitude: number, longitude: number, vehicleType: string | null) => {
        setLoading(true)
        try {
            const { data } = await axios.post(NEARBY_VEHICLES_ROUTE, {
                latitude,
                longitude,
                vehicleType
            })
            setNearbyVehicles(data.vehicles || [])
            setLoading(false)
        } catch (err) {
            console.error("Error fetching nearby vehicles:", err)
            setLoading(false)
        }
    }

    useEffect(() => {
        (async () => {
            await getNearbyVehicles(Number(pickupLat), Number(pickupLon), vehicle)
        }
        )()
    }, [pickupLat, pickupLon, vehicle, pickUp])

    return (
        <div className="min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden">
            <div className="absolute top-5 left-5 z-50">
                <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => router.back()}
                    className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                    <ArrowLeft size={17} className="text-zinc-900" />
                </motion.button>
            </div>
            <div className=" relative w-full z-0 h-[52vh]" >
                <SearchMap
                    pickUp={pickUp}
                    drop={drop}
                    onChange={(p, d) => { setPickUp(p); setDrop(d); }}
                    onDistance={setKm}
                />
            </div>

            <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
                className="relative z-20 -mt-10 bg-white rounded-t-[28px] border-t border-zinc-200 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] pt-5 pb-20 min-h-[52vh]"
            >
                <div className="px-5 lg:px-8 max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden mb-5"
                    >
                        <div className="flex gap-3 px-4 py-3 border-b border-zinc-100">
                            <div className="flex flex-col items-center pt-1.5 shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />

                                <div className="w-px flex-1 bg-zinc-300 my-1" style={{ minHeight: 14 }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-zinc-400 text-uppercase tracking-widest font-semibold mb-0.5">Pickup</p>
                                <p className="text-sm text-zinc-900 font-semibold leading-snug truncate">{pickUp || "-"}</p>
                            </div>
                            <MapPin size={16} className="text-green-500 shrink-0 mt-2" />
                        </div>
                        <div className="flex gap-3 px-4 py-3 border-b border-zinc-100">
                            <div className="flex flex-col items-center pt-1.5 shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />

                                <div className="w-px flex-1 bg-zinc-300 my-1" style={{ minHeight: 14 }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-zinc-400 text-uppercase tracking-widest font-semibold mb-0.5">Drop</p>
                                <p className="text-sm text-zinc-900 font-semibold leading-snug truncate">{drop || "-"}</p>
                            </div>
                            <Navigation size={16} className="text-red-500 shrink-0 mt-2" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between mb-4"
                    >
                        <div>
                            <h2 className="text-zinc-900 text-lg font-black tracking-tight">
                                {loading
                                    ? "Finding Vehicles"
                                    : nearbyVehicles.length > 0
                                        ? "Available Vehicles"
                                        : "No Nearby Vehicles"}
                            </h2>
                            {
                                meta && (
                                    <div className=" text-xs text-zinc-400 mt-0.5" >
                                        {meta.label} rides near your pickup location
                                    </div>
                                )
                            }
                        </div>
                        <AnimatePresence>
                            {
                                loading ? (
                                    <motion.div
                                        key="searching"
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full"
                                    >
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />

                                        <span className="text-zinc-500 text-xs font-semibold">
                                            Searching...
                                        </span>
                                    </motion.div>
                                ) : nearbyVehicles.length > 0 ? (
                                    <motion.div
                                        key="live"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
                                    >
                                        <Zap size={11} className="text-emerald-600 fill-emerald-600"
                                        />
                                        <span className="text-emerald-700 text-xs font-bold">Live</span>
                                    </motion.div>
                                ) : null
                            }
                        </AnimatePresence>

                    </motion.div>

                    <AnimatePresence>
                        {!loading && nearbyVehicles.length == 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-14 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4">
                                    <Search size={26} className="text-zinc-400" />
                                </div>
                                <p className="text-zinc-900 text-base mb-1 font-bold">Vehicles Not Found</p>
                                <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                                    No {(meta?.label || "Vehicle")} drivers are available near your
                                    pickup right now.
                                </p>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => getNearbyVehicles(Number(pickupLat), Number(pickupLon), vehicle)}
                                    className="mt-5 flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
                                >
                                    <RefreshCcw size={14} />
                                    Retry Search
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {nearbyVehicles.map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: i * 0.06,
                                    duration: 0.38,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                <VehicleCard
                                vehicle={v}
                                distance={km}
                                onBook={
                                    () => {
                                        const url = new URLSearchParams({
                                            vehicleId: v.type,
                                            pickup: pickUp,
                                            drop: drop,
                                            driverId: v.owner,
                                            fare: String((v.baseFare ?? 0) + (v.pricePerKm ?? 0) * km),
                                            pickuplat: String(pickupLat),
                                            pickuplon: String(pickupLon),
                                            droplat: String(dropLat),
                                            droplon: String(dropLon),
                                            mobile: String(mobile)
                                        })
                                        router.push(`/user/checkout?${url.toString()}`)
                                    }
                                }
                                />
                            </motion.div>
                        ))}
                    </div>


                </div>


            </motion.div>
        </div>
    )
}

export default Page
