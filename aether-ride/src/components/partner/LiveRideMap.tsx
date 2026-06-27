'use client'
import React, { useState, useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import axios from 'axios'

type Props = {
    driverLocation: [number, number] | null,
    pickUpLocation: [number, number] | null,
    dropLocation: [number, number] | null,
    map_status: "arriving" | "ongoing" | "completed",
    onStats: (data: {
        distanceToPickup: number,
        etaToPickup: number,
        distanceToDrop: number,
        etaToDrop: number
    }) => void
}

const pickUpIcon = new L.DivIcon({
    html: `
        <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.28))">
            <div style="background:#0a0a0a;color:#fff;padding:5px 13px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;font-family:system-ui">
                PICKUP
            </div>
            <div style="width:2px;height:9px;background:#0a0a0a"></div>
            <div style="width:10px;height:10px;background:#0a0a0a;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>
        </div>
    `,
    className: "",
    iconSize: [80, 50],
    iconAnchor: [40, 50]
});

const dropIcon = new L.DivIcon({
    html: `
        <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.28))">
            <div style="background:#0a0a0a;color:#fff;padding:5px 13px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;font-family:system-ui">
                DROP
            </div>
            <div style="width:2px;height:9px;background:#0a0a0a"></div>
            <div style="width:10px;height:10px;background:#0a0a0a;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>
        </div>
    `,
    className: "",
    iconSize: [70, 50],
    iconAnchor: [35, 50]
});

const driverIcon = new L.DivIcon({
    html: `
        <div id="car-marker" style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;transform-origin:center;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);filter:drop-shadow(0 6px 18px rgba(0,0,0,0.5));">
            <div style="background:#0a0a0a;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px #fff,0 0 0 5px #0a0a0a,0 8px 28px rgba(0,0,0,0.5);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 11L6.5 6.5H17.5L19 11" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
                    <rect x="3" y="11" width="18" height="7" rx="2" stroke="white" stroke-width="1.6"/>
                    <circle cx="7.5" cy="18.5" r="1.5" fill="white"/>
                    <circle cx="16.5" cy="18.5" r="1.5" fill="white"/>
                    <path d="M3 14H21" stroke="white" stroke-width="1" opacity="0.35"/>
                </svg>
            </div>
        </div>
    `,
    className: "",
    iconSize: [52, 52],
    iconAnchor: [26, 26]
});

function LiveRideMap({ driverLocation, pickUpLocation, dropLocation, map_status, onStats }: Props) {

    const [routeToPickup, setRouteToPickup] = useState<[number, number][]>([])
    const [routeToDrop, setRouteToDrop] = useState<[number, number][]>([])

    useEffect(() => {
        if(!driverLocation) return
        const [pLat, pLon] = pickUpLocation || [0, 0]
        const [dLat, dLon] = dropLocation || [0, 0]
        const [drLat, drLon] = driverLocation || [0, 0]

        const getRoute = async ({startLat, startLon, destLat, destLon}: {startLat: number, startLon: number, destLat: number, destLon: number}) => {
            const { data } = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=geojson`
            )
            // console.log("route data ", data.routes[0].geometry.coordinates[0])
            return data.routes[0]
        }

        const fetchRoute = async () => {
            try{
                if( map_status === "arriving"){
                    const pickUpRoute = await getRoute({
                        startLat: drLat,
                        startLon: drLon,
                        destLat: pLat,
                        destLon: pLon
                    })

                    const dropRoute = await getRoute({
                        startLat: dLat,
                        startLon: dLon,
                        destLat: drLat,
                        destLon: drLon
                    })

                    if(pickUpRoute){
                        setRouteToPickup(pickUpRoute.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]))
                    }
                    if(dropRoute){
                        setRouteToDrop(dropRoute.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]))
                    }

                    onStats({
                        distanceToPickup: pickUpRoute.distance/1000,
                        etaToPickup: pickUpRoute.duration/60,
                        distanceToDrop: dropRoute.distance/1000,
                        etaToDrop: dropRoute.duration/60
                    })
                }else{
                    setRouteToPickup([])
                    const dropRoute = await getRoute({
                        startLat: dLat,
                        startLon: dLon,
                        destLat: drLat,
                        destLon: drLon
                    })
                    if(dropRoute){
                        setRouteToDrop(dropRoute.geometry.coordinates.map(([lat, lon]: [number, number]) => [lat, lon]))
                    }
                    onStats({
                        distanceToPickup: 0,
                        etaToPickup: 0,
                        distanceToDrop: dropRoute.distance/1000,
                        etaToDrop: dropRoute.duration/60
                    })
                }
            }catch(err){
                console.log("route fetch error ", err)
            }
        }
        fetchRoute()
    },[driverLocation, map_status, pickUpLocation, dropLocation, onStats])
    const showPickMarker = map_status === "arriving" && !!pickUpLocation
    const showPickRoute = map_status === "arriving" && routeToPickup.length > 0
    const showDropRoute = map_status !== "completed" && routeToDrop.length > 0
    return (
        <div className="relative w-full h-full bg-zinc-100" >
                    <MapContainer
                        style={{ height: '100%', width: '100%' }}
                        center={pickUpLocation || [0, 0]}
                        zoom={13}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">CARTO</a> contributors'
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        
                        />

                        {showPickMarker && <Marker
                            position={pickUpLocation as [number, number]}
                            icon={pickUpIcon}
                            draggable
                        />}
                        {dropLocation && <Marker
                            position={dropLocation}
                            icon={dropIcon}
                            draggable
                        />}
                        {driverLocation && <Marker
                            position={driverLocation}
                            icon={driverIcon}
                        />}

                        {
                            showPickRoute && <Polyline
                                positions={routeToPickup}
                                pathOptions={{ color: '#0b0b0b', weight: 4, opacity: 0.8, lineCap: 'round', lineJoin: 'round', dashArray: '2 10' }}
                            />
                        }
                        {
                            showDropRoute && <Polyline
                                positions={routeToDrop}
                                pathOptions={{ color: '#000000', weight: 4, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }}
                            />
                        }
                    </MapContainer>

                </div>
    )
}

export default LiveRideMap
