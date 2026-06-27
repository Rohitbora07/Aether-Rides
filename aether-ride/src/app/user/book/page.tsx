
'use client'
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { VehicleType } from '@/models/vehicle.model'
import { ArrowLeft, Bike, Car, Package, Truck, CheckCircle, Phone, LocateFixed, ChevronRight, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const stepVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
}

const VEHICLES = [
    { id: "bike", label: "Bike", icon: Bike, desc: "2 wheeler" },
    { id: "auto", label: "Auto", icon: Car, desc: "3 wheeler ride" },
    { id: "car", label: "Car", icon: Car, desc: "4 wheeler ride" },
    { id: "loading", label: "Loading", icon: Package, desc: "Small goods" },
    { id: "truck", label: "Truck", icon: Truck, desc: "Heavy transport" },
]

type Place = {
    id: string,
    name: string,
    city?: string,
    state?: string,
    country?: string,
    country_code?: string,
    lat: number,
    lon: number,
}
type PhotonFeature = {
    properties: {
        place_id: string
        name?: string
        city?: string
        state?: string
        country?: string
        countrycode?: string
    }
    geometry: {
        coordinates: [number, number]
    }
}

function Page() {
    const router = useRouter()
    const [vehicle, setVehicle] = useState<VehicleType | undefined>(undefined)
    const [pickUpLocation, setpickUpLocation] = useState("")
    const [dropLocation, setDropLocation] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [pickUpCountry, setPickUpCountry] = useState("")
    const [pickUpLat, setpickUpLat] = useState<number | undefined>()
    const [pickUpLon, setpickUpLon] = useState<number | undefined>()
    const [dropLat, setdropLat] = useState<number | undefined>()
    const [dropLon, setdropLon] = useState<number | undefined>()
    const [locating, setLocating] = useState(false)
    const [pickUpSuggestions, setPickUpSuggestions] = useState<Place[] | undefined>([])
    const [dropSuggestions, setDropSuggestions] = useState<Place[] | undefined>([])
    const progress = [!!pickUpLocation, !!dropLocation, !!(mobileNumber.length === 10), !!vehicle].filter(Boolean).length

    const currentLocation = () => {
        if (!navigator.geolocation) return
        setLocating(true)
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            try {
                const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
                if (!apiKey) {
                    setLocating(false)
                    return
                }
                const params = new URLSearchParams({
                    lat: coords.latitude.toString(),
                    lon: coords.longitude.toString(),
                    apiKey,
                })
                const url = `https://api.geoapify.com/v1/geocode/reverse?${params}`
                const { data } = await axios.get(url)
                const p = data.features[0].properties
                setpickUpLocation(p.formatted)
                setPickUpCountry(p.country)
                setpickUpLat(coords.latitude)
                setpickUpLon(coords.longitude)
                setLocating(false)
            } catch (err) {
                console.error(err)
                setLocating(false)
            }
        })
    }

    const searchAddress = async (query: string, setResults: (r: Place[]) => void) => {
        try {
            if (!query || query.trim().length < 3) {
                setResults([])
                return
            }
            const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
            if (!apiKey) {
                setResults([])
                return
            }

            const params = new URLSearchParams({
                text: query.trim(),
                limit: "10",
                filter: "countrycode:in",
                apiKey,
            });

            const url = `https://api.geoapify.com/v1/geocode/autocomplete?${params}`;
            const { data } = await axios.get(url)
            // console.log(data)
            const results: Place[] = (data.features ?? []).map((f: PhotonFeature) => ({
                id: f.properties.place_id,
                name: f.properties.name,
                city: f.properties.city,
                state: f.properties.state,
                country: f.properties.country,
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                country_code: f.properties.countrycode,
            }))         
            setResults(results)
        } catch (err) {
            console.error(err)
            setResults([])
        }
    }

    const suggestion = (p: Place) => [p.name, p.city, p.state, p.country].filter(Boolean).join(", ")
    const canContinue = !!(vehicle && pickUpLocation && dropLocation && mobileNumber.length === 10 && pickUpLat && pickUpLon && dropLat && dropLon)

    return (
        <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10">
            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md"
            >
                <div className="flex items-center gap-4 mb-6 px-1">
                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => router.push("/")}
                        className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0"
                    >
                        <ArrowLeft size={13} className="text-zinc-900" />
                    </motion.button>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-zinc-900 text-xl font-black tracking-tight">
                            Book a Ride
                        </h1>

                        <p className="text-zinc-400 text-xs mt-0.5">
                            Fill in the details below
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {[0, 1, 2, 3].map((d, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    width: i < progress ? 20 : 8,
                                    background: i < progress ? "#09090b" : "#d4d4d8",
                                }}
                                transition={{ duration: 0.3 }}
                                className="h-2 rounded-full"
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-visible">
                    <div className="h-1 bg-zinc-900 w-full" />

                    <div className="p-6 space-y-7">
                        <motion.div
                            variants={stepVariants}
                            initial={"hidden"}
                            animate={"visible"}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                                    <span className="text-white text-[9px] font-black">1</span>
                                </div>

                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    Choose Vehicle
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                {VEHICLES.map((v, i) => {
                                    const active = vehicle === v.id

                                    return (
                                        <motion.div
                                            key={v.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.07 + i * 0.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setVehicle(v.id as VehicleType)}
                                            className={`relative p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all duration-200 ${active
                                                ? "bg-zinc-900 border-zinc-900 shadow-lg"
                                                : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"
                                                }`}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? "bg-white" : "bg-zinc-200"
                                                    }`}
                                            >
                                                <v.icon
                                                    size={18}
                                                    className={active ? "text-zinc-900" : "text-zinc-600"}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className={`text-sm font-bold truncate ${active ? "text-white" : "text-zinc-900"}`}
                                                >{v.label}</p>
                                                <p className={`text-[10px] truncate ${active ? "text-zinc-400" : "text-zinc-400"}`}
                                                >{v.desc}</p>
                                            </div>
                                            {active && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-2.5 right-2.5"
                                                >
                                                    <CheckCircle size={13} className="text-white fill-white/20"
                                                    />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>

                        <div className="h-px bg-zinc-200"></div>

                        <motion.div
                            variants={stepVariants}
                            initial={"hidden"}
                            animate={"visible"}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                                    <span className="text-white text-[9px] font-black">2</span>
                                </div>

                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    Mobile Number
                                </p>
                            </div>

                            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all"
                            >
                                <div className="w-8 h-8 rounded-xl shrink-0 bg-zinc-200 flex items-center justify-center">
                                    <Phone size={14} className="text-zinc-600" />
                                </div>
                                <input
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                                    placeholder="Enter your mobile number"
                                    inputMode="numeric"
                                    maxLength={15}
                                    className="flex-1 bg-transparent text-sm font-semibold placeholder:text-zinc-400 outline-none"
                                />
                                <AnimatePresence>
                                    {mobileNumber.length === 10 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <CheckCircle
                                                size={16}
                                                className="text-emerald-500 fill-emerald-50 shrink-0"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <p className="text-zinc-400 text-[10px] mt-1.5 ml-1">
                                Ride updates will be sent to this number
                            </p>
                        </motion.div>

                        <div className="h-px bg-zinc-200"></div>

                        <motion.div
                            variants={stepVariants}
                            initial={"hidden"}
                            animate={"visible"}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                                    <span className="text-white text-[9px] font-black">3</span>
                                </div>

                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    Pickup & Drop-off Location
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-visible">
                                    <div className="relative z-30">
                                        <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-t-2xl transition-colors">
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow" />
                                                <div className="w-px h-5 bg-zinc-300 mt-1" />
                                            </div>
                                            <textarea
                                                onChange={(e) => {
                                                    setpickUpLocation(e.target.value)
                                                    searchAddress(e.target.value, setPickUpSuggestions)
                                                }
                                                }
                                                value={pickUpLocation}
                                                placeholder="Pickup location"
                                                className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                                            />
                                            <motion.button
                                                whileTap={{ scale: 0.88 }}
                                                onClick={currentLocation}
                                                disabled={locating}
                                                className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition-colors flex items-center justify-center shrink-0"
                                            >
                                                <LocateFixed size={14} className={`text-zinc-700 ${locating ? 'animate-spin' : ''}`} />
                                            </motion.button>
                                        </div>
                                        <AnimatePresence>
                                            {(pickUpSuggestions?.length ?? 0) > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-32 overflow-y-auto z-50"
                                                >
                                                    {(pickUpSuggestions ?? []).map((p, i) => (
                                                        <motion.div
                                                            key={p.id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: i * 0.03 }}
                                                            onClick={() => {
                                                                setpickUpLocation(suggestion(p))
                                                                setPickUpCountry(p.country ?? "")
                                                                setpickUpLat(p.lat)
                                                                setpickUpLon(p.lon)
                                                                setPickUpSuggestions([])
                                                            }}
                                                            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
                                                        >
                                                            <MapPin
                                                                size={13}
                                                                className="text-zinc-400 shrink-0"
                                                            />

                                                            <span className="text-sm text-zinc-800 font-medium truncate">
                                                                {suggestion(p)}
                                                            </span>

                                                            <ChevronRight
                                                                size={13}
                                                                className="text-zinc-300 shrink-0 ml-auto"
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </div>


                                </div>


                                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-visible">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-t-2xl transition-colors">
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow" />
                                                <div className="w-px h-5 bg-zinc-300 mt-1" />
                                            </div>

                                            <textarea
                                                onChange={(e) => {
                                                    setDropLocation(e.target.value)
                                                    searchAddress(e.target.value, setDropSuggestions)
                                                }
                                                }
                                                disabled={!pickUpCountry}
                                                value={dropLocation}
                                                placeholder={pickUpCountry ? "Drop-off location" : "Enter pickup location first"}
                                                className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {(dropSuggestions?.length ?? 0) > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-32 overflow-y-auto z-50"
                                                >
                                                    {(dropSuggestions ?? []).map((p, i) => (
                                                        <motion.div
                                                            key={p.id}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: i * 0.03 }}
                                                            onClick={() => {
                                                                setDropLocation(suggestion(p))
                                                                setdropLat(p.lat)
                                                                setdropLon(p.lon)
                                                                setDropSuggestions([])
                                                            }}
                                                            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
                                                        >
                                                            <MapPin
                                                                size={13}
                                                                className="text-zinc-400 shrink-0"
                                                            />

                                                            <span className="text-sm text-zinc-800 font-medium truncate">
                                                                {suggestion(p)}
                                                            </span>

                                                            <ChevronRight
                                                                size={13}
                                                                className="text-zinc-300 shrink-0 ml-auto"
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </div>


                                </div>
                            </div>

                        </motion.div>

                        <div className="h-px bg-zinc-200"></div>

                        <motion.div
                            variants={stepVariants}
                            initial={"hidden"}
                            animate={"visible"}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                whileHover={canContinue ? { scale: 1.02 } : {}}
                                disabled={!canContinue}
                                onClick={() => {
                                    router.push(`/user/search?pickUp=${encodeURIComponent(pickUpLocation)}&drop=${encodeURIComponent(dropLocation)}&vehicle=${vehicle}&mobile=${encodeURIComponent(mobileNumber)}&pickUpLat=${pickUpLat}&pickUpLon=${pickUpLon}&dropLat=${dropLat}&dropLon=${dropLon}`)
                                }}
                                className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black disabled:opacity-35 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-colors shadow-lg disabled:shadow-none"
                            >
                                <span>Continue</span>
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

            </motion.div>
        </div>
    )
}

export default Page
