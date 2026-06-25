'use client'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthModal from '../../features/auth/components/AuthModal'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { Menu, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { setUserData } from '@/redux/userSlice'
import ProfileMenu from './ProfileMenu'
import axios from 'axios'
import { PARTNER_PENDING_REQUEST_COUNT_ROUTE } from '@/constants/routes'
import {getSocket} from "@/lib/socket"

const Nav_Items = ["Home", "Bookings", "About Us", "Contact"]

const Nav = () => {
    const pathName = usePathname()
    const [authOpen, setAuthOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const { userData } = useSelector((state: RootState) => state.user)
    const [menuOpen, setMenuOpen] = useState(false)
    const [pendingRequestCount, setPendingRequestCount] = useState(0)
    // console.log(userData)
    const dispatch = useDispatch<AppDispatch>()
    const handleLogOut = async () => {
        await signOut({ redirect: true, callbackUrl: "/" })
        dispatch(setUserData(null))
        setProfileOpen(false)
    }

    useEffect(() => {
        const getPendingRequestCount = async () => {
            try {
                const { data } = await axios.get(PARTNER_PENDING_REQUEST_COUNT_ROUTE)
                console.log("Pending request count:", data)
                setPendingRequestCount(data.count)
            } catch (error) {
                console.log("Error fetching pending request count:", error)
            }
        }
        if (userData?.role === "partner") {
            getPendingRequestCount()
        }
    }, [userData?.role])

    useEffect(() => {
        const socket = getSocket()
        socket.on("new-booking", (data) => {
            console.log("New booking received:", data)
            setPendingRequestCount(prev => prev + 1)
        })
        return () => {
            socket.off("new-booking")
        }
    })
    return (
        <>
            <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-1`}
            >
                <div className='max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between'>
                    <Image src={"/logo.png"} alt='logo' width={140} height={140} priority />
                    <div className='hidden md:flex items-center gap-10' >
                        {
                            userData?.role === "partner" ? (
                                <>
                                    <Link className=" relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/"} >Home</Link>
                                    <Link className=" relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/partner/pending-request"} >Pending Request
                                        <span className=' absolute -top-2 -right-3 w-5 h-5 rounded-full bg-white text-black text-xs flex items-center justify-center' >{pendingRequestCount}</span>
                                    </Link>
                                    <Link className=" relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/partner/bookings"} >Bookings</Link>
                                    <Link className=" relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/partner/active-ride"} >Active Ride</Link>
                                    <Link className=" relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/about-us"} >About Us</Link>
                                    <Link className=" relative text-sm font-medium text-gray-300 hover:text-white transition" href={"/contact"} >Contact</Link>
                                </>
                            ) :
                                Nav_Items.map((item, index) => {
                                    let href;
                                    if (item === "Home") href = "/"
                                    else href = `/user/${item.toLowerCase()}`
                                    const isActive = href === pathName
                                    return <Link key={index} href={href} className={`text-sm font-medium transition
                        ${isActive ?
                                            "text-white"
                                            : "text-gray-400 hover:text-white"
                                        }`}>{item}</Link>
                                })
                        }

                    </div>
                    <div className=" flex items-center relative gap-3 ">
                        <div className=' hidden md:block relative ' >
                            {!userData ? (
                                <button className='px-6 py-2 rounded-full mr-6 bg-white text-black text-sm' onClick={() => setAuthOpen(true)}>Login</button>
                            ) :
                                (<>
                                    <button onClick={() => setProfileOpen(prev => !prev)} className=" w-11 h-11 rounded-full bg-white text-black font-bold" >
                                        {userData.name.charAt(0).toUpperCase()}
                                    </button>
                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className=' text-black absolute top-14 right-0 w-72 bg-white rounded-2xl shadow-xl py-2 border '>
                                                <ProfileMenu userData={userData} handleLogOut={handleLogOut} />
                                            </motion.div>
                                        )
                                        }
                                    </AnimatePresence>
                                </>
                                )
                            }
                        </div>

                        <div className='  md:hidden ' >
                            {!userData ? (
                                <button className='px-6 py-2 rounded-full mr-6 bg-white text-black text-sm' onClick={() => setAuthOpen(true)}>Login</button>
                            ) :
                                (<>
                                    <button onClick={() => setProfileOpen(prev => !prev)} className=" w-11 h-11 rounded-full bg-white text-black font-bold" >
                                        {userData.name.charAt(0).toUpperCase()}
                                    </button>
                                </>
                                )
                            }
                        </div>
                        <button className="md:hidden text-white" onClick={() => setMenuOpen(p => !p)}>
                            {menuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>

            </motion.div>
            <AnimatePresence>
                {menuOpen && (
                    <><motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMenuOpen(false)}
                        className="fixed inset-0 bg-black z-30 md:hidden"
                    />
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-21.25 left-1/2 mt-4 -translate-x-1/2 w-[92%] bg-[#0B0B0B] rounded-2xl shadow-2xl z-40 md:hidden overflow-hidden"
                        >
                            <div className="flex flex-col divide-y divide-white/10">
                                {Nav_Items.map((i, index) => {
                                    const href = i === "Home" ? "/" : `/${i.toLowerCase()}`
                                    return (
                                        <Link key={index} href={href} className="px-6 py-4 text-gray-300 hover:bg-white/5">
                                            {i}
                                        </Link>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {profileOpen && userData && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setProfileOpen(false)}
                            className="fixed inset-0 bg-black z-30 md:hidden"
                        />

                        <motion.div
                            initial={{ y: 400 }}
                            animate={{ y: 0 }}
                            exit={{ y: 400 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden"
                        >
                            <ProfileMenu userData={userData} handleLogOut={handleLogOut} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
    )
}

export default Nav
