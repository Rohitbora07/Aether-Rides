'use client'
import {useEffect, useState} from 'react'
import { useSelector } from 'react-redux';
import { motion } from "motion/react"
import { RootState } from '@/redux/store';
import { Check, Clock, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RejectionCard from '@/components/partner/RejectionCard';
import StatusCard from '@/components/partner/StatusCard';
import PricingModal from '@/components/partner/PricingModal';
import { IVehicle } from '@/models/vehicle.model';
import { ONBOARDING_PRICE } from '@/constants/routes';
import axios from 'axios';
type Step = {
    id: number;
    title: string;
    route?: string;
}

const STEPS: Step[] = [
    { id: 1, title: "Vehicle", route: "/partner/onboarding/vehicle" },
    { id: 2, title: "Documents", route: "/partner/onboarding/documents" },
    { id: 3, title: "Bank", route: "/partner/onboarding/bank" },
    { id: 4, title: "Review" },
    { id: 5, title: "Pricing" },
    { id: 6, title: "Final Review" },
    { id: 7, title: "Live" },
]


const TOTAL_STEPS = STEPS.length

function PartnerDashBoard() {
    const { userData } = useSelector(
        (state: RootState) => state.user
    )
    const activeStep = (userData?.partnerOnboardingStep ?? 0) + 1

    const progressPercentage = ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100
    const router = useRouter()
    const gotoStep = (step: Step) => {
        if( step.id === 5 && userData?.partnerStatus === "approved"){
            setShowPricing(true)
            return
        } 
        if (step.route && step.id <= activeStep) {
            router.push(step.route)
        }
    }
    const [showPricing, setShowPricing] = useState(false)
    const [vehicleData, setVehicleData] = useState<IVehicle | null>(null)


    useEffect(() => {
        const handleGetPricing = async () => {
        try{
            const { data } = await axios.get(ONBOARDING_PRICE)
            setVehicleData(data)
        }catch(error){
            console.log("Error fetching pricing data:", error)
        }
    }
        handleGetPricing()
    },[])

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-28 pb-20">
            <div className="max-w-7xl mx-auto space-y-16">
                <div>
                    <h1 className="text-4xl font-bold">Partner Onboarding</h1>
                    <p className="text-gray-600 mt-3">Complete all steps to activate your account</p>
                </div>


                <div className="bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto">
                    <div className="relative min-w-[200]">
                        <div className="absolute top-7 left-0 w-full h-[0.75] bg-gray-200 rounded-full" />


                        <motion.div
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.6 }}
                            className="absolute top-7 left-0 h-0.75 bg-black rounded-full"
                        />

                        <div className="relative flex justify-between">
                            {STEPS.map((s) => {
                                const completed = s.id < activeStep
                                const isActive = s.id === activeStep
                                const locked = s.id > activeStep
                                return (
                                    <motion.div
                                        key={s.id}
                                        whileHover={!locked ? { scale: 1.1 } : {}}
                                        onClick={() => gotoStep(s)}
                                        className="flex flex-col items-center z-10 cursor-pointer"
                                    >
                                        <div
                                            className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${completed
                                                ? "bg-black border-black text-white"
                                                : isActive
                                                    ? "bg-white border-black"
                                                    : "bg-white border-gray-300 text-gray-400"
                                                }`}
                                        >
                                            {
                                                completed ? (
                                                    <Check size={20} />
                                                ) : locked ? (
                                                    <Lock size={20} />
                                                ) : (
                                                    s.id
                                                )
                                            }
                                        </div>
                                        <p className="text-sm font-semibold  mt-3 text-center">{s.title}</p>
                                    </motion.div>
                                )
                            })}
                        </div>



                    </div>
                </div>

                {activeStep === 4 && userData?.partnerStatus === "rejected" && (
                    <RejectionCard
                        title="Partner Rejected"
                        reason={userData?.rejectionReason || ""}
                        actionLabel="Review and Update"
                        onAction={() => {
                            router.push("/partner/onboarding/vehicle")
                        }}
                    />
                )}
                {activeStep === 4 && userData?.partnerStatus === "pending" && (
                    <StatusCard
                        icon={<Clock size={18} />}
                        title="Documents under review"
                        desc = {"Admin is verifying your documents. "}
                    />
                )}

                {activeStep === 6 && vehicleData?.status === "pending" && (
                    <StatusCard
                        icon={<Clock size={18} />}
                        title="Pricing under review"
                        desc = {"Admin is verifying your pricing details. "}
                    />
                )}
                {activeStep === 6 && vehicleData?.status === "rejected" && (
                    <RejectionCard
                        title="Pricing Rejected"
                        reason={vehicleData?.rejectionReason || ""}
                        actionLabel="Edit Pricing"
                        onAction={() => {
                            router.push("/partner/onboarding/vehicle")
                        }}
                    />
                )}
            </div>

            <PricingModal
            open = {showPricing}
            onClose = {() => setShowPricing(false)}
            data = {vehicleData}
            />
        </div>
    )
}

export default PartnerDashBoard
