'use client'
import Kpi from '@/components/admin/Kpi'
import TabButton from '@/components/admin/TabButton'
import { ADMIN_DASHBOARD_ROUTE } from '@/constants/routes'
import axios from 'axios'
import { User, Users, CheckCircle2, Clock, XCircle, Truck } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import PartnerContentList from '@/components/admin/PartnerContentList'
import { signOut } from 'next-auth/react'

type Stats = {
    totalPartners: number,
    totalApprovedPartners: number,
    totalRejectedPartners: number,
    totalPendingPartners: number
}
type VehicleStatsType = {
    totalVehicles: number,
    totalApprovedVehicles: number,
    totalRejectedVehicles: number,
    totalPendingVehicles: number
}

type Tab = "partner" | "vehicle"

function AdminDashBoard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>("partner")
    const [partnerReviews, setPartnerReviews] = useState([])
    const [vehicleReviews, setVehicleReviews] = useState([])
    const [vehicleStats, setVehicleStats] = useState<VehicleStatsType | null>(null)

    const handlePartnerGet = async () => {
        try {
            const { data } = await axios.get(ADMIN_DASHBOARD_ROUTE)
            console.log(data)
            setStats(data.stats)
            setPartnerReviews(data.pendingPartnersReviews)
            setVehicleReviews(data.pendingVehicles)
            setVehicleStats(data.vehicleStats)
        } catch (error) {
            console.error("Error fetching admin dashboard data:", error)
        }
    }
    useEffect(() => {
        const loadStats = async () => {
            await handlePartnerGet()
        }
        loadStats()
    }, [])
    const handleLogOut = async () => {
        await signOut({ redirect: true, callbackUrl: "/" })
    }
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
            <div className="sticky top-0 bg-black backdrop-blur-lg border-b z-40">
                <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src={"/logo.png"} alt="logo" width={100} height={100} priority />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white text-black">
                            <User size={14} />
                            Admin Dashboard
                        </div>
                        <button
                            onClick={handleLogOut}
                            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white text-red-500"
                        >
                            <XCircle size={14} />
                            Log Out
                        </button>
                    </div>

                </div>
            </div>
            <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <Kpi label="Total Partners" value={stats?.totalPartners} icon={<Users />} />

                    <Kpi label="Approved Partners" value={stats?.totalApprovedPartners} icon={<CheckCircle2 />} />

                    <Kpi label="Pending Partners" value={stats?.totalPendingPartners} icon={<Clock />} />

                    <Kpi label="Rejected Partners" value={stats?.totalRejectedPartners} icon={<XCircle />} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <Kpi label="Total Vehicles" value={vehicleStats?.totalVehicles} icon={<Truck />} />

                    <Kpi label="Approved Vehicles" value={vehicleStats?.totalApprovedVehicles} icon={<CheckCircle2 />} />

                    <Kpi label="Pending Vehicles" value={vehicleStats?.totalPendingVehicles} icon={<Clock />} />

                    <Kpi label="Rejected Vehicles" value={vehicleStats?.totalRejectedVehicles} icon={<XCircle />} />
                </div>


                <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2">
                    <TabButton
                        active={activeTab === "partner"}
                        count={partnerReviews?.length ?? 0}
                        icon={<Users />}
                        onClick={() => setActiveTab("partner")}
                    >
                        Pending Partner Reviews
                    </TabButton>

                    <TabButton
                        active={activeTab === "vehicle"}
                        count={vehicleReviews?.length ?? 0}
                        icon={<Truck />}
                        onClick={() => setActiveTab("vehicle")}
                    >
                        Pending Vehicle Reviews
                    </TabButton>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="space-y-3"
                    >
                        {activeTab === "partner" && <PartnerContentList data={partnerReviews} type="partner" />}
                        {activeTab === "vehicle" && <PartnerContentList data={vehicleReviews} type="vehicle" />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}

export default AdminDashBoard
