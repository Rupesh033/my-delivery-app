'use client';

import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';

export default function CustomerPage() {
    const { data: session } = useSession();
    const [step, setStep] = useState('selection'); // selection, searching, booked
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [fare, setFare] = useState(0);
    const [rideData, setRideData] = useState<any>(null);
    const [riderCoords, setRiderCoords] = useState<[number, number] | undefined>(undefined);

    // Mock coordinates for Garhwa, Jharkhand
    const [pickupCoords] = useState<[number, number]>([24.1627, 83.8055]);
    const [dropCoords] = useState<[number, number]>([24.1750, 83.8200]);

    useEffect(() => {
        console.log('Connecting to socket at:', process.env.NEXT_PUBLIC_BACKEND_URL);
        socket.connect();

        socket.on('connect', () => {
            console.log('Socket connected successfully! ID:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        socket.on('newRideRequest', (ride) => {
            console.log('Ride matching in progress...');
        });

        socket.on('rideAccepted', (data) => {
            console.log('Ride accepted by rider:', data.riderId, 'Full Data:', data.ride);
            setRideData(data.ride); // This now contains the OTP from the backend
            setStep('booked');
        });

        socket.on('rideStarted', (data) => {
            setStep('on_ride');
        });

        socket.on('riderLocationUpdate', (data) => {
            setRiderCoords([data.lat, data.lng]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleBook = async () => {
        console.log('Initiating ride search...', { pickup, drop, fare });
        setStep('searching');

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        console.log('Using backend URL:', backendUrl);

        try {
            const resp = await fetch(`${backendUrl}/api/rides/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session?.user?.email || 'U1', pickup, drop, fare })
            });
            const data = await resp.json();
            console.log('Ride book response:', data);
        } catch (err) {
            console.error('Ride booking failed:', err);
            alert('Rider booking service currently unavailable. Please try again.');
        }
    };

    return (
        <div className="min-h-screen p-6 max-w-md mx-auto">
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold rapido-gradient text-black inline-block px-4 py-1 rounded">Rapido</h1>
                    <p className="text-gray-400 mt-2 text-sm">Where are you going today?</p>
                </div>
                {session ? (
                    <div className="flex flex-col items-end gap-2">
                        <img src={session.user?.image || ''} className="w-10 h-10 rounded-full border-2 border-[var(--primary)]" alt="User" />
                        <button onClick={() => signOut()} className="text-[10px] text-gray-500 uppercase font-bold hover:text-white transition-colors">Sign Out</button>
                    </div>
                ) : (
                    <Link href="/login" className="btn-primary text-xs px-4 py-2">Sign In</Link>
                )}
            </header>

            {step === 'selection' && (
                <div className="glass-card flex flex-col gap-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Pickup Location</label>
                        <input
                            className="w-full bg-[#222] border-none rounded-lg p-3 mt-1 focus:ring-2 ring-[var(--primary)] outline-none"
                            placeholder="Search pickup location"
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Drop Location</label>
                        <input
                            className="w-full bg-[#222] border-none rounded-lg p-3 mt-1 focus:ring-2 ring-[var(--primary)] outline-none"
                            placeholder="Enter destination"
                            value={drop}
                            onChange={(e) => {
                                setDrop(e.target.value);
                                setFare(Math.floor(Math.random() * 100) + 40);
                            }}
                        />
                    </div>

                    {fare > 0 && (
                        <div className="mt-4 p-4 bg-[var(--secondary)] rounded-xl flex justify-between items-center border border-[var(--border)]">
                            <div>
                                <p className="text-sm text-gray-400">Estimated Fare</p>
                                <p className="text-2xl font-bold text-[var(--primary)]">₹{fare}</p>
                            </div>
                            <button onClick={handleBook} className="btn-primary text-sm h-fit">Book Now</button>
                        </div>
                    )}
                </div>
            )}

            {step === 'searching' && (
                <div className="glass-card text-center py-12">
                    <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-xl font-bold">Finding a Rider...</h2>
                    <p className="text-gray-400 mt-2">Connecting you to the nearest bike taxi</p>
                    <button onClick={() => setStep('selection')} className="mt-8 text-red-500 font-bold">Cancel Request</button>
                </div>
            )}

            {step === 'booked' && (
                <div className="glass-card">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl">🏍️</div>
                        <div>
                            <h2 className="text-lg font-bold">Rider Assigned</h2>
                            <p className="text-gray-400 text-sm">Rupesh (4.8 ★)</p>
                        </div>
                    </div>
                    <div className="p-4 bg-[var(--secondary)] rounded-xl border border-[var(--border)] mb-6">
                        <p className="text-xs text-gray-500 uppercase mb-2">OTP for your ride</p>
                        <p className="text-4xl font-black tracking-widest text-[var(--primary)] text-center">
                            {rideData?.otp?.split('').join(' ')}
                        </p>
                    </div>
                    <div className="h-64 bg-[#222] rounded-xl overflow-hidden mb-4">
                        <MapComponent
                            pickupPos={pickupCoords}
                            dropPos={dropCoords}
                            riderPos={riderCoords}
                        />
                    </div>
                </div>
            )}

            {step === 'on_ride' && (
                <div className="glass-card text-center">
                    <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-xl mx-auto mb-4">📍</div>
                    <h2 className="text-xl font-bold">Enjoy Your Ride!</h2>
                    <p className="text-gray-400 mt-1 mb-6 text-sm">You are on your way to {drop}</p>
                    <div className="h-80 bg-[#222] rounded-xl overflow-hidden mb-4">
                        <MapComponent
                            pickupPos={pickupCoords}
                            dropPos={dropCoords}
                            riderPos={riderCoords}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
