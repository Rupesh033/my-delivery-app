'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SafetyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Navbar />
            <main className="flex-grow pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter rapido-gradient text-black inline-block px-4 py-1 rounded">
                        Safety First
                    </h1>
                    <p className="text-xl text-gray-400 mb-16 leading-relaxed">
                        At Rapido, your safety is our top priority. We've built multiple layers of protection to ensure every ride is secure.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                        {[
                            { title: 'Mandatory Helmets', desc: 'Double helmets on every ride for both the Captain and the Customer.', icon: '⛑️' },
                            { title: 'Live Tracking', desc: 'Share your live ride status with friends and family in real-time.', icon: '📍' },
                            { title: 'Verified Captains', desc: 'Every Captain goes through a rigorous background and driving check.', icon: '👮' },
                            { title: 'CSR Insurance', desc: 'Every ride is covered by insurance for unexpected incidents.', icon: '🏥' },
                            { title: '24/7 SOS', desc: 'A dedicated emergency button in the app that alerts our safety team instantly.', icon: '🚨' },
                            { title: 'Ride Check', desc: 'AI-monitored rides that alert us if the bike takes an unusual stop.', icon: '🤖' },
                        ].map((feature, i) => (
                            <div key={i} className="glass-card">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#F9C935] p-10 rounded-3xl text-black">
                        <h2 className="text-3xl font-black mb-4">Need Help During a Ride?</h2>
                        <p className="font-bold mb-6 opacity-80">Our Safety Response Team is available 24/7 to assist you in any emergency.</p>
                        <button className="bg-black text-white px-8 py-3 rounded-xl font-bold">Call Emergency Support</button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
