'use client'
import { IVehicle } from '@/models/vehicle.model';
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import Image from 'next/image';
import { CircleDashed, ImagePlus, IndianRupee } from 'lucide-react';
import { ONBOARDING_PRICE } from '@/constants/routes';
import axios from 'axios';

type PricingModalProps = {
    open: boolean;
    onClose: () => void;
    data: IVehicle | null;
}

function PricingModal({ open, onClose, data }: PricingModalProps) {

    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [baseFare, setBaseFare] = useState("")
    const [pricePerKm, setPricePerKm] = useState("")
    const [waitingChargePerMin, setWaitingChargePerMin] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)


    const handlePriceSubmit = async () => {
        setErr("")
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("baseFare", baseFare)
            formData.append("pricePerKm", pricePerKm)
            formData.append("waitingChargePerMin", waitingChargePerMin)
            if (image) {
                formData.append("vehicleImage", image)
            }
            await axios.post(ONBOARDING_PRICE, formData)
            onClose()
            setLoading(false)
            // console.log(data)
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setErr(error?.response?.data?.message ?? "Something went wrong by axios")
            } else {
                setErr("Something went wrong")
            }
            setLoading(false)
        }
    }

    useEffect(() =>{
        if( data ){
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBaseFare(data.baseFare?.toString() ?? "")
            setPricePerKm(data.pricePerKm?.toString() ?? "")
            setWaitingChargePerMin(data.waitingChargePerMin?.toString() ?? "")
            setPreview(data.imageUrl ?? null)
        }
    },[data])

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto no-scrollbar px-4"
                >
                    <div className="min-h-screen flex items-center justify-center py-8">
                        <motion.div
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl my-1"
                        >
                            <div className="p-4 border-b">
                                <h2 className="text-xl font-bold">Pricing and Vehicle Image</h2>
                            </div>

                            <div className="p-6 space-y-2">
                                <label
                                    htmlFor='vehicleImage'
                                    className="relative h-44 border-2  border-dashed rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden"
                                >
                                    {!preview ? (
                                        <ImagePlus size={28} />
                                    ) : (
                                        <Image
                                            src={preview}
                                            alt="Preview"
                                            width={200}
                                            height={200}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    )}

                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        id='vehicleImage'
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setImage(e.target.files[0])
                                                setPreview(URL.createObjectURL(e.target.files[0]))
                                            }
                                        }}
                                    />
                                </label>

                                <div>
                                    <p className="text-sm font-semibold mb-1">Base Fare</p>

                                    <div className="flex items-center gap-2 border rounded-lg px-4 py-1 bg-white">
                                        <IndianRupee size={14} />

                                        <input
                                            type="text"
                                            placeholder="Base fare"
                                            value={baseFare}
                                            onChange={(e) => setBaseFare(e.target.value)}
                                            className="w-full text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold mb-1">Per KM Rate</p>

                                    <div className="flex items-center gap-2 border rounded-lg px-4 py-1 bg-white">
                                        <IndianRupee size={14} />

                                        <input
                                            type="text"
                                            placeholder="Per KM rate"
                                            value={pricePerKm}
                                            onChange={(e) => setPricePerKm(e.target.value)}
                                            className="w-full text-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold mb-1">Waiting Charge</p>

                                    <div className="flex items-center gap-2 border rounded-lg px-4 py-1 bg-white">
                                        <IndianRupee size={14} />

                                        <input
                                            type="text"
                                            placeholder="Waiting charge per minute"
                                            value={waitingChargePerMin}
                                            onChange={(e) => setWaitingChargePerMin(e.target.value)}
                                            className="w-full text-sm outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t flex gap-3">
                                <button
                                    className="flex-1 border rounded-xl py-2"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>

                                <button
                                onClick={handlePriceSubmit}
                                disabled={loading}
                                className="flex-1 bg-black text-white rounded-xl py-2">
                                    {loading ? <CircleDashed size={20} className="animate-spin mx-auto" /> : "Submit"}
                                </button>
                            </div>
                            <p className="text-red-500 text-center text-sm mt-2">{err}</p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default PricingModal
