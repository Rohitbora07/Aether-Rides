'use client'
import React, { useState } from 'react'
import Image from 'next/image';
import { AuthMode } from '../types';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import Modal from '@/components/ui/Modal';
import { signIn } from 'next-auth/react';
import Otp from './Otp';

type AuthModalPropsType = {
    open: boolean;
    onClose: () => void;
}
const AuthModal = ({ open, onClose }: AuthModalPropsType) => {
    const [authMode, setAuthMode] = useState<AuthMode>("login")
    const [email, setEmail] = useState("")
    const handleGoogleLogin = async () => {
        await signIn("google")
    }
    
    // console.log(data)
    return (
        <>
            {
                open &&
                (
                    <>
                        <Modal open={open} onClose={onClose}>
                            <div className="mb-6 text-center">
                                <h1 className="text-3xl font-extrabold tracking-widest">AETHER RIDES</h1>
                                <p className="mt-1 text-xs text-gray-500">Premium Vehicle Booking</p>
                            </div>
                            {authMode === "login" && (
                                <LoginForm setAuthMode={setAuthMode} />
                            )}
                            {authMode === "signup" && (
                                <SignUpForm setUserEmail={setEmail} setAuthMode={setAuthMode} />
                            )}
                            {
                                authMode === "otp" && (
                                    <Otp email={email} setAuthMode={setAuthMode} />
                                )
                            }
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-black/10"></div>
                                <div className="text-xs text-gray-500">OR</div>
                                <div className="flex-1 h-px bg-black/10"></div>
                            </div>
                            
                            
                            <button onClick={handleGoogleLogin} className="w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-black hover:text-white transition">
                                <Image src="/google.png" alt="google" width={20} height={20} />
                                Continue with Google
                            </button>
                        </Modal>
                    </>
                )
            }
        </>
    )
}

export default AuthModal
