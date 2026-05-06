import React, { useState } from 'react'
import { CircleDashed, Lock, Mail, User } from 'lucide-react';
import { motion } from 'motion/react';
import { AuthMode } from '../types';
import axios from 'axios';
import { SIGNUP_ROUTE } from '@/constants/routes';

const SignUpForm = ({ setUserEmail, setAuthMode }: { setUserEmail: (email: string) => void; setAuthMode: (mode: AuthMode) => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();
        try{
            const {data} = await axios.post(SIGNUP_ROUTE, {name, email, password})
            setAuthMode("otp")
            setUserEmail(email)
            console.log("Registration successful", data.user);
        }catch (error:any) {
            setErr(error.response?.data?.message || "Registration failed");
        }finally{
            setLoading(false);
        }
        
    }


    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h1 className="text-xl font-semibold">Create Account</h1>
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                    <User size={18} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-transparent outline-none text-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                    <Mail size={18} className="text-gray-500" />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full bg-transparent outline-none text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                    <Lock size={18} className="text-gray-500" />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full bg-transparent outline-none text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {
                    err && <p className="text-red-500 text-sm">*{err}</p>
                }
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center text-center items-center h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition"
                >
                    {!loading ? "Sign Up" :<CircleDashed size={18} className="animate-spin text-white" />}
                </button>


            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <span
                    onClick={() => setAuthMode("login")}
                    className="text-black font-medium hover:underline cursor-pointer"
                >
                    Login
                </span>
            </p>
        </motion.div>
    )
}

export default SignUpForm
