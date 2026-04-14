'use client'
import React from 'react'
import HeroSection from './HeroSection'
import VehicleSlider from './VehicleSlider'
import AuthModal from '../auth/AuthModal'
import { useState } from 'react'


const PublicHome = () => {

    const [ authModalOpen, setAuthModalOpen ] = useState(false)

    return (
        <div>
            <HeroSection />
            <VehicleSlider />
            <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </div>
    )
}

export default PublicHome
