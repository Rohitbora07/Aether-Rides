'use client'
import { useEffect, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import { getSocket } from "@/lib/socket"

function GeoUpdater({ userId }: { userId: string }) {
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        if (!userId) return
        if (!navigator.geolocation) return
        socketRef.current = getSocket()
        socketRef.current.emit("identity", userId)
    }, [userId])
    return null
}

export default GeoUpdater
