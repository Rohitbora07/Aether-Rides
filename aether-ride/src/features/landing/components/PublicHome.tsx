'use client'
import React from 'react'
import HeroSection from './HeroSection'
import VehicleSlider from './VehicleSlider'
import AuthModal from '../../auth/components/AuthModal'
import { useState } from 'react'
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'
import { useRouter } from "next/navigation"



const PublicHome = () => {

    const [ authModalOpen, setAuthModalOpen ] = useState(false)
    const { userData } = useSelector((state: RootState) => state.user)
    // console.log(userData)
    const router = useRouter()

    return (
        <div>
            {
                !userData ? (
                    <HeroSection authRequired={() => setAuthModalOpen(true)} />
                ) :
                <HeroSection authRequired={() => router.push("/user/book")} />
            }
            <VehicleSlider />
            <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>
    )
}

export default PublicHome
