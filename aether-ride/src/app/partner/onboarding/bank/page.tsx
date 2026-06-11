'use client'
import { ONBOARDING_BANK } from "@/constants/routes"
import axios from "axios"
import { ArrowLeft, BadgeCheck, CreditCard, Landmark, Phone, CheckCircle, CircleDashed } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"

import React, { useEffect, useState } from 'react'

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/
const MOBILE_REGEX = /^[0-9]{10}$/
function Page() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")
    const [accountHolderName, setAccountHolderName] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [ifsc, setIfsc] = useState("")
    const [mobile, setMobile] = useState("")
    const [upi, setUpi] = useState("")

    const sanitizeIFSC = ifsc.toUpperCase().trim()
    const isNameValid = accountHolderName.trim().length >= 3
    const isAccountNumberValid = accountNumber.trim().length >= 9 && accountNumber.trim().length <= 18
    const isIfscValid = IFSC_REGEX.test(sanitizeIFSC)
    const isMobileValid = MOBILE_REGEX.test(mobile.trim())
    const canSubmit = isNameValid && isAccountNumberValid && isIfscValid && isMobileValid
    const handleBankDetails = async () => {
        setErr("")
        try {
            setLoading(true)
            const { data } = await axios.post(ONBOARDING_BANK, {
                accountHolderName,
                accountNumber,
                ifscCode: sanitizeIFSC,
                mobileNumber: mobile,
                upiId: upi
            })
            console.log(data)
            router.push("/")
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

    

    useEffect(() => {
        const getBanckDetails = async () => {
            try {
                const { data } = await axios.get(ONBOARDING_BANK)
                if(!data.partnerBank) return
                setAccountHolderName(data.partnerBank.accountHolderName)
                setAccountNumber(data.partnerBank.accountNumber)
                setIfsc(data.partnerBank.ifscCode)
                setMobile(data.mobileNumber)
                setUpi(data.partnerBank.upiId)
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    setErr(error?.response?.data?.message ?? "Something went wrong by axios")
                } else {
                    setErr("Something went wrong")
                }
                setLoading(false)
            }
        }
        getBanckDetails()
    }, [])

    return (
        <div className="bg-white min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-4 sm:p-8"
            >
                <div className="relative text-center">
                    <button
                        className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <p className="text-xs text-gray-500 font-medium">
                        Step 3 of 3
                    </p>

                    <h1 className="text-2xl font-bold mt-1">
                        Bank & Payout Setup
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                        Used for partner payouts
                    </p>
                </div>

                <div className="mt-5 space-y-4">
                    <div>
                        <label htmlFor="ahn" className="text-xs font-semibold text-gray-500">Account holder name</label>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="text-gray-400"><BadgeCheck size={20} /></div>
                            <input
                                type="text"
                                id="ahn"
                                placeholder="As per bank records"
                                className={`flex-1 border-b pb-1 text-sm focus:outline-none 
                                ${!isNameValid && accountHolderName.length > 0 ? "border-red-300 focus:border-red" : "border-gray-300 focus:border-black"}
                                    `}
                                value={accountHolderName}
                                onChange={(e) => setAccountHolderName(e.target.value)}
                            />
                        </div>
                        {!isNameValid && accountHolderName.length > 0 ? <p className="text-xs text-red-500 mt-1">Account holder name must be at least 3 characters</p> : null}
                    </div>

                    <div>
                        <label htmlFor="ahn" className="text-xs font-semibold text-gray-500">Bank Account Number</label>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="text-gray-400"><CreditCard size={20} /></div>
                            <input
                                type="text"
                                id="ahn"
                                placeholder="Enter account number"
                                className={`flex-1 border-b pb-1 text-sm focus:outline-none
                                ${!isAccountNumberValid && accountNumber.length > 0 ? "border-red-300 focus:border-red" : "border-gray-300 focus:border-black"}
                                    `}
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>
                        {!isAccountNumberValid && accountNumber.length > 0 ? <p className="text-xs text-red-500 mt-1">Account number must be between 9 and 18 digits</p> : null}
                    </div>

                    <div>
                        <label htmlFor="ahn" className="text-xs font-semibold text-gray-500">IFSC Code</label>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="text-gray-400"><Landmark size={20} /></div>
                            <input

                                type="text"
                                id="ahn"
                                placeholder="HDFC0001234"
                                className={`flex-1 border-b pb-1 text-sm focus:outline-none
                                ${!isIfscValid && ifsc.length > 0 ? "border-red-300 focus:border-red" : "border-gray-300 focus:border-black"}
                                `}
                                value={ifsc}
                                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                            />
                        </div>
                        {!isIfscValid && ifsc.length > 0 ? <p className="text-xs text-red-500 mt-1">Invalid IFSC code format</p> : null}
                    </div>

                    <div>
                        <label htmlFor="ahn" className="text-xs font-semibold text-gray-500">Mobile Number</label>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="text-gray-400"><Phone size={20} /></div>
                            <input
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                type="text"
                                id="ahn"
                                placeholder="10-digit mobile number"
                                className={`flex-1 border-b border-gray-300 pb-1 text-sm focus:outline-none
                                ${!isMobileValid && mobile.length > 0 ? "border-red-300 focus:border-red" : "border-gray-300 focus:border-black"}
                                    `}
                            />
                        </div>
                        {!isMobileValid && mobile.length > 0 ? <p className="text-xs text-red-500 mt-0">Mobile number must only be 10 digits</p> : null}
                    </div>


                    <div>
                        <label htmlFor="ahn" className="text-xs font-semibold text-gray-500">UPI ID(optional)</label>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="text" id="ahn" placeholder="name@upi" className="flex-1 border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black"
                                value={upi}
                                onChange={(e) => setUpi(e.target.value)}
                            />
                        </div>
                    </div>
                </div>


                <div className="mt-3 flex items-start gap-3 text-xs text-gray-500">
                    <CheckCircle size={16} className="mt-0.5" />
                    <p>Bank details are verified before payout.
                        This usually takes 24-48 hours.</p>
                </div>

                <p className="text-sm text-red-500 mt-2">{err}</p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading || !canSubmit}
                    onClick={handleBankDetails}
                    className="mt-3 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition"
                >
                    {loading ? <CircleDashed className="text-white animate-spin" size={18} /> : "Continue"}
                </motion.button>


            </motion.div>
        </div>
    )
}

export default Page
