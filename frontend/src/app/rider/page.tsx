'use client';

import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function RiderPage() {
    const [online, setOnline] = useState(false);
    const [activeRide, setActiveRide] = useState<any>(null);
    const [isAccepted, setIsAccepted] = useState(false);
    const [otp, setOtp] = useState('');
    const [onRide, setOnRide] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        socket.connect();

        socket.on('newRideRequest', (ride: any) => {
            if (online) {
                setActiveRide(ride);
                setIsAccepted(false);
                setOnRide(false);
                setOtp('');
                setError('');
            }
        });

        socket.on('rideStarted', () => {
            setOnRide(true);
        });

        socket.on('otpError', (data) => {
            setError(data.message);
        });

        // Broadcast location every 5s if online
        const interval = setInterval(() => {
            if (online) {
                const lat = 25.5941 + (Math.random() - 0.5) * 0.02;
                const lng = 85.1376 + (Math.random() - 0.5) * 0.02;
                socket.emit('updateLocation', {
                    riderId: 'R1',
                    lat,
                    lng
                });
            }
        }, 5000);

        return () => {
            socket.disconnect();
            clearInterval(interval);
        };
    }, [online]);

    const handleAccept = () => {
        socket.emit('acceptRide', { rideId: activeRide.id, riderId: 'R1' });
        setIsAccepted(true);
    };

    const handleVerifyOtp = () => {
        socket.emit('verifyOTP', { rideId: activeRide.id, otp });
    };

    const simulateNewRide = () => {
        setActiveRide({
            id: 'RIDE_123',
            pickup: 'MG Road Metro Station',
            drop: 'Indiranagar 100ft Rd',
            fare: 85,
            customer: 'Rahul'
        });
        setIsAccepted(false);
    };

    return (
        <div className="min-h-screen bg-black p-6 max-w-md mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black">RIDER HUB</h1>
                    <p className="text-gray-500 text-sm">Welcome back, Rupesh</p>
                </div>
                <button
                    onClick={() => setOnline(!online)}
                    className={`px-4 py-2 rounded-full font-bold transition-colors ${online ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                >
                    {online ? 'ONLINE' : 'OFFLINE'}
                </button>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass-card p-4">
                    <p className="text-gray-500 text-xs">Today's Earnings</p>
                    <p className="text-2xl font-bold">₹1,240</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-gray-500 text-xs">Total Rides</p>
                    <p className="text-2xl font-bold">12</p>
                </div>
            </div>

            {!activeRide ? (
                <div className="glass-card text-center py-12">
                    {!online ? (
                        <p className="text-gray-500">Go online to start receiving ride requests</p>
                    ) : (
                        <>
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="w-12 h-12 bg-[var(--primary)] rounded-full mb-4 opacity-50"></div>
                                <p className="font-bold">Waiting for requests...</p>
                                <button onClick={simulateNewRide} className="mt-4 text-[var(--primary)] text-xs underline">Simulate Ride Request</button>
                            </div>
                        </>
                    )}
                </div>
            ) : isAccepted ? (
                <div className="glass-card text-center py-12 border-2 border-green-500">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">✅</div>
                    <h2 className="text-xl font-bold">Ride Accepted</h2>
                    <p className="text-gray-400 mt-2 mb-6">Pick up: {activeRide.pickup}</p>

                    {!onRide ? (
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Enter Customer OTP</p>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full bg-[#222] text-center text-2xl tracking-widest font-bold py-3 rounded-xl mb-2 focus:ring-2 ring-[var(--primary)] outline-none"
                                placeholder="----"
                                maxLength={4}
                            />
                            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
                            <button onClick={handleVerifyOtp} className="w-full btn-primary py-3">Start Ride</button>

                            <div className="h-48 mt-6 bg-[#222] rounded-xl overflow-hidden border border-gray-700">
                                <MapComponent pickupPos={[25.5941, 85.1376]} />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <p className="text-blue-400 font-bold mb-4 text-sm">Ride in Progress...</p>
                            <div className="h-48 mb-6 bg-[#222] rounded-xl overflow-hidden border border-gray-700">
                                <MapComponent dropPos={[25.6126, 85.1581]} />
                            </div>
                            <button onClick={() => { setActiveRide(null); setIsAccepted(false); setOnRide(false); }} className="w-full bg-gray-800 py-3 rounded-xl font-bold">Complete Ride</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-card border-2 border-[var(--primary)] animate-in fade-in zoom-in">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-[var(--primary)] text-black text-[10px] font-black px-2 py-0.5 rounded">NEW REQUEST</span>
                        <span className="text-xl font-bold text-green-400">₹{activeRide.fare}</span>
                    </div>
                    <div className="space-y-4 mb-6">
                        <div className="flex gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <div>
                                <p className="text-xs text-gray-500">PICKUP</p>
                                <p className="text-sm font-bold">{activeRide.pickup}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <div>
                                <p className="text-xs text-gray-500">DROP</p>
                                <p className="text-sm font-bold">{activeRide.drop}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setActiveRide(null)} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl">Reject</button>
                        <button onClick={handleAccept} className="flex-1 btn-primary py-3">Accept</button>
                    </div>
                </div>
            )}

            <footer className="mt-12 opacity-50 text-center">
                <p className="text-[10px]">RAPIDO PARTNER APP v1.0</p>
            </footer>
        </div>
    );
}
