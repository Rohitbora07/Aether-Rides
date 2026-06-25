'use client'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'
import { GET_ALL_MESSAGES_ROUTE, SEND_MESSAGE_ROUTE, AI_SUGGESTIONS_ROUTE } from "@/constants/routes"
import { Send, Sparkles, X } from 'lucide-react'
import { getSocket } from "@/lib/socket"

interface RideChatProps {
    currentRole: "driver" | "user" | undefined
    bookingId: string | undefined
    userName: string
    driverName: string
}

type message = {
    bookingId: string
    sender: "user" | "driver"
    message: string
    text: string
    createdAt: Date | string
}

function RideChat({ currentRole, bookingId, userName, driverName }: RideChatProps) {
    console.log("RideChat Props:", { currentRole, bookingId, userName, driverName })
    const myName = currentRole === "user" ? userName : driverName
    const otherName = currentRole === "user" ? driverName : userName

    const [messages, setMessages] = useState<message[]>([])
    const [lastMessage, setLastMessage] = useState<string>("")
    const [text, setText] = useState<string>("")
    const [showAi, setShowAi] = useState<boolean>(false)
    const [aiLoading, setAiLoading] = useState<boolean>(false)
    const [suggestions, setSuggestions] = useState<string[]>([])

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async () => {
        const socket = getSocket()
        try {
            const { data } = await axios.post(SEND_MESSAGE_ROUTE, {
                bookingId,
                sender: currentRole,
                message: text
            })
            console.log("Message sent:", data.msg)
            socket.emit("chat-message", data.msg)
            setText("")
            // setMessages([...messages, data.msg])
        } catch (error) {
            console.error("Error sending message:", error)
        }
    }

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await axios.post(GET_ALL_MESSAGES_ROUTE, {
                    bookingId
                })
                console.log("Fetched messages:", data.messages[data.messages.length - 1]?.message)
                setMessages(data.messages)
                setLastMessage(data.messages[data.messages.length - 1]?.message || "")
            } catch (error) {
                console.error("Error fetching messages:", error)
            }
        }
        fetchMessages()
    }, [bookingId])

    console.log("Current Role:", currentRole)
    useEffect(() => {
        const socket = getSocket()
        socket.on("chat-message", (data: message) => {

            console.log("Received chat message:", data)
            console.log("driver: ", data.sender)
            setMessages((prevMessages) => [...prevMessages, data])
        })
        return () => {
            socket.off("chat-message")
        }
    }, [])

    const fetchAISuggestions = async () => {
        setAiLoading(true)
        setShowAi(true)
        try {
            const { data } = await axios.post(AI_SUGGESTIONS_ROUTE, {
                lastMessage,
                role: currentRole
            })
            console.log("AI Suggestions:", data)
            setSuggestions(data.suggestions)
        } catch (error) {
            console.error("Error fetching AI suggestions:", error)
        } finally {
            setAiLoading(false)
        }
    }

    const formatDate = (dateInput?: Date | string) => {
        if (!dateInput) return "-";
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        }).replace(",", "");
    }

    return (
        <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl overflow-hidden border border-zinc-100">
            <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-100">

                {/* Other User Avatar */}
                <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
                        {otherName.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                </div>

                {/* Other User */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 leading-none">{otherName}
                    </p>
                    <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">Active Now
                    </p>
                </div>
            </div>

            <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
                            <Send size={18} className="text-zinc-400" />
                        </div>
                        <p className="text-sm text-zinc-400 font-medium">No messages yet</p>

                        <p className="text-xs text-zinc-400">Start the conversation below
                        </p>
                    </div>
                )}

                {messages.length > 0 &&
                    messages.map((msg, index) => {
                        const isMyMessage = msg.sender === currentRole
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                className={`flex items-end gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[72%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl shadow-sm ${isMyMessage
                                        ? "bg-zinc-950 text-white rounded-br-sm"
                                        : "bg-white border border-zinc-200 text-zinc-900 rounded-bl-sm"
                                        }`}
                                >
                                    <p className='text-sm leading-relaxed' >{msg.message}</p>
                                    <span className="text-[9px] text-zinc-400 font-medium mt-1" >
                                        {formatDate(msg.createdAt)}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })
                }
                <div ref={messagesEndRef} />
            </div>
            <AnimatePresence>
                {showAi && messages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="shrink-0 overflow-hidden border-t border-zinc-100 bg-white"
                    >
                        <div className="px-4 pt-3 pb-2">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles size={12} className="text-violet-500" />
                                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        AI Suggestions
                                    </span>
                                </div>

                                <button onClick={() => setShowAi(false)} className="p-1 rounded-full hover:bg-zinc-100 transition-colors">
                                    <X size={16} className="text-zinc-400 hover:text-zinc-500 transition-colors" />
                                </button>
                            </div>
                        </div>
                        {aiLoading ? (
                            <div className="flex flex-col gap-1.5">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-9 bg-zinc-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {suggestions.map((s, i) => (
                                    <motion.div
                                        key={i}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setText(s);
                                            setShowAi(false);
                                        }}
                                        className="text-left text-sm text-zinc-700 bg-zinc-50 hover:bg-violet-50 hover:text-violet-700 border border-zinc-100 hover:border-violet-200 px-3 py-2 rounded-xl transition-all"
                                    >
                                        {s}
                                    </motion.div>
                                ))}
                                <button
                                    onClick={fetchAISuggestions}
                                    className=" text-[11px] text-violet-500 hover:text-violet-700 font-semibold text-center transition-colors mt-1" >
                                    Refresh Suggestions
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}


            </AnimatePresence>


            <div className="shrink-0 bg-white px-4 pb-4 pt-2">
                <div className=" flex items-center gap-2 bg-zinc-100 rounded-2xl pl-3 pr-1.5 py-1.5">
                    {messages.length > 0 && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => fetchAISuggestions()}
                            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${showAi
                                ? "bg-violet-600 text-white"
                                : "bg-white text-violet-500 border border-zinc-200 hover:bg-violet-50"
                                }`}
                        >
                            <Sparkles size={16} />
                        </motion.button>
                    )}
                    <input
                        type="text"
                        placeholder="Message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none py-1.5 min-w-0"
                    />

                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => sendMessage()}
                        disabled={!text.trim()}
                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${text.trim()
                            ? "bg-zinc-950 text-white hover:bg-zinc-800"
                            : "bg-transparent text-zinc-300 cursor-not-allowed"
                            }`}
                    >
                        <Send size={16} />
                    </motion.button>
                </div>
            </div>


        </div>
    )
}

export default RideChat
