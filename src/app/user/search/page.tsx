'use client'
import {useState} from 'react'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchMap from '@/components/vehicleSearch/SearchMap'

function Page() {
    const router = useRouter()
    const params = useSearchParams()
    const mobile = params.get('mobile')
    const vehicle = params.get('vehicle')
    const pickupLat = params.get('pickuplat')
    const pickupLon = params.get('pickuplon')
    const dropLat = params.get('droplat')
    const dropLon = params.get('droplon')
    const [pickUp, setPickUp] = useState( params.get('pickup') || '')
    const [drop, setDrop] = useState(params.get('drop') || '')
    const [km, setKm] = useState(0)

    return (
        <div className="min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden">
            <div className="absolute top-5 left-5 z-50">
                <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => router.back()}
                    className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                    <ArrowLeft size={17} className="text-zinc-900" />
                </motion.button>
            </div>
            <div className = " absolute w-full z-0 h-[52vh]" >
                <SearchMap
                pickUp={pickUp}
                drop={drop}
                onChange={(p, d) => { setPickUp(p); setDrop(d); }}
                onDistance = {setKm}
                />
            </div>

        </div>
    )
}

export default Page
