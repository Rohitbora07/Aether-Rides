'use client'
import { useEffect, useState } from 'react'
import { IBooking } from "../pending-request/page"
import { motion } from "motion/react"
import axios from "axios"
import { PARTNER_BOOKINGS_ROUTE } from "@/constants/routes"
import { Car, Loader2, User, Phone, Truck, Bike, MapPin, Navigation, Calendar, IndianRupee, ChevronRightIcon } from "lucide-react"
import { useRouter } from "next/navigation"

function Page() {

    const [bookings, setBookings] = useState<IBooking[] | []>([])
    const [selectStatus, setSelectStatus] = useState<string>("All")
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get(PARTNER_BOOKINGS_ROUTE)
                // console.log("Bookings: ", data)
                setBookings(data.bookings)
            } catch (error) {
                console.error("Error fetching bookings: ", error)
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [])

    const getVehicleIcon = (vehicleType?: string) => {
        switch (vehicleType?.toLowerCase()) {
            case "bike":
                return <Bike className="w-6 h-6 text-gray-400" />;

            case "auto":
                return <Car className="w-6 h-6 text-gray-400" />;

            case "truck":
                return <Truck className="w-6 h-6 text-gray-400" />;

            case "loading":
            case "car":
            default:
                return <Car className="w-6 h-6 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            confirmed: "bg-emerald-200 border border-emerald-300 text-emerald-800",
            completed: "bg-teal-200 text-teal-800 border-teal-300",
            requested: "bg-amber-200 text-amber-800 border-amber-300",
            awaiting_payment: "bg-blue-200 text-blue-800 border-blue-300",
            cancelled: "bg-rose-200 text-rose-800 border-rose-300",
            rejected: "bg-red-200 text-red-800 border-red-300",
            expired: "bg-gray-200 text-gray-800 border-gray-300",
        };

        return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
    };

    const formatDate = (dateInput?: Date | string) => {
        if (!dateInput) return "-";
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        }).replace(",", "");
    }

    const filterBookingStatus = selectStatus === "All"
        ? bookings
        : bookings.filter((b) => b.bookingStatus === selectStatus)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto py-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Car className="w-5 h-5 text-blue-600" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Partner Bookings
                                </h1>

                                <p className="text-gray-500 text-sm mt-1">
                                    {bookings.length} {bookings.length === 1 ? "ride" : "rides"} assigned to you
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm text-gray-500">
                            Showing {filterBookingStatus.length} bookings
                        </div>

                        <select
                            value={selectStatus}
                            onChange={(e) => setSelectStatus(e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="requested">requested</option>
                            <option value="awaiting_payment">awaiting_payment</option>
                            <option value="confirmed">confirmed</option>
                            <option value="started">started</option>
                            <option value="completed">completed</option>
                            <option value="cancelled">cancelled</option>
                            <option value="rejected">rejected</option>
                            <option value="expired">expired</option>
                        </select>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center py-16">
                            <Loader2 className="animate-spin w-8 h-8 text-black" />
                        </div>
                    )}

                    {/* No Bookings */}
                    {!loading && filterBookingStatus.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />

                            <h1 className="text-lg font-medium text-gray-900">No bookings yet</h1>

                            <p className="text-gray-500 text-sm mt-1">{`When customers book rides, they'll appear here`}</p>
                        </div>
                    )}

                    {/* Booking List */}
                    {!loading && filterBookingStatus.length > 0 && (
                        <div className="space-y-4">
                            {filterBookingStatus.map((b, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}>
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                        <div className="flex items-center gap-3 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-200 shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>

                                            {/* User Information */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {b.user.name.toUpperCase() || "CUSTOMER"}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(b.bookingStatus)}`}>
                                                        {b.bookingStatus}
                                                    </span>
                                                </div>
                                                <div className="flex bg-amber-200 w-24 items-center gap-1 mt-1 text-xs text-amber-800 justify-center rounded-full px-2 py-1">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{b.userMobile}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vehicle Information */}
                                        <div className="px-4 pt-3">
                                            <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
                                                {getVehicleIcon(b.vehicle.type)}
                                                <div className="text-xs text-gray-600">
                                                    {b.vehicle.vehicleModel} • {b.vehicle.vehicleNumber || "Not assigned"}
                                                </div>
                                            </div>
                                        </div>


                                        {/* Location Information */}
                                        <div className="p-4 space-y-3">

                                            {/* Pick Up Location */}
                                            <div className="flex items-center gap-3">
                                                <div className="shrink-0 w-8 h-8 rounded-lg border border-green-600 bg-green-100 flex items-center justify-center">
                                                    <MapPin className="w-4 h-4 text-green-600" />
                                                </div>

                                                <div className="flex-1">
                                                    <span className="text-xs font-medium text-green-600 uppercase tracking-wider">
                                                        PICK UP
                                                    </span>

                                                    <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">
                                                        {b.pickUpAddress}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Drop Off Location */}
                                            <div className="flex items-center gap-3">
                                                <div className="shrink-0 w-8 h-8 rounded-lg border border-red-600 bg-red-100 flex items-center justify-center">
                                                    <Navigation className="w-4 h-4 text-red-600" />
                                                </div>

                                                <div className="flex-1">
                                                    <span className="text-xs font-medium text-red-600 uppercase tracking-wider">
                                                        DROP OFF
                                                    </span>

                                                    <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">
                                                        {b.dropAddress}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date of Booking && Fare */}
                                        <div className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 border-t border-gray-200">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <span>{formatDate(b.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-1  bg-gray-50 border-t border-gray-200">
                                                <IndianRupee className="w-5 h-5" />
                                                <span className="text-gray-900 font-semibold text-lg">{b.fare}</span>
                                            </div>
                                        </div>

                                        {/* Payment Status */}
                                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Payment:</span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full ${b.paymentStatus === "paid"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >{b.paymentStatus}</span>
                                            </div>
                                            {(b.bookingStatus === "completed" || b.bookingStatus === "confirmed" || b.bookingStatus === "started") && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => router.push("/partner/active-ride")}
                                                        className="flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 hover:text-blue-700 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <span>Details</span>
                                                        <ChevronRightIcon />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default Page
