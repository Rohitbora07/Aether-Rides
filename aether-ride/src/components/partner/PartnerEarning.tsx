'use client'
import axios from "axios"
import { motion, AnimatePresence } from "motion/react"
import { BarChart2, Zap, Star, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState } from "react"
import { PARTNER_EARNING_ROUTE } from "@/constants/routes"
import { ResponsiveContainer, Bar, BarChart,Cell, XAxis, YAxis, CartesianGrid } from "recharts"

type Earning = {
    date: string,
    earning: number
}

function PartnerEarning() {
    const [earnings, setEarnings] = useState<Earning[]>([])
    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const { data } = await axios.get(PARTNER_EARNING_ROUTE)
                // console.log("Partner earnings data:", data)
                const last7DaysEarnings = data.earnings.slice(-7)
                setEarnings(last7DaysEarnings)
            } catch (error) {
                console.error("Error fetching partner earnings:", error)
            }
        }
        fetchEarnings()
    }, [])

    const total = earnings.reduce((acc, curr) => acc + curr.earning, 0)
    const avg = earnings.length > 0 ? Math.round(total / earnings.length) : 0
    const max = earnings.length > 0 ? Math.max(...earnings.map(e => e.earning)) : 0
    const bestDay = earnings.find(d => d.earning === max)
    const today = earnings[earnings.length - 1]
    const yesterday = earnings[earnings.length - 2]
    const delta = today && yesterday ? today.earning - yesterday.earning : 0
    const deltaPositive = delta >= 0
    const deltaPct = yesterday ? Math.abs(Math.round((delta / yesterday.earning) * 100)) : 0

    const fmt = (n: number) => {
        return "₹" + n.toLocaleString()
    }

    const metrics = [
        {
            label: "Best Day",
            value: fmt(max),
            sub: bestDay?.date ?? "-",
            icon: <Star size={14} />,
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            label: "Daily Avg",
            value: fmt(avg),
            sub: "per day",
            icon: <BarChart2 size={14} />,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Today",
            value: today ? fmt(today.earning) : "-",
            sub: today && yesterday ? `${deltaPositive ? "+" : ""}${fmt(delta)} vs yesterday` : "-",
            icon: <Zap size={14} />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        }
    ];

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 w-full">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <span className="inline-block text-[11px] text-blue-600 font-semibold tracking-widest uppercase bg-blue-50 px-3 py-1 rounded-full mb-2">
                        Partner Dashboard
                    </span>

                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        Daily Earnings
                    </h2>

                    <p className="text-sm text-gray-400 mt-0.5">
                        Last 7 days performance
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                        Weekly Total
                    </p>

                    <motion.div
                        key={total}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-gray-900 font-mono tracking-tight"
                    >
                        {fmt(total)}
                    </motion.div>

                    <div className={`flex items-center justify-end gap-1 text-xs font-semibold mt-1 ${deltaPositive ? "text-emerald-600" : "text-rose-500"}`}>
                        {deltaPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        <span>{deltaPct}% vs yesterday</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.4 }}
                        className="bg-gray-50 rounded-2xl p-4"
                    >
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-2 ${m.color}`}>
                            <span className={`${m.bg} p-1 rounded-lg ${m.color}`}>
                                {m.icon}
                            </span>

                            <span>{m.label}</span>
                        </div>

                        <p className="text-lg font-bold text-gray-900 font-mono leading-none">
                            {m.value}
                        </p>

                        <p className="text-[11px] text-gray-400 mt-1">
                            {m.sub}
                        </p>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, scaleY: 0.92 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="h-56"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={earnings} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                            />

                            <Bar dataKey="earning" radius={[8, 8, 3, 3]}>
                                {earnings.map((d, i) => {
                                    const isToday = i === earnings.length - 1;
                                    const isBest = d.earning === max && !isToday;

                                    return (
                                        <Cell
                                            key={`cell-${i}`}
                                            fill={
                                                isToday
                                                    ? "#10b981"
                                                    : isBest
                                                        ? "#8b5cf6"
                                                        : "#bfdbfe"
                                            }
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default PartnerEarning
