'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from '@/lib/socket';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function RiderPage() {
    const [online, setOnline] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const [activeRide, setActiveRide] = useState<any>(null);
    const [isAccepted, setIsAccepted] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [onRide, setOnRide] = useState(false);
    const [otpError, setOtpError] = useState('');

    // Ref so socket listener always reads the latest `online` value
    const onlineRef = useRef(false);
    useEffect(() => {
        onlineRef.current = online;
    }, [online]);

    // ── Socket setup – runs once on mount ──────────────────────────────────
    useEffect(() => {
        socket.connect();

        const onConnect = () => {
            console.log('[RIDER] Socket connected:', socket.id);
            setSocketConnected(true);
        };
        const onDisconnect = (reason: string) => {
            console.log('[RIDER] Socket disconnected:', reason);
            setSocketConnected(false);
        };
        const onConnectError = (err: Error) => {
            console.error('[RIDER] Connect error:', err.message);
            setSocketConnected(false);
        };
        const onNewRideRequest = (ride: any) => {
            console.log('[RIDER] newRideRequest received. Online?', onlineRef.current, ride);
            if (onlineRef.current) {
                setActiveRide(ride);
                setIsAccepted(false);
                setOnRide(false);
                setOtpInput('');
                setOtpError('');
            }
        };
        const onRideStarted = () => setOnRide(true);
        const onOtpError = (data: any) => setOtpError(data?.message || 'Invalid OTP');

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('newRideRequest', onNewRideRequest);
        socket.on('rideStarted', onRideStarted);
        socket.on('otpError', onOtpError);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('newRideRequest', onNewRideRequest);
            socket.off('rideStarted', onRideStarted);
            socket.off('otpError', onOtpError);
        };
    }, []); // Single mount — no deps

    // ── Location broadcast (only when online) ──────────────────────────────
    useEffect(() => {
        if (!online) return;
        const interval = setInterval(() => {
            const lat = 24.1627 + (Math.random() - 0.5) * 0.01;
            const lng = 83.8055 + (Math.random() - 0.5) * 0.01;
            socket.emit('updateLocation', { riderId: 'R1', lat, lng });
        }, 5000);
        return () => clearInterval(interval);
    }, [online]); // Starts/stops cleanly with online status

    // ── Toggle Online/Offline ───────────────────────────────────────────────
    const toggleOnline = useCallback(() => {
        const next = !online;
        setOnline(next);
        if (next) {
            socket.emit('goOnline', { riderId: 'R1' });
            console.log('[RIDER] Went ONLINE');
        } else {
            socket.emit('goOffline', { riderId: 'R1' });
            setActiveRide(null);
            console.log('[RIDER] Went OFFLINE');
        }
    }, [online]);

    // ── Accept Ride ─────────────────────────────────────────────────────────
    const handleAccept = () => {
        socket.emit('acceptRide', { rideId: activeRide.id, riderId: 'R1' });
        setIsAccepted(true);
    };

    // ── Verify OTP ─────────────────────────────────────────────────────────
    const handleVerifyOtp = () => {
        setOtpError('');
        socket.emit('verifyOTP', { rideId: activeRide.id, otp: otpInput });
    };

    // ── Complete Ride ───────────────────────────────────────────────────────
    const handleComplete = () => {
        setActiveRide(null);
        setIsAccepted(false);
        setOnRide(false);
        setOtpInput('');
    };

    return (
        <div className="min-h-screen bg-black p-6 max-w-md mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black">RIDER HUB</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                        <p className="text-[10px] text-gray-500 uppercase font-bold">
                            {socketConnected ? 'Server Connected' : 'Connecting...'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={toggleOnline}
                    className={`px-5 py-2 rounded-full font-bold transition-all ${online ? 'bg-green-500 text-black shadow-lg shadow-green-500/30' : 'bg-gray-800 text-gray-400'
                        }`}
                >
                    {online ? '● ONLINE' : '○ OFFLINE'}
                </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass-card p-4">
                    <p className="text-gray-500 text-xs">Today&apos;s Earnings</p>
                    <p className="text-2xl font-bold">₹1,240</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-gray-500 text-xs">Total Rides</p>
                    <p className="text-2xl font-bold">12</p>
                </div>
            </div>

            {/* ── No Active Ride ────────────────────────────────────────────── */}
            {!activeRide && !isAccepted && (
                <div className="glass-card text-center py-12">
                    {!online ? (
                        <div>
                            <div className="text-4xl mb-4">🏍️</div>
                            <p className="text-gray-400">Go online to start receiving ride requests</p>
                            <button onClick={toggleOnline} className="mt-4 btn-primary px-8 py-3">
                                Go Online
                            </button>
                        </div>
                    ) : (
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-[var(--primary)] rounded-full mb-4 opacity-60" />
                            <p className="font-bold">Waiting for requests...</p>
                            <p className="text-xs text-gray-600 mt-2">You will be notified when a customer books</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── New Ride Request ──────────────────────────────────────────── */}
            {activeRide && !isAccepted && (
                <div className="glass-card border-2 border-[var(--primary)]">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-[var(--primary)] text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                            New Request
                        </span>
                        <span className="text-xl font-bold text-green-400">₹{activeRide.fare}</span>
                    </div>
                    <div className="space-y-4 mb-6">
                        <div className="flex gap-3 items-start">
                            <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Pickup</p>
                                <p className="font-bold">{activeRide.pickup}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Drop</p>
                                <p className="font-bold">{activeRide.drop}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setActiveRide(null)}
                            className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="flex-1 btn-primary py-3"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            )}

            {/* ── Ride Accepted – OTP Entry ─────────────────────────────────── */}
            {isAccepted && !onRide && (
                <div className="glass-card border-2 border-green-500 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                    <h2 className="text-xl font-bold mb-1">Ride Accepted</h2>
                    <p className="text-gray-400 text-sm mb-6">Pick up from: <span className="text-white font-bold">{activeRide?.pickup}</span></p>

                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Enter Customer OTP</p>
                    <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full bg-[#222] text-center text-3xl tracking-[1rem] font-bold py-4 rounded-xl mb-2 border border-gray-700 focus:ring-2 ring-[var(--primary)] outline-none"
                        placeholder="----"
                        maxLength={4}
                    />
                    {otpError && <p className="text-red-500 text-xs mb-3">{otpError}</p>}

                    <button
                        onClick={handleVerifyOtp}
                        disabled={otpInput.length < 4}
                        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Start Ride
                    </button>

                    <div className="h-48 mt-6 bg-[#222] rounded-xl overflow-hidden border border-gray-700">
                        <MapComponent pickupPos={[24.1627, 83.8055]} />
                    </div>
                </div>
            )}

            {/* ── On Ride ─────────────────────────────────────────────────── */}
            {onRide && (
                <div className="glass-card text-center">
                    <div className="text-3xl mb-4">🏎️</div>
                    <h2 className="text-lg font-bold text-green-400 mb-1">Ride in Progress</h2>
                    <p className="text-gray-400 text-sm mb-6">Drop at: <span className="text-white font-bold">{activeRide?.drop}</span></p>
                    <div className="h-48 mb-6 bg-[#222] rounded-xl overflow-hidden border border-gray-700">
                        <MapComponent dropPos={[24.1750, 83.8200]} />
                    </div>
                    <button onClick={handleComplete} className="w-full bg-green-500 text-black py-3 rounded-xl font-bold hover:bg-green-400 transition-colors">
                        Complete Ride ✓
                    </button>
                </div>
            )}

            <footer className="mt-12 opacity-30 text-center">
                <p className="text-[10px] uppercase tracking-widest">Rapido Partner App v2.0</p>
            </footer>
        </div>
    );
}
