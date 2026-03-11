'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RiderLoginPage() {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/riders/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('riderId', data.riderId);
                router.push('/rider');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Server down. Please try again later.');
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

            <main className="max-w-md mx-auto px-6 py-20">
                <div className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="text-[#F9C935] font-black uppercase tracking-[0.3em] text-xs">Captain Login</span>
                    <h1 className="text-4xl font-black mt-4 mb-8 leading-tight tracking-tighter">Welcome Back, <br/><span className="text-[#F9C935]">Partner</span></h1>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">Phone Number</label>
                            <input 
                                required
                                type="tel" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+91 XXXX-XXXXX"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 outline-none focus:border-[#F9C935] transition-colors text-xl font-bold"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm font-bold bg-red-500/10 p-4 rounded-xl">{error}</p>}

                        <button 
                            disabled={loading}
                            className="w-full bg-[#F9C935] text-black py-5 rounded-xl font-black text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
                        >
                            {loading ? 'Authenticating...' : 'Login to Dashboard'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500 text-sm">
                        New here? <Link href="/rider/register" className="text-[#F9C935] font-bold hover:underline">Apply to be a Captain</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
