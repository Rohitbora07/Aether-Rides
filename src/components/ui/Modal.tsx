'use client'

import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { useEffect } from "react"

type ModalProps = {
    open: boolean
    onClose: () => void
    children: React.ReactNode
}

export default function Modal({ open, onClose, children }: ModalProps) {

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }

        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [onClose])

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-90 bg-black/80 backdrop-blur-md flex items-center justify-center px-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_40px_100px_rgba(0,0,0,0.35)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-gray-500 hover:text-black"
                        >
                            <X size={18} />
                        </button>

                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}