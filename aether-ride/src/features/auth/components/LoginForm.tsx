'use client'
import { useState } from 'react'
import { CircleDashed, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { AuthMode } from '../types';
import { signIn } from 'next-auth/react';

interface LoginFormProps {
    setAuthMode: (mode: AuthMode) => void;
    onClose?: () => void;
}

const LoginForm = ({ setAuthMode, onClose }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr('');
        if (!email.trim() || !password) {
            setErr('Please fill in both email and password.');
            return;
        }

        setLoading(true);
        try {
            const res = await signIn("credentials", {
                email: email.trim().toLowerCase(),
                password,
                redirect: false,
            });

            if (res?.error) {
                setErr("Invalid email or password. Please try again.");
            } else if (res?.ok) {
                if (onClose) onClose();
                window.location.reload();
            }
        } catch (error) {
            console.error("Login error:", error);
            setErr("An unexpected error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                    <Mail size={18} className="text-gray-500 shrink-0" />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm"
                    />
                </div>
                <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                    <Lock size={18} className="text-gray-500 shrink-0" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm"
                    />
                </div>

                {err && (
                    <p className="text-red-500 text-sm font-medium">*{err}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center text-center items-center h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition disabled:opacity-50"
                >
                    {!loading ? "Login" : <CircleDashed size={18} className="animate-spin text-white" />}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <span
                    onClick={() => setAuthMode("signup")}
                    className="text-black font-medium hover:underline cursor-pointer"
                >
                    Sign Up
                </span>
            </p>
        </motion.div>
    );
};

export default LoginForm;
