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

        const watcher = navigator.geolocation.watchPosition(({coords}) => {
            socketRef.current?.emit("updateLocation" ,{
                userId,
                latitude: coords.latitude,
                longitude: coords.longitude,
            })
        },
        (err) => {
            console.error("Geolocation error:", err)
        },
        {
            enableHighAccuracy: true,
            maximumAge: 10000,
        })

        return () => {navigator.geolocation.clearWatch(watcher)}
    }, [userId])
    return null
}

export default GeoUpdater
