'use client'
import React, { useState, useEffect, useCallback } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import axios from 'axios'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin, Navigation2 } from 'lucide-react'

type searchProps = {
    pickUp: string,
    drop: string,
    onChange: (pickUp: string, drop: string) => void,
    onDistance: (km: number) => void
}

function SearchMap({ pickUp, drop, onChange, onDistance }: searchProps) {

    const [p1, setP1] = useState<[number, number]>()
    const [p2, setP2] = useState<[number, number]>()
    const [route, setRoute] = useState<[number, number][]>([])
    const [km, setKm] = useState<number | null>(0)
    const [ready, setReady] = useState(false)
    console.log("pickup:", pickUp)
    console.log("drop:", drop)

    const geoCoding = async (d: string): Promise<[number, number] | null> => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
            if (!apiKey) {
                console.error("GEOAPIFY API key is not set")
                return null
            }
            const params = new URLSearchParams({
                text: d,
                apiKey: apiKey
            })
            const url = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`
            const { data } = await axios.get(url)
            console.log(data)
            if (!data.features || data.features.length === 0) return null
            const [lon, lat] = data.features[0].geometry.coordinates
            return [lat, lon]
        } catch (e) {
            console.log(e)
            return null
        }
    }

    function FitBounds({ p1, p2 }: { p1: [number, number], p2: [number, number] }) {
        const map = useMap()
        useEffect(() => {
            map.invalidateSize()
            map.fitBounds([p1, p2], { padding: [72, 72], maxZoom: 15, animate: true })
        }, [p1, p2, map])

        return null
    }

    const loadRoute = useCallback(async (p: [number, number], d: [number, number]) => {
        try {
            const { data } = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${p[1]},${p[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`
            )
            if (!data.routes.length) return
            setRoute(data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]))
            const distKm = (data.routes[0].distance / 1000).toFixed(2)
            setKm(parseFloat(distKm))
            onDistance(parseFloat(distKm))
        } catch (e) {
            console.log(e)
        }
    }, [onDistance])

    const locationFinder = async (lat: number, lon: number) => {
        try{
            const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
            if(!apiKey) {
                console.error("GEOAPIFY API key is not set")
                return null
            }
            const params = new URLSearchParams({
                lat: lat.toString(),
                lon: lon.toString(),
                apiKey: apiKey
            })
            const url = `https://api.geoapify.com/v1/geocode/reverse?${params.toString()}`
            const { data } = await axios.get(url)
            if( !data.features.length ) return 
                const p = data.features[0].properties
                return [p.formatted]
        }catch(e){
            console.log(e)
        }
    }

    useEffect(() => {
        setReady(false)
        if (pickUp && drop) {
            (async () => {
                const a = await geoCoding(pickUp)
                const b = await geoCoding(drop)
                if (!a || !b) return
                await loadRoute(a, b)
                setP1(a)
                setP2(b)
                setReady(true)
            })()

        }
    }, [pickUp, drop, loadRoute])

    const dragPickUp = async (lat: number, lon: number) => {
        const add = await locationFinder(lat, lon)
        setP1([lat, lon])
        if (p2) {
            await loadRoute([lat, lon], p2)
        }
        if(add) onChange(add[0], drop)
    }

    const dragDrop = async (lat: number, lon: number) => {
        const add = await locationFinder(lat, lon)
        setP2([lat, lon])
        if (p1) {
            await loadRoute(p1, [lat, lon])
        }
        if(add) onChange(pickUp, add[0])
    }

    const pickUpIcon = new L.DivIcon({
        html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">
    <div style="background:#0a0a0a;color:#fff;padding:5px 14px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;white-space:nowrap;font-family:-apple-system,system-ui,sans-serif;box-shadow:0 2px 12px rgba(0,0,0,0.25);">PICKUP
    </div>
    <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4;"></div>
    <div style="width:13px;height:13px;background:#0a0a0a;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.15),0 3px 10px rgba(0,0,0,0.3);"></div></div>`,
        className: '',
        iconSize: [90, 58],
        iconAnchor: [45, 58]
    })
    const dropIcon = new L.DivIcon({
        html: `
    <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22))">
    <div style="background:#0a0a0a;color:#fff;padding:5px 14px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;white-space:nowrap;font-family:-apple-system,system-ui,sans-serif;box-shadow:0 2px 12px rgba(0,0,0,0.25);">DROP
    </div>
    <div style="width:2px;height:10px;background:#0a0a0a;opacity:0.4;"></div>
    <div style="width:13px;height:13px;background:#0a0a0a;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,0.15),0 3px 10px rgba(0,0,0,0.3);"></div></div>`,
        className: '',
        iconSize: [90, 58],
        iconAnchor: [45, 58]
    })

    // const pickUpImage = new L.Icon({
    //     iconUrl: '/pickup.png',
    //     iconSize: [50, 50],
    //     iconAnchor: [15, 30],
    // })
    // const dropImage = new L.Icon({
    //     iconUrl: '/drop.png',
    //     iconSize: [50, 50],
    //     iconAnchor: [15, 30],
    // })



    return (
        <div className="relative w-full h-full bg-zinc-100" >
            <MapContainer
                style={{ height: '100%', width: '100%' }}
                center={p1 ?? [0, 0]}
                zoom={13}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"

                />
                {p1 && p2 && <FitBounds p1={p1} p2={p2} />}
                {p1 && <Marker
                    position={p1}
                    icon={pickUpIcon}
                    draggable
                    eventHandlers={{
                        dragend: (e) => {
                            const m = e.target.getLatLng()
                            dragPickUp(m.lat, m.lng)
                        }
                    }}
                />}
                {p2 && <Marker
                    position={p2}
                    icon={dropIcon}
                    draggable
                    eventHandlers={{
                        dragend: (e) => {
                            const m = e.target.getLatLng()
                            dragDrop(m.lat, m.lng)
                        }
                    }}
                />}
                {route.length > 0 && (
                    <>
                        <Polyline positions={route} color="#0a0a0a" weight={4} opacity={0.8} />
                    </>
                )}
            </MapContainer>
            <AnimatePresence>
                {
                    !ready &&
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45 }}
                        className="absolute inset-0 z-999 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-4"
                    >
                        <div className="relative w-14 h-14 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900"
                            />

                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 rounded-full border border-transparent border-t-zinc-300"
                            />
                            <MapPin size={15} className="text-zinc-800" />
                        </div>
                        <div className="text-center">
                            <p className="text-zinc-900 text-xs font-black tracking-[0.22em] uppercase">Loading Map</p>

                            <p className="text-zinc-400 text-[10px] font-medium tracking-wider mt-0.5">Plotting your route...</p>
                        </div>
                    </motion.div>
                }
            </AnimatePresence>
            <AnimatePresence>
                {ready && km !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute bottom-20 left-4 z-500 flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-2 rounded-xl shadow-lg"
                    >
                        <Navigation2 size={13} className="text-zinc-900" />
                        <span className="text-zinc-900 text-xs font-bold">{km} km</span>
                        <span className="w-px h-3 bg-zinc-200" />
                        <span className="text-xs text-zinc-600">~{Math.max(3, Math.round((km / 25) * 60))} min</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default SearchMap
