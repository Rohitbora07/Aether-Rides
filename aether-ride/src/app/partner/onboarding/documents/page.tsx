'use client'
import { ONBOARDING_DOCUMENTS } from "@/constants/routes"
import axios from "axios"
import { ArrowLeft, UploadCloud, FileCheck, CircleDashed } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"

import React, { useState } from 'react'


type DocType = "aadhaar" | "license" | "rc"
function Page() {
    const router = useRouter()
    const [docs, setDocs] = useState<Record<DocType, File | null>>({
        aadhaar: null,
        license: null,
        rc: null
    })
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)

    const handleImage = (doc: DocType, file: File | null) => {
        if (!file) return
        setDocs(prev => ({
            ...prev,
            [doc]: file
        }))
    }

    

    const handleDocs = async () => {
        setErr("")
        try {
            setLoading(true)
            const formData = new FormData()
            if (!docs.aadhaar || !docs.license || !docs.rc) {
                setErr("All documents are required")
                setLoading(false)
                return
            }
            formData.append("aadharCard", docs.aadhaar)
            formData.append("license", docs.license)
            formData.append("rc", docs.rc)
            await axios.post(ONBOARDING_DOCUMENTS, formData)
            // // console.log(data)
            router.push("/partner/onboarding/bank")
            setLoading(false)

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setErr(error?.response?.data?.message ?? "Something went wrong by axios")
            } else {
                setErr("Something went wrong")
            }
            setLoading(false)
        }
    }

    const isCompleted = docs.aadhaar && docs.license && docs.rc

    return (
        <div className="bg-white flex items-center justify-center m-6 px-4">
            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
            >
                <div className="relative text-center">
                    <button
                        className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <p className="text-xs text-gray-500 font-medium">
                        Step 2 of 3
                    </p>

                    <h1 className="text-2xl font-bold">
                        Upload your Documents
                    </h1>

                    <p className="text-sm text-gray-500">
                        Required for Verification
                    </p>
                </div>

                <div className=" mt-4 space-y-3">
                    <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-black transition"
                    >
                        <div>
                            <p className="text-sm font-semibold">Aadhaar / ID Proof</p>
                            <p className="text-xs text-gray-500">Government issued ID</p>
                        </div>
                        {
                            docs.aadhaar ? <span className=" text-green-600 font-medium text-xs" >Uploaded</span> :
                                (
                                    <div>
                                        <span className="text-xs text-gray-400">Upload</span>

                                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                                            <UploadCloud size={14} />
                                        </div>
                                    </div>
                                )

                        }

                        <input type="file" hidden accept='image/*, .pdf' onChange={(e) => handleImage('aadhaar', e.target.files?.[0] || null)} />
                    </motion.label>
                    <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-black transition"
                    >
                        <div>
                            <p className="text-sm font-semibold">Driving License</p>
                            <p className="text-xs text-gray-500">Valid driving license</p>
                        </div>

                        {
                            docs.license ? <span className=" text-green-600 font-medium text-xs" >Uploaded</span> :
                                (
                                    <div>
                                        <span className="text-xs text-gray-400">Upload</span>

                                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                                            <UploadCloud size={14} />
                                        </div>
                                    </div>
                                )

                        }
                        <input type="file" hidden accept='image/*, .pdf' onChange={(e) => handleImage('license', e.target.files?.[0] || null)} />
                    </motion.label>
                    <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-black transition"
                    >
                        <div>
                            <p className="text-sm font-semibold">Vehicle RC</p>
                            <p className="text-xs text-gray-500">Vehicle registration certificate</p>
                        </div>

                        {
                            docs.rc ? <span className=" text-green-600 font-medium text-xs" >Uploaded</span> :
                                (
                                    <div>
                                        <span className="text-xs text-gray-400">Upload</span>

                                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                                            <UploadCloud size={14} />
                                        </div>
                                    </div>
                                )

                        }
                        <input type="file" hidden accept='image/*, .pdf' onChange={(e) => handleImage('rc', e.target.files?.[0] || null)} />
                    </motion.label>
                </div>

                <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
                    <FileCheck size={16} className="mt-0.5" />

                    <p>
                        Documents are securely stored and manually verified by our team.
                    </p>
                </div>
                <p className="text-sm text-red-500 mt-2">{err}</p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDocs}
                    disabled={loading || !isCompleted}
                    className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
                >
                    {loading ? <CircleDashed className="text-white animate-spin" size={18} /> : "Continue"}
                </motion.button>


            </motion.div>
        </div>
    )
}

export default Page
