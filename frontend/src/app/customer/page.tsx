'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { socket } from '@/lib/socket';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function CustomerPage() {
    const { data: session } = useSession();

    // UI state
    const [step, setStep] = useState<'selection' | 'searching' | 'booked' | 'on_ride'>('selection');
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [fare, setFare] = useState(0);
    const [rideData, setRideData] = useState<any>(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [bookingError, setBookingError] = useState('');

    // Map positions (Garhwa, Jharkhand defaults)
    const pickupCoords: [number, number] = [24.1627, 83.8055];
    const dropCoords: [number, number] = [24.1750, 83.8200];
    const [riderCoords, setRiderCoords] = useState<[number, number] | undefined>(undefined);
    const [pricing, setPricing] = useState({ baseFare: 30, perKm: 12 });

    // Fetch pricing on mount
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/data`)
            .then(res => res.json())
            .then(data => {
                if (data.settings) setPricing(data.settings);
            })
            .catch(err => console.error('Pricing fetch failed:', err));
    }, []);

    // ── Socket setup (runs once on mount) ──────────────────────────────────
    useEffect(() => {
        socket.connect();

        const onConnect = () => setSocketConnected(true);
        const onDisconnect = () => setSocketConnected(false);
        const onConnectError = () => setSocketConnected(false);

        const onRideAccepted = (data: any) => {
            console.log('[CUSTOMER] rideAccepted:', data);
            if (data?.ride) {
                setRideData(data.ride);
                setStep('booked');
            }
        };

        const onRideStarted = () => setStep('on_ride');
        const onLocationUpdate = (data: any) => {
            if (data?.lat && data?.lng) setRiderCoords([data.lat, data.lng]);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('rideAccepted', onRideAccepted);
        socket.on('rideStarted', onRideStarted);
        socket.on('riderLocationUpdate', onLocationUpdate);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('rideAccepted', onRideAccepted);
            socket.off('rideStarted', onRideStarted);
            socket.off('riderLocationUpdate', onLocationUpdate);
        };
    }, []); // Runs only once - no dependencies

    // ── Book Ride ───────────────────────────────────────────────────────────
    const handleBook = useCallback(async () => {
        if (!pickup.trim() || !drop.trim()) {
            return setBookingError('Please enter both pickup and drop location.');
        }
        setBookingError('');
        setStep('searching');

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        console.log('[CUSTOMER] Booking ride via:', backendUrl);

        try {
            const resp = await fetch(`${backendUrl}/api/rides/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session?.user?.email || 'guest',
                    pickup: pickup.trim(),
                    drop: drop.trim(),
                    fare
                })
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            console.log('[CUSTOMER] Booking API response:', data);
        } catch (err) {
            console.error('[CUSTOMER] Booking failed:', err);
            setStep('selection');
            setBookingError('Booking failed. Please check your connection and try again.');
        }
    }, [pickup, drop, fare, session]);

    // ── Handle Drop input (also calculates fare) ────────────────────────────
    const handleDropChange = (val: string) => {
        setDrop(val);
        const handleDropChange = (val: string) => {
            setDrop(val);
            if (val.trim()) {
                // Mock distance: 2-8 km
                const distance = Math.floor(Math.random() * 6) + 2;
                const calculatedFare = pricing.baseFare + (distance * pricing.perKm);
                setFare(calculatedFare);
            } else {
                setFare(0);
            }
        };
    };

    return (
        <div className="min-h-screen p-6 max-w-md mx-auto">
            {/* Header */}
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold rapido-gradient text-black inline-block px-4 py-1 rounded">Rapido</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full transition-colors ${socketConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">
                            {socketConnected ? 'Live — Connected' : 'Connecting to server...'}
                        </p>
                    </div>
                </div>
                {session ? (
                    <div className="flex flex-col items-end gap-2">
                        <img src={session.user?.image || '/default-avatar.png'} className="w-10 h-10 rounded-full border-2 border-[var(--primary)]" alt="User" />
                        <button onClick={() => signOut()} className="text-[10px] text-gray-500 uppercase font-bold hover:text-white transition-colors">Sign Out</button>
                    </div>
                ) : (
                    <Link href="/login" className="btn-primary text-xs px-4 py-2">Sign In</Link>
                )}
            </header>

            {/* ── Selection Step ──────────────────────────────────────────── */}
            {step === 'selection' && (
                <div className="glass-card flex flex-col gap-4">
                    {bookingError && (
                        <div className="bg-red-950 border border-red-700 text-red-400 text-sm p-3 rounded-xl">{bookingError}</div>
                    )}
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Pickup Location</label>
                        <input
                            className="w-full bg-[#222] border border-gray-800 rounded-lg p-3 mt-1 focus:ring-2 ring-[var(--primary)] outline-none text-white"
                            placeholder="e.g. Garhwa Bus Stand"
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Drop Location</label>
                        <input
                            className="w-full bg-[#222] border border-gray-800 rounded-lg p-3 mt-1 focus:ring-2 ring-[var(--primary)] outline-none text-white"
                            placeholder="e.g. Rehla Chowk"
                            value={drop}
                            onChange={(e) => handleDropChange(e.target.value)}
                        />
                    </div>

                    {fare > 0 && (
                        <div className="mt-2 p-4 bg-[var(--secondary)] rounded-xl flex justify-between items-center border border-[var(--border)]">
                            <div>
                                <p className="text-sm text-gray-400">Estimated Fare</p>
                                <p className="text-2xl font-bold text-[var(--primary)]">₹{fare}</p>
                            </div>
                            <button onClick={handleBook} className="btn-primary text-sm h-fit px-6 py-3">
                                Book Now
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Searching Step ───────────────────────────────────────────── */}
            {step === 'searching' && (
                <div className="glass-card text-center py-12">
                    <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                    <h2 className="text-xl font-bold">Finding a Rider...</h2>
                    <p className="text-gray-400 mt-2 text-sm">Connecting you to the nearest bike taxi</p>
                    <p className="text-xs text-gray-600 mt-4">
                        {pickup} → {drop}
                    </p>
                    <button
                        onClick={() => setStep('selection')}
                        className="mt-8 text-red-500 font-bold text-sm border border-red-900 px-4 py-2 rounded-xl hover:bg-red-950 transition-colors"
                    >
                        Cancel Request
                    </button>
                </div>
            )}

            {/* ── Booked / Rider Assigned Step ─────────────────────────────── */}
            {step === 'booked' && rideData && (
                <div className="glass-card">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl">🏍️</div>
                        <div>
                            <h2 className="text-lg font-bold">Rider Assigned!</h2>
                            <p className="text-gray-400 text-sm">Rupesh (4.8 ★) is on the way</p>
                        </div>
                    </div>

                    {/* OTP Box */}
                    <div className="p-5 bg-[var(--secondary)] rounded-xl border-2 border-[var(--primary)] mb-6">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-widest text-center">OTP for your ride</p>
                        <p className="text-5xl font-black tracking-[1rem] text-[var(--primary)] text-center">
                            {rideData.otp ?? '----'}
                        </p>
                        <p className="text-xs text-gray-600 text-center mt-2">Share this with your rider to start</p>
                    </div>

                    <div className="h-64 bg-[#222] rounded-xl overflow-hidden mb-4">
                        <MapComponent pickupPos={pickupCoords} dropPos={dropCoords} riderPos={riderCoords} />
                    </div>

                    <div className="space-y-1 text-sm text-gray-400">
                        <p>📍 <span className="text-white font-bold">{rideData.pickup}</span></p>
                        <p>🏁 <span className="text-white font-bold">{rideData.drop}</span></p>
                        <p>💰 <span className="text-[var(--primary)] font-bold">₹{rideData.fare}</span></p>
                    </div>
                </div>
            )}

            {/* ── On Ride Step ─────────────────────────────────────────────── */}
            {step === 'on_ride' && (
                <div className="glass-card text-center">
                    <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-xl mx-auto mb-4">📍</div>
                    <h2 className="text-xl font-bold">Ride in Progress!</h2>
                    <p className="text-gray-400 mt-1 mb-6 text-sm">On the way to {drop}</p>
                    <div className="h-80 bg-[#222] rounded-xl overflow-hidden mb-4">
                        <MapComponent pickupPos={pickupCoords} dropPos={dropCoords} riderPos={riderCoords} />
                    </div>
                </div>
            )}
        </div>
    );
}
