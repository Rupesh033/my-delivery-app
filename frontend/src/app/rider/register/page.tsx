'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RiderRegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        vehicle: 'Bike',
        city: 'Garhwa'
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/riders/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('riderId', data.riderId);
                setStep(3);
            }
        } catch (err) {
            console.error('Registration failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-[#F9C935] selection:text-black">
            <nav className="p-6">
                <Link href="/" className="text-2xl font-black italic tracking-tighter text-[#F9C935]">
                    RAPIDO PRO
                </Link>
            </nav>

            <main className="max-w-xl mx-auto px-6 py-20">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="text-[#F9C935] font-black uppercase tracking-[0.3em] text-xs">Join the Fleet</span>
                        <h1 className="text-5xl font-black mt-4 mb-8 leading-tight tracking-tighter">Become a <br/><span className="text-[#F9C935]">Rapido Captain</span></h1>
                        <p className="text-gray-400 text-lg mb-12">Earn up to ₹30,000 per month. Flexible hours. Instant payouts. Be your own boss.</p>
                        
                        <button 
                            onClick={() => setStep(2)}
                            className="w-full bg-[#F9C935] text-black py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl shadow-[#F9C935]/10"
                        >
                            Start Application
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="glass-card animate-in zoom-in-95 duration-500">
                        <h2 className="text-2xl font-black mb-8 italic">Captain Details</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Full Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter your name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 outline-none focus:border-[#F9C935] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Phone Number</label>
                                <input 
                                    required
                                    type="tel" 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    placeholder="+91 00000-00000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 outline-none focus:border-[#F9C935] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Vehicle Type</label>
                                <select 
                                    value={formData.vehicle}
                                    onChange={e => setFormData({...formData, vehicle: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 outline-none focus:border-[#F9C935] transition-colors appearance-none"
                                >
                                    <option className="bg-black">Bike</option>
                                    <option className="bg-black">Auto</option>
                                    <option className="bg-black">Cab</option>
                                </select>
                            </div>

                            <button 
                                disabled={loading}
                                className="w-full bg-[#F9C935] text-black py-5 rounded-xl font-black text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
                            >
                                {loading ? 'Processing...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-20 animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-[#F9C935]/10 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">⏳</div>
                        <h2 className="text-4xl font-black mb-4 tracking-tighter">Application Received!</h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-12">
                            Bhai, aapka application humein mil gaya hai. Hamari team check karke aapko **Admin Panel** se approve karegi. <br/><br/>
                            Tab tak thoda intezaar karein.
                        </p>
                        <button 
                            onClick={() => router.push('/')}
                            className="bg-white/5 border border-white/10 px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
