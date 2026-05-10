'use client'
import { motion } from "motion/react"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from "next/navigation"

function Page() {
    const router = useRouter()
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
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
                </div>
            </motion.div>
        </div>
    )
}

export default Page
