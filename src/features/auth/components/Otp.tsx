import { useState } from 'react'
import { motion } from 'motion/react';
import axios from 'axios';
import { VERIFY_EMAIL_ROUTE } from '@/constants/routes';
import {signOut} from 'next-auth/react'
import {CircleDashed} from 'lucide-react';

type OtpProps = {
    email: string;
    setAuthMode: (mode: "login" | "signup" | "otp") => void;
}

const Otp = ({ email, setAuthMode }: OtpProps) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");


    const handleChangeOtp = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        if (value && index < otp.length - 1) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
        if (!value && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };
    const handleEmailVerification = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        try{
            const {data} = await axios.post(VERIFY_EMAIL_ROUTE, {email,otp: otp.join("")})
            signOut({redirect: false})
            setAuthMode("login")
            console.log("Registration successful", data);
            setErr("");
            setOtp(["", "", "", "", "", ""])
        }catch (error:any) {
            setErr(error.response?.data?.message || "Registration failed");
        }finally{
            setLoading(false);
        }
        
    }
    return (
        <form onSubmit={handleEmailVerification}>
        <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h2 className="text-xl font-semibold">Verify Email</h2>
            <div className="mt-6 flex justify-between gap-2">
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        id={`otp-${i}`}
                        value={digit}
                        maxLength={1}
                        className="w-10 h-12 sm:w-12 text-center text-lg font-semibold bg-white border border-black/20 outline-none rounded-xl"
                        onChange={(e) => handleChangeOtp(i, e.target.value)}
                    />
                ))}
            </div>
            <button type="submit" className="mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold transition hover:bg-gray-900">
                {!loading ? "Verify Email" : <CircleDashed size={18} className="animate-spin text-white" />}
            </button>
        </motion.div>
        </form>
    )
}

export default Otp
