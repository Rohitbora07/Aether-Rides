'use client'
import { ADMIN_PARTNER_REVIEWS_ROUTE } from '@/constants/routes'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle, XCircle, Clock, Car, FileText, Landmark, ShieldCheck } from 'lucide-react'
import { IUser } from '@/models/user.model'
import { IVehicle } from '@/models/vehicle.model'
import { IPartnerDocs } from '@/models/partnerDocs.model'
import { IPartnerBank } from '@/models/partnerBank.model'
import AnimatedCard from '@/components/shared/AnimatedCard'
import DocsPreview from '@/components/shared/DocsPreview'
import { AnimatePresence, motion } from "motion/react"
import ReviewStatusCard from '@/components/admin/ReviewStatusCard'

function Page() {
    const { id } = useParams()
    const [data, setData] = useState<IUser | null>(null)
    const [loading, setLoading] = useState(false)
    const [vehicleDetails, setVehicleDetails] = useState<IVehicle | null>(null)
    const [partnerDocs, setPartnerDocs] = useState<IPartnerDocs | null>(null)
    const [bank, setBank] = useState<IPartnerBank | null>(null)
    const [showApprove, setShowApprove] = useState(false)
    const [showReject, setShowReject] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [approveLoading, setApproveLoading] = useState(false)
    const [rejectLoading, setRejectLoading] = useState(false)

    const router = useRouter()


    useEffect(() => {
        const handleGetPartner = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get(ADMIN_PARTNER_REVIEWS_ROUTE + `/${id}`)
                // console.log("Partner Review Data:", data)
                setData(data.partner)
                setVehicleDetails(data.vehicle)
                setPartnerDocs(data.documents)
                setBank(data.bank)
            } catch (error) {
                console.error("Error fetching partner review data:", error)
            } finally {
                setLoading(false)
            }
        }
        handleGetPartner()
    }, [id])


    const handleApprove = async () => {
        setApproveLoading(true)
        try{
            await axios.get(ADMIN_PARTNER_REVIEWS_ROUTE + `/${id}/approve`)
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
            await axios.post(ADMIN_PARTNER_REVIEWS_ROUTE + `/${id}/reject`, { rejectionReason })
            // console.log("Reject Response:", data)
            setRejectLoading(false)
            router.push("/")
        }catch(error){
            console.error("Error rejecting partner:", error)
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
                        <div className="font-semibold text-lg">{data?.name}</div>
                        <div className="text-xs text-gray-500">{data?.email}</div>
                    </div>
                    {data?.partnerStatus === "approved" ? (
                        <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-green-100 text-green-700">
                            <CheckCircle size={18} />
                            Approved
                        </div>
                    ) : data?.partnerStatus === "rejected" ? (
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

            <main className='max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10'>
                <div className='lg:col-span-2 space-y-8'>
                    <AnimatedCard title="Vehicle Details" icon={<Car size={18} />}>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Vehicle Type</span>
                            <span className='font-semibold'>{vehicleDetails?.type || "-"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Registration Number</span>
                            <span className='font-semibold'>{vehicleDetails?.vehicleNumber || "-"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Model</span>
                            <span className='font-semibold'>{vehicleDetails?.vehicleModel || "-"}</span>
                        </div>
                    </AnimatedCard>

                    <AnimatedCard title="Documents" icon={<FileText size={18} />}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <DocsPreview label="Aadhaar" url={partnerDocs?.aadharCardUrl} />

                            <DocsPreview
                                label="Registration Certificate"
                                url={partnerDocs?.rcUrl}
                            />

                            <DocsPreview
                                label="Driving License"
                                url={partnerDocs?.licenseUrl}
                            />
                        </div>
                    </AnimatedCard>
                </div>

                <div className=' space-y-8'>
                    <AnimatedCard title="Bank Details" icon={<Landmark size={18} />}>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Account Holder</span>
                            <span className='font-semibold'>{bank?.accountHolderName || "-"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>Account Number</span>
                            <span className='font-semibold'>{bank?.accountNumber || "-"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>IFSC Code</span>
                            <span className='font-semibold'>{bank?.ifscCode || "-"}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>UPI ID</span>
                            <span className='font-semibold'>{bank?.upiId || "-"}</span>
                        </div>
                    </AnimatedCard>


                    {data?.partnerStatus === "pending" && (
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
                                Verify documents carefully before approving.
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
                            title="Approve Partner?"
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
                            title="Reject Partner?"
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
