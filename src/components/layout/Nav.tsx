'use client'
import React from 'react'
import { motion } from "motion/react"
import Image from 'next/image'

const Nav = () => {
    return (
        <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
        >
            <div className='max-w-7x1 mx-auto px-4 md:px-8 flex items-center justify-between'>
                <Image src={"/logo.png"} alt='logo' width={140} height={140} priority />
            </div>
        </motion.div>
    )
}

export default Nav
