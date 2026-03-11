'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Custom icons
const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/717/717511.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

const customerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1673/1673188.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

interface AdminMapProps {
    riders: any[];
    rides: any[];
}

export default function AdminMap({ riders, rides }: AdminMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="h-[500px] w-full bg-gray-900 animate-pulse flex items-center justify-center">Loading Map Engine...</div>;

    return (
        <MapContainer
            center={[24.1627, 83.8055]}
            zoom={13}
            style={{ height: '500px', width: '100%', borderRadius: '1rem', border: '1px solid #333' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Riders */}
            {riders.map(rider => (
                <Marker
                    key={rider.id}
                    position={[rider.lat || 24.1627, rider.lng || 83.8055]}
                    icon={riderIcon}
                >
                    <Popup>
                        <div className="text-black">
                            <p className="font-bold">{rider.name}</p>
                            <p className="text-xs">{rider.vehicle} • {rider.isOnline ? '🟢 Online' : '🔴 Offline'}</p>
                            <p className="text-xs">{rider.isApproved ? '✅ Approved' : '⏳ Pending'}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Active Rides Paths (Simple straight lines for God View) */}
            {rides.filter(r => r.status === 'on_ride').map(ride => (
                <Polyline
                    key={ride.id}
                    positions={[[ride.lat, ride.lng], [ride.destLat, ride.destLng]] as any}
                    color="#F9C935"
                    dashArray="5, 10"
                />
            ))}
        </MapContainer>
    );
}
