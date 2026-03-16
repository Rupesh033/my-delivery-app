'use client';

import { useState, useEffect, useCallback } from 'react';
import { socket } from '@/lib/socket';
import dynamic from 'next/dynamic';

const AdminMap = dynamic(() => import('@/components/AdminMap'), { ssr: false });

export default function AdminPage() {
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('monitoring');
    const [loading, setLoading] = useState(true);
    const [rates, setRates] = useState({ perKm: 12, baseFare: 30 });
    const [sosAlert, setSosAlert] = useState<any>(null);
    const [angelAlert, setAngelAlert] = useState<any>(null);

    const fetchAdminData = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/data`);
            const json = await res.json();
            setData(json);
            if (json.settings) setRates(json.settings);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();

        // @ts-ignore
        socket.io.opts.query = { role: 'admin' };
        socket.connect();
        socket.emit('registerAdmin');

        socket.on('systemUpdate', (updatedData) => {
            console.log('[ADMIN] System Update Received');
            setData(updatedData);
            if (updatedData.settings) setRates(updatedData.settings);
        });

        socket.on('adminSOSAlert', (data) => {
            console.error('[GOD VIEW] EMERGENCY SOS RECEIVED!!', data);
            setSosAlert(data);
            if ("vibrate" in navigator) navigator.vibrate([1000, 200, 1000]);
        });

        socket.on('angelAlert', (data) => {
            console.warn('[GOD VIEW] ANGEL ALERT: Stationary Ride Detected', data);
            setAngelAlert(data);
        });

        return () => {
            socket.off('systemUpdate');
            socket.off('adminSOSAlert');
        };
    }, [fetchAdminData]);

    const handleRiderAction = async (riderId: string, action: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/riders/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ riderId, action })
            });
            fetchAdminData();
        } catch (err) {
            console.error('Action failed:', err);
        }
    };

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rates)
            });
            alert('Settings Updated');
        } catch (err) {
            console.error('Settings update failed:', err);
        }
    };

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#F9C935] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const onlineRiders = data.riders.filter((r: any) => r.isOnline);
    const activeRides = data.rides.filter((r: any) => r.status === 'on_ride' || r.status === 'accepted');

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-[#F9C935]">GOD VIEW HUB</h1>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Platform Governance Dashboard</p>
                </div>

                <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
                    {['monitoring', 'captains', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === tab ? 'bg-[#F9C935] text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {sosAlert && (
                <div className="mb-8 p-6 bg-red-600 rounded-3xl border-4 border-white animate-pulse flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-5xl">🚨</div>
                        <div>
                            <h2 className="text-2xl font-black italic leading-none">EMERGENCY SOS ALERT!</h2>
                            <p className="text-black font-bold uppercase text-xs mt-1">Ride ID: {sosAlert.rideId} • Customer: {sosAlert.userId}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setSosAlert(null)} className="px-6 py-2 bg-black text-white rounded-xl font-bold uppercase text-xs tracking-widest">Dismiss</button>
                        <button className="px-8 py-3 bg-white text-red-600 rounded-xl font-black uppercase text-sm shadow-xl">Contact Authorities</button>
                    </div>
                </div>
            )}

            {angelAlert && (
                <div className="mb-8 p-6 bg-orange-600 rounded-3xl border-4 border-white animate-pulse flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-5xl">👼</div>
                        <div>
                            <h2 className="text-2xl font-black italic leading-none text-white">ANGEL ALERT: STATIONARY RIDE</h2>
                            <p className="text-black font-bold uppercase text-xs mt-1">Ride ID: {angelAlert.rideId} • Stationary for 2+ mins</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setAngelAlert(null)} className="px-6 py-2 bg-black text-white rounded-xl font-bold uppercase text-xs tracking-widest">Dismiss</button>
                        <button className="px-8 py-3 bg-white text-orange-600 rounded-xl font-black uppercase text-sm shadow-xl">Check Status</button>
                    </div>
                </div>
            )}

            {activeTab === 'monitoring' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <KPICard title="Live Commutes" value={activeRides.length} icon="🏍️" subtitle="Active on road" />
                        <KPICard title="Total Captains" value={data.riders.length} icon="👥" subtitle="Registered network" />
                        <KPICard title="Device Sync" value={onlineRiders.length} icon="📡" subtitle="Online now" />
                        <KPICard title="Requests" value={data.rides.filter((r: any) => r.status === 'searching').length} icon="🔔" subtitle="Unfulfilled" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-card overflow-hidden">
                                <h2 className="text-xl font-bold mb-6">Real-Time God View Map</h2>
                                <AdminMap riders={data.riders} rides={data.rides} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="glass-card">
                                <h2 className="text-xl font-bold mb-6 italic">Live Ride Activity</h2>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data.rides.slice().reverse().map((ride: any) => (
                                        <div key={ride.id} className="p-4 bg-[#0a0a0a] border border-white/5 rounded-2xl flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-sm text-[#F9C935]">{ride.id.split('_')[1]}</p>
                                                <p className="text-[10px] text-gray-500 truncate w-32">{ride.pickup} → {ride.drop}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${ride.status === 'on_ride' ? 'bg-green-500/20 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                                                    {ride.status}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-500 uppercase">
                                                    {ride.serviceType === 'parcel' ? '📦 Parcel' : (ride.serviceType === 'assist' ? '🚨 Assist' : '🏍️ Ride')}
                                                    {ride.isPinkMode && ' • 🌸 PINK'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {data.rides.length === 0 && <p className="text-center text-gray-700 py-10 font-bold">No ride history yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'captains' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="glass-card">
                        <h2 className="text-xl font-bold mb-6 italic border-b border-white/5 pb-4">Pending Approvals ⏳</h2>
                        <div className="space-y-4">
                            {data.riders.filter((r: any) => !r.isApproved).map((rider: any) => (
                                <div key={rider.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl">🏍️</div>
                                        <div>
                                            <p className="font-bold">{rider.name}</p>
                                            <p className="text-xs text-gray-500">{rider.vehicle} • ID: {rider.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRiderAction(rider.id, 'reject')} className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">Reject</button>
                                        <button onClick={() => handleRiderAction(rider.id, 'approve')} className="px-4 py-2 text-xs font-black bg-[#F9C935] text-black rounded-xl hover:scale-105 transition-transform">Approve</button>
                                    </div>
                                </div>
                            ))}
                            {data.riders.filter((r: any) => !r.isApproved).length === 0 && (
                                <p className="text-center text-gray-700 py-10 font-bold">All captains are verified. ✅</p>
                            )}
                        </div>
                    </div>

                    <div className="glass-card">
                        <h2 className="text-xl font-bold mb-6 italic border-b border-white/5 pb-4">Active Network 🟢</h2>
                        <div className="space-y-4">
                            {data.riders.filter((r: any) => r.isApproved).map((rider: any) => (
                                <div key={rider.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl flex justify-between items-center">
                                    <div className="flex gap-4 items-center">
                                        <div className={`w-3 h-3 rounded-full ${rider.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`}></div>
                                        <div>
                                            <p className="font-bold">{rider.name}</p>
                                            <p className="text-xs text-gray-500">{rider.isOnline ? 'Active Now' : 'Last seen: MG Road'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRiderAction(rider.id, 'remove')} className="text-[10px] font-bold text-gray-600 hover:text-red-500 uppercase tracking-widest transition-colors">Terminate Access</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto glass-card animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-black mb-8 italic text-[#F9C935]">Platform Economics</h2>
                    <form onSubmit={handleUpdateSettings} className="space-y-8">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-3 tracking-widest">Base Starting Fare (₹)</label>
                            <input
                                type="number"
                                value={rates.baseFare}
                                onChange={e => setRates({ ...rates, baseFare: parseInt(e.target.value) })}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-5 px-8 outline-none focus:border-[#F9C935] transition-colors font-black text-2xl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-3 tracking-widest">Rate Per Kilometer (₹)</label>
                            <input
                                type="number"
                                value={rates.perKm}
                                onChange={e => setRates({ ...rates, perKm: parseInt(e.target.value) })}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-5 px-8 outline-none focus:border-[#F9C935] transition-colors font-black text-2xl"
                            />
                        </div>
                        <button className="w-full bg-[#F9C935] text-black py-6 rounded-2xl font-black text-xl hover:scale-102 transition-transform shadow-xl shadow-[#F9C935]/10 active:scale-98">
                            Save Configuration
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

function KPICard({ title, value, icon, subtitle }: any) {
    return (
        <div className="glass-card border-none bg-gradient-to-br from-[#111] to-black">
            <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{title}</span>
                <span className="text-xl opacity-50">{icon}</span>
            </div>
            <p className="text-4xl font-black text-white">{value}</p>
            <p className="text-[10px] text-gray-600 font-bold uppercase mt-2">{subtitle}</p>
        </div>
    );
}
