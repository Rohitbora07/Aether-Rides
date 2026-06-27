'use client'
import { IUser } from '@/models/user.model'
import { useState, useEffect } from 'react'
import { VehicleType } from '@/models/vehicle.model'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { ADMIN_VEHICLE_REVIEWS_ROUTE } from '@/constants/routes'
import { ArrowLeft, CheckCircle, XCircle, Clock, ImageIcon, ShieldCheck, Truck, IndianRupee } from 'lucide-react'
import Image from 'next/image'
import { AnimatePresence, motion } from "motion/react"
import AnimatedCard from '@/components/shared/AnimatedCard'
import ReviewStatusCard from '@/components/admin/ReviewStatusCard'

interface IVehicle {
    owner: IUser;
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
    const { id } = useParams()
    const [partnerData, setPartnerData] = useState<IVehicle | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [showApprove, setShowApprove] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [approveLoading, setApproveLoading] = useState(false)
    const [rejectLoading, setRejectLoading] = useState(false)

    useEffect(() => {
        const handleGetVehicle = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get(ADMIN_VEHICLE_REVIEWS_ROUTE + `/${id}`)
                // console.log("Vehicle Review Data:", data)
                setPartnerData(data.vehicle)
            } catch (error) {
                console.error("Error fetching vehicle review data:", error)
            } finally {
                setLoading(false)
            }
        }
        handleGetVehicle()
    }, [id])

    const handleApprove = async () => {
            setApproveLoading(true)
            try{
                await axios.get(ADMIN_VEHICLE_REVIEWS_ROUTE + `/${id}/approve`)
                // console.log("Approve Response:", data)
                setApproveLoading(false)
                router.push("/")
            }catch(error){
                console.error("Error approving partner:", error)
                setApproveLoading(false)
            }finally{
                setShowApprove(false)
            }
        }
        const handleReject = async () => {
            setRejectLoading(true)
            try{
                await axios.post(ADMIN_VEHICLE_REVIEWS_ROUTE + `/${id}/reject`, { rejectionReason: rejectionReason })
                // console.log("Reject Response:", data)
                setRejectLoading(false)
                router.push("/")
            }catch(error: unknown){
                console.log("Error rejecting partner:", error)
                setRejectLoading(false)
            }finally{
                setShowReject(false)
            }
        }
        if (loading) {
        return (
            <div className='min-h-screen grid place-items-center text-gray-500' >Loading...</div>
        )
    }
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition">
                        <ArrowLeft size={16} />
                    </button>

                    <div className="flex-1">
                        <div className="font-semibold text-lg">{partnerData?.owner?.name}</div>
                        <div className="text-xs text-gray-500">{partnerData?.owner?.email}</div>
                    </div>
                    {partnerData?.status === "approved" ? (
                        <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-green-100 text-green-700">
                            <CheckCircle size={18} />
                            Approved
                        </div>
                    ) : partnerData?.status === "rejected" ? (
                        <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-red-100 text-red-700">
                            <XCircle size={18} />
                            Rejected
                        </div>
                    ) : (
                        <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-yellow-100 text-yellow-700">
                            <Clock size={18} />
                            Pending
                        </div>
                    )}
                </div>
            </div>
            <main className='max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden"
                >
                    {
                        partnerData?.imageUrl ? (
                            <Image
                                src={partnerData.imageUrl}
                                alt="Vehicle Image"
                                height={450}
                                width={450}
                                className="object-cover w-full h-112.5"
                            />
                        ) : (
                            <div className="text-gray-500 gird place-items-center h-112.5">
                                <ImageIcon size={25} />
                            </div>
                        )
                    }
                </motion.div>
                <div className="space-y-4">
                    <AnimatedCard title="Vehicle Details" icon={<Truck size={18} />} >
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Vehicle Owner</span>
                            <span className='font-semibold'>{partnerData?.owner?.name || "-"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Vehicle Type</span>
                            <span className='font-semibold'>{partnerData?.type || "-"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Registration Number</span>
                            <span className='font-semibold'>{partnerData?.vehicleNumber || "-"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Model</span>
                            <span className='font-semibold'>{partnerData?.vehicleModel || "-"}</span>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard title="Vehicle Details" icon={<IndianRupee size={18} />} >
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Base Fare</span>
                            <span className='font-semibold flex items-center'><IndianRupee size={13} /> {partnerData?.baseFare || "0.00"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Price Per Km</span>
                            <span className='font-semibold flex items-center'><IndianRupee size={13} /> {partnerData?.pricePerKm || "0.00"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Waiting Charge Per Minute</span>
                            <span className='font-semibold flex items-center '><IndianRupee size={13} /> {partnerData?.waitingChargePerMin || "0.00"}</span>
                        </div>
                    </AnimatedCard>

                    {partnerData?.status === "pending" && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-4xl p-8 shadow-xl space-y-6"
                        >
                            <div className="flex items-center gap-2 font-semibold">
                                <ShieldCheck size={18} />
                                Admin Check
                            </div>

                            <p className="text-sm text-gray-500">
                                Verify Vehicle details carefully before approving.
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => setShowApprove(true)}
                                    className="py-3 rounded-2xl bg-linear-to-r from-black to-gray-800 text-white font-semibold hover:opacity-90 transition"
                                >Approve</button>
                                <button
                                    onClick={() => setShowReject(true)}
                                    className="py-3 rounded-2xl border font-semibold hover:bg-gray-100 transition"
                                >Reject</button>
                            </div>
                        </motion.div>

                    )}
                </div>
            </main>

            <AnimatePresence>
                {
                    showApprove && (
                        <ReviewStatusCard
                            setStatus={setShowApprove}
                            loading={approveLoading}
                            func={handleApprove}
                            title="Approve Vehicle?"
                            description="Confirm all information has been verified."
                        />
                    )
                }
            </AnimatePresence>
            <AnimatePresence>
                {
                    showReject && (
                        <ReviewStatusCard
                            setStatus={setShowReject}
                            loading={rejectLoading}
                            func={handleReject}
                            title="Reject Vehicle?"
                            description="Provide a reason for rejection."
                            type="rejection"
                            reason={rejectionReason}
                            setReason={setRejectionReason}
                        />
                    )
                }
            </AnimatePresence>

        </div>
    )
}

export default Page
