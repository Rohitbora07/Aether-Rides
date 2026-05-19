'use client'
import React from 'react'
import { motion } from "motion/react"
import { CircleDashed } from "lucide-react"

type ReviewStatusCardProps = {
    setStatus: (status: boolean) => void,
    loading: boolean,
    func: () => void,
    title: string,
    description: string,
    reason?: string,
    setReason?: (reason: string) => void,
    type?: "approval" | "rejection"
}

function ReviewStatusCard({ setStatus, loading, func, title, description, reason, setReason, type }: ReviewStatusCardProps) {
    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-3xl p-6 w-full max-w-sm"
            >
                <h2 className="text-lg font-bold">{title}</h2>

                <p className="text-sm text-gray-500 mt-2">
                    {
                        type === "rejection" ? <textarea
                            placeholder="Reason for rejection..."
                            className="border rounded-xl p-2 w-full text-sm focus:outline-none focus:ring-2 "
                            value={reason}
                            onChange={(e) => setReason && setReason(e.target.value)}
                        /> : description
                    }
                </p>

                <div className="flex gap-3 mt-6">
                    <button
                        className="flex-1 py-2 rounded-xl border"
                        onClick={() => setStatus(false)}
                    >Cancel</button>
                    <button
                        disabled={loading}
                        onClick={func}
                        className="flex-1 py-2 flex items-center justify-center rounded-xl bg-black text-white">
                        {loading ? <CircleDashed className=' text-white animate-spin' /> : "Yes, " + (type === "rejection" ? "Reject" : "Approve")}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default ReviewStatusCard
