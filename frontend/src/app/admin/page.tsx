'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
    const [stats, setStats] = useState({
        activeRides: 5,
        onlineRiders: 12,
        totalEarnings: 45000,
        newRequests: 2
    });

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-800">
                <div>
                    <h1 className="text-4xl font-black rapido-gradient text-black inline-block px-4 py-1 rounded">ADMIN PANEL</h1>
                    <p className="text-gray-500 mt-2">Platform Monitoring & Analytics</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-gray-800 px-4 py-2 rounded-lg text-sm font-bold">Download Reports</button>
                    <button className="btn-primary text-sm px-4">System Settings</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard title="Active Rides" value={stats.activeRides} icon="🚕" trend="+20%" />
                <StatCard title="Online Riders" value={stats.onlineRiders} icon="🏍️" trend="Stable" />
                <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toLocaleString()}`} icon="💰" trend="+12%" />
                <StatCard title="New Requests" value={stats.newRequests} icon="🔔" trend="Immediate Action" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-6">Recent Live Rides</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center p-4 bg-[#222] rounded-xl border border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">👤</div>
                                    <div>
                                        <p className="font-bold">Ride #R294{i}</p>
                                        <p className="text-xs text-gray-500">MG Road → Koramangala</p>
                                    </div>
                                </div>
                                <span className="text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1 rounded-full uppercase">Ongoing</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-6">Rider Verification Queue</h2>
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="flex justify-between items-center p-4 bg-[#222] rounded-xl border border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[var(--primary)] text-black rounded-full flex items-center justify-center font-bold">R</div>
                                    <div>
                                        <p className="font-bold">New Rider Registration</p>
                                        <p className="text-xs text-gray-500">Karnataka DL • RC Verified</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-xs bg-red-500/20 text-red-500 px-3 py-1 rounded-lg">Reject</button>
                                    <button className="text-xs bg-green-500 text-black font-bold px-3 py-1 rounded-lg">Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend }: any) {
    return (
        <div className="glass-card">
            <div className="flex justify-between items-start mb-4">
                <span className="text-2xl">{icon}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${trend.includes('+') ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-400'}`}>
                    {trend}
                </span>
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-black mt-1">{value}</p>
        </div>
    );
}
