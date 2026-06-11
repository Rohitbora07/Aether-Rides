import {useState} from 'react'
import { CircleDashed, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { AuthMode } from '../types';
import { signIn, useSession } from 'next-auth/react';

const LoginForm = ({ setAuthMode }: { setAuthMode: (mode: AuthMode) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await signIn("credentials",{
            email,
            password,
            redirect: false,
        })
        setLoading(false);
        console.log(res)
    }
    const {data} = useSession()
    console.log(data)

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                    <Mail size={18} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm"
                    />
                </div>
                <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                    <Lock size={18} className="text-gray-500" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm"
                    />
                </div>
                <button disabled={loading} className="w-full flex justify-center text-center items-center h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition">
                    {!loading ? "Login" :<CircleDashed size={18} className="animate-spin text-white" />}
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
    )
}

export default LoginForm
