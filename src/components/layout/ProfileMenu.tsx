'use client'

import React from 'react'
import { Bike, Car, ChevronRight, LogOut, Truck } from 'lucide-react'
import { IUser } from '@/models/user.model'
import { useRouter } from 'next/navigation'

interface Props {
    userData: IUser | null;
    handleLogOut: () => void
}

const ProfileMenu = ({ userData, handleLogOut }: Props) => {
    const router = useRouter()
    return (
        <div className='p-5'>
            <p className='font-semibold text-lg'>{userData?.name}</p>

            <p className='text-xs uppercase text-gray-500 mb-4'>
                {userData?.role}
            </p>

            {userData?.role !== "partner" && (
                <div
                onClick={() => router.push("/partner/onboarding/vehicle")}
                className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl'>
                    <div className='flex -space-x-2'>
                        <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                            <Bike size={14} />
                        </div>

                        <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                            <Car size={14} />
                        </div>

                        <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'>
                            <Truck size={14} />
                        </div>
                    </div>

                    Become a Partner

                    <ChevronRight size={16} className='ml-auto' />
                </div>
            )}

            <button
                className='w-full flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2'
                onClick={handleLogOut}
            >
                <LogOut size={16} />
                Logout
            </button>
        </div>
    )
}

export default ProfileMenu