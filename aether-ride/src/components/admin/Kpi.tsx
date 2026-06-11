'use client'
import React from 'react'
import { motion } from "motion/react"

type KpiProps = {
    label: string,
    value: number | undefined,
    icon: React.ReactNode
}

function Kpi({ label, value, icon }: KpiProps) {
    return (
        <motion.div
            whileHover={{ y: -5, rotate: -3, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-default relative overflow-hidden group hover:shadow-purple-700/60 `}
        >
            <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-purple-50`}
                style={{ zIndex: 0 }}
            />

            <div className="relative z-10">
                <motion.div
                    whileHover={{ rotate: -10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center bg-purple-50 text-purple-700 `}
                >
                    {icon}
                </motion.div>

                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    {label}
                </p>

                <motion.div
                    className="text-3xl font-extrabold text-gray-950 leading-tight"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {value}
                </motion.div>
            </div>
        </motion.div>
    )
}

export default Kpi
