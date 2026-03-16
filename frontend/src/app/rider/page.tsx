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
    const [riderId, setRiderId] = useState<string | null>(null);
    const riderIdRef = useRef<string | null>(null);
    const [earnings, setEarnings] = useState(1250);
    const [rating, setRating] = useState(4.8);

    useEffect(() => {
        const id = localStorage.getItem('riderId') || 'R1';
        setRiderId(id);
        riderIdRef.current = id;
    }, []);

    // Ref so socket listener always reads the latest `online` value
    const onlineRef = useRef(false);
    useEffect(() => {
        onlineRef.current = online;
    }, [online]);

    // ── Socket setup – runs once on mount ──────────────────────────────────
    useEffect(() => {
        const id = localStorage.getItem('riderId') || 'R1';
        const gender = localStorage.getItem('riderGender') || 'male';
        const rating = localStorage.getItem('riderRating') || '4.5';
        
        setRating(parseFloat(rating));
        
        // @ts-ignore
        socket.io.opts.query = { role: 'rider', userId: id, gender };
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
        const onError = (data: any) => {
            alert(data.message);
            setOnline(false);
        };
        const onStatusUpdate = (data: any) => {
            if (data.riderId === riderIdRef.current || data.riderId === socket.id) {
                if (data.status === 'approved') {
                    alert('Badhai ho! Aapka account approve ho gaya hai. Ab aap rides le sakte hain.');
                    window.location.reload();
                } else if (data.status === 'removed' || data.status === 'rejected') {
                    alert('Aapka account remove kar diya gaya hai.');
                    setOnline(false);
                    window.location.href = '/';
                }
            }
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('newRideRequest', onNewRideRequest);
        socket.on('rideStarted', onRideStarted);
        socket.on('otpError', onOtpError);
        socket.on('error', onError);
        socket.on('riderStatusUpdate', onStatusUpdate);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('newRideRequest', onNewRideRequest);
            socket.off('rideStarted', onRideStarted);
            socket.off('otpError', onOtpError);
            socket.off('error', onError);
            socket.off('riderStatusUpdate', onStatusUpdate);
        };
    }, []); // Single mount — no deps

    // ── Location broadcast (using real GPS or fallback simulation) ──────────
    useEffect(() => {
        if (!online) return;

        let watchId: number;

        const broadcastLocation = (lat: number, lng: number) => {
            socket.emit('updateLocation', { riderId: riderIdRef.current, lat, lng });
        };

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    broadcastLocation(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    console.warn('[RIDER] Geolocation error, failing back to simulation:', err.message);
                    // Simulation Fallback: Move randomly around the active ride's pickup location
                    const baseLat = activeRide?.pickupCoords?.[0] || 20;
                    const baseLng = activeRide?.pickupCoords?.[1] || 78;
                    const interval = setInterval(() => {
                        const simLat = baseLat + (Math.random() - 0.5) * 0.005;
                        const simLng = baseLng + (Math.random() - 0.5) * 0.005;
                        broadcastLocation(simLat, simLng);
                    }, 5000);
                    return () => clearInterval(interval);
                },
                { enableHighAccuracy: true }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [online, activeRide?.pickupCoords]); 

    // ── Toggle Online/Offline ───────────────────────────────────────────────
    const toggleOnline = useCallback(() => {
        const next = !online;
        setOnline(next);
        if (next) {
            socket.emit('goOnline', { riderId: riderIdRef.current });
            console.log('[RIDER] Went ONLINE');
        } else {
            socket.emit('goOffline', { riderId: riderIdRef.current });
            setActiveRide(null);
            console.log('[RIDER] Went OFFLINE');
        }
    }, [online]);

    // ── Accept Ride ─────────────────────────────────────────────────────────
    const handleAccept = () => {
        socket.emit('acceptRide', { rideId: activeRide.id, riderId: riderIdRef.current });
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
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-[#F9C935]">CAPTAIN HUB</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none">
                            {socketConnected ? 'System Live' : 'Offline'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={toggleOnline}
                    className={`px-6 py-2.5 rounded-2xl font-black transition-all text-xs tracking-widest uppercase ${online ? 'bg-green-500 text-black shadow-xl shadow-green-500/20' : 'bg-[#111] text-gray-600 border border-white/5'
                        }`}
                >
                    {online ? 'Online' : 'Offline'}
                </button>
            </header>

            {/* Premium Stats & Wallet */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass-card p-5 border-l-4 border-[#F9C935] bg-gradient-to-br from-[#111] to-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Earnings</p>
                            <p className="text-2xl font-black text-white">₹{earnings}</p>
                        </div>
                        <button 
                            onClick={() => {
                                if (earnings > 0) {
                                    alert(`Processing Instant Withdrawal of ₹${earnings} to your Bank Account...`);
                                    setEarnings(0);
                                } else {
                                    alert("Wallet khali hai bahi!");
                                }
                            }}
                            className="bg-[#F9C935] text-black w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg shadow-[#F9C935]/20 hover:scale-110 active:scale-90 transition-all"
                        >
                            💰
                        </button>
                    </div>
                </div>
                <div className="glass-card p-5 border-l-4 border-blue-500 bg-gradient-to-br from-[#111] to-black">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Badge</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-white">GOLD</p>
                        <span className="text-xl">🏆</span>
                    </div>
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
                                <p className="font-bold truncate w-40">{activeRide.pickup}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Drop</p>
                                <p className="font-bold truncate w-40">{activeRide.drop}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center border-t border-white/5 pt-3 mt-3">
                            <span className="text-xl">
                                {activeRide.vehicleType === 'Auto' ? '🛺' : activeRide.vehicleType === 'Cab' ? '🚗' : '🏍️'}
                            </span>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Requested: {activeRide.vehicleType || 'Bike'}
                            </p>
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
                        <MapComponent pickupPos={activeRide?.pickupCoords} dropPos={activeRide?.dropCoords} />
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
                        <MapComponent pickupPos={activeRide?.pickupCoords} dropPos={activeRide?.dropCoords} />
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
