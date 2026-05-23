'use client'
import { motion } from "motion/react"
import { ArrowLeft, Bike, Car, CircleDashed, Package, Truck } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import { ONBOARDING_VEHICLE } from "@/constants/routes"

function Page() {
    const router = useRouter()
    const VEHICLES = [
        { id: "bike", label: "Bike", icon: Bike, desc: "2 wheeler" },
        { id: "auto", label: "Auto", icon: Car, desc: "3 wheeler ride" },
        { id: "car", label: "Car", icon: Car, desc: "4 wheeler ride" },
        { id: "loading", label: "Loading", icon: Package, desc: "Small goods" },
        { id: "truck", label: "Truck", icon: Truck, desc: "Heavy transport" },
    ]
    const [vechicleType, setVehicleType] = useState("")
    const [vehicleNumber, setVehicleNumber] = useState("")
    const [vehicleModel, setVehicleModel] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const handleVehicle = async () => {
        setErr("")
        try {
            setLoading(true)
            const { data } = await axios.post(ONBOARDING_VEHICLE, {
                type: vechicleType,
                vehicleNumber: vehicleNumber,
                vehicleModel: vehicleModel
            })
            router.push("/")
            setLoading(false)
            console.log(data)
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setErr(error?.response?.data?.message ?? "Something went wrong by axios")
            } else {
                setErr("Something went wrong")
            }
            setLoading(false)
        }
    }
    useEffect(() => {
        const getVehicle = async () => {
            try {
                const { data } = await axios.get(ONBOARDING_VEHICLE)
                console.log(data)
                if(!data.vehicle) return
                setVehicleType(data.vehicle.type)
                setVehicleModel(data.vehicle.vehicleModel)
                setVehicleNumber(data.vehicle.vehicleNumber)
                setErr("")
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    setErr(error?.response?.data?.message ?? "Something went wrong by axios")
                } else {
                    setErr("Something went wrong")
                }
            }
        }
        getVehicle()
    }, [])
    return (
        <div className="min-h-screen m-6 bg-white flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
            >
                <div className="relative text-center">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition">
                        <ArrowLeft size={18} />
                    </button>
                    <p className="text-xs text-gray-500 font-medium">
                        Step 1 of 3
                    </p>

                    <h1 className="text-2xl font-bold mt-0">
                        Vehicle Details
                    </h1>

                    <p className="text-sm text-gray-500 mt-0">
                        Add your Vehicle Information
                    </p>
                </div>

                <div className="mt-4 space-y-2">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Vehicle Type</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {VEHICLES.map((v, i) => {
                                const Icon = v.icon
                                const active = v.id === vechicleType
                                return (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => setVehicleType(v.id)}
                                        className={`rounded-xl border p-3 flex flex-col items-center gap-1 transition ${active
                                            ? "bg-black text-white border-black"
                                            : "border-gray-200 hover:border-black"
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? "bg-white text-black" : "bg-black text-white"
                                                }`}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div className="text-sm font-semibold">{v.label}</div>
                                        <p className={`text-xs ${active ? "text-gray-300" : "text-gray-500"}`}>
                                            {v.desc}
                                        </p>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="vn" className=" text-xs font-semibold text-gray-500" >Vehicle Number</label>
                        <input
                            type="text"
                            placeholder="MH12AB1234"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                            id="vn"
                            className="w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="vm" className=" text-xs font-semibold text-gray-500" >Vehicle Model</label>
                        <input
                            type="text"
                            placeholder="Tata Ace Zip"
                            value={vehicleModel}
                            onChange={(e) => setVehicleModel(e.target.value)}
                            id="vm"
                            className="w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
                        />
                    </div>
                </div>

                <p className="text-red-500 text-sm mt-2">{err}</p>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={!vechicleType || !vehicleNumber || !vehicleModel || loading}
                    className= " mt-4 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
                    onClick={handleVehicle}
                >
                    {loading ? <CircleDashed className="text-white animate-spin" size={18} /> : "Continue"}
                </motion.button>

            </motion.div>
        </div>
    )
}

export default Page
