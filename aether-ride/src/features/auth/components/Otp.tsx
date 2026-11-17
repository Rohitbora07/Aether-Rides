'use client'
import { useState } from 'react'
import { motion } from 'motion/react';
import axios from 'axios';
import { VERIFY_EMAIL_ROUTE, SIGNUP_ROUTE } from '@/constants/routes';
import { signOut } from 'next-auth/react'
import { CircleDashed, RotateCcw } from 'lucide-react';

type OtpProps = {
    email: string;
    setAuthMode: (mode: "login" | "signup" | "otp") => void;
}

const Otp = ({ email, setAuthMode }: OtpProps) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState("");
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
        e.preventDefault();
        setErr("");
        setMessage("");
        const fullOtp = otp.join("").trim();
        if (fullOtp.length < 6) {
            setErr("Please enter the complete 6-digit verification code.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(VERIFY_EMAIL_ROUTE, {
                email: email.trim().toLowerCase(),
                otp: fullOtp
            });
            signOut({ redirect: false });
            setMessage(data?.message || "Email verified! You can now log in.");
            setTimeout(() => {
                setAuthMode("login");
            }, 1200);
        } catch (error: unknown) {
            if (axios.isAxiosError<{ message?: string }>(error)) {
                setErr(error.response?.data?.message || "Verification failed");
            } else {
                setErr("Verification failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResending(true);
        setErr("");
        setMessage("");
        try {
            await axios.post(SIGNUP_ROUTE, {
                name: "User",
                email: email.trim().toLowerCase(),
                password: "dummyPassword123" // existingUser branch updates OTP and keeps old password if user exists
            });
            setMessage("New verification code sent to your email!");
        } catch {
            setErr("Could not resend OTP right now. Please try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <form onSubmit={handleEmailVerification}>
            <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <h2 className="text-xl font-semibold">Verify Email</h2>
                <p className="mt-1 text-xs text-gray-500">
                    Enter the 6-digit code sent to <span className="font-semibold text-zinc-800">{email}</span>
                </p>

                <div className="mt-6 flex justify-between gap-2">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            id={`otp-${i}`}
                            value={digit}
                            maxLength={1}
                            className="w-10 h-12 sm:w-12 text-center text-lg font-semibold bg-white border border-black/20 outline-none rounded-xl focus:border-black"
                            onChange={(e) => handleChangeOtp(i, e.target.value)}
                        />
                    ))}
                </div>

                {message && (
                    <p className="mt-4 text-sm text-emerald-600 font-medium">✓ {message}</p>
                )}
                {err && (
                    <p className="mt-4 text-sm text-red-500 font-medium">*{err}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold transition hover:bg-gray-900 disabled:opacity-50"
                >
                    {!loading ? "Verify Email" : <CircleDashed size={18} className="animate-spin text-white" />}
                </button>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="flex items-center gap-1 text-black font-semibold hover:underline cursor-pointer disabled:opacity-50"
                    >
                        <RotateCcw size={12} className={resending ? "animate-spin" : ""} />
                        {resending ? "Sending..." : "Resend Code"}
                    </button>
                    <span
                        onClick={() => setAuthMode("login")}
                        className="text-black font-semibold hover:underline cursor-pointer"
                    >
                        Back to Login
                    </span>
                </div>
            </motion.div>
        </form>
    );
};

export default Otp;
