'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const RiderIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/713/713437.png', // Bike icon
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    riderPos?: [number, number];
    pickupPos?: [number, number];
    dropPos?: [number, number];
    center?: [number, number];
    zoom?: number;
}

// Helper to auto-fit markers
function ChangeView({ bounds }: { bounds: any }) {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
}

export default function MapComponent({ riderPos, pickupPos, dropPos, center = [20, 78], zoom = 5 }: MapProps) {
    const [route, setRoute] = useState<[number, number][]>([]);

    useEffect(() => {
        if (pickupPos && dropPos) {
            // Fetch route from OSRM
            fetch(`https://router.project-osrm.org/route/v1/driving/${pickupPos[1]},${pickupPos[0]};${dropPos[1]},${dropPos[0]}?overview=full&geometries=geojson`)
                .then(res => res.json())
                .then(data => {
                    if (data.routes && data.routes[0]) {
                        const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                        setRoute(coords);
                    }
                })
                .catch(err => console.error("Routing error:", err));
        }
    }, [pickupPos, dropPos]);

    const bounds = [];
    if (pickupPos) bounds.push(pickupPos);
    if (dropPos) bounds.push(dropPos);
    if (riderPos) bounds.push(riderPos);

    return (
        <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {pickupPos && (
                    <Marker position={pickupPos}>
                        <Popup>Pickup Point</Popup>
                    </Marker>
                )}

                {dropPos && (
                    <Marker position={dropPos}>
                        <Popup>Drop Point</Popup>
                    </Marker>
                )}

                {riderPos && (
                    <Marker position={riderPos} icon={RiderIcon}>
                        <Popup>Rider is here</Popup>
                    </Marker>
                )}

                {route.length > 0 && <Polyline positions={route} color="var(--primary)" weight={5} opacity={0.7} />}

                <ChangeView bounds={bounds.length > 1 ? bounds : null} />
            </MapContainer>
        </div>
    );
}
