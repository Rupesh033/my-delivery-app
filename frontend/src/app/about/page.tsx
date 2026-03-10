'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Navbar />
            <main className="flex-grow pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter">
                        We are <span className="text-[#F9C935]">Rapido</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-16 leading-relaxed">
                        India's leading bike taxi platform, designed to solve the urban commute problem through technology and a massive network of dedicated Captains.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-center">
                        <div>
                            <p className="text-5xl font-black text-[#F9C935] mb-2">100+</p>
                            <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">Cities Covered</p>
                        </div>
                        <div>
                            <p className="text-5xl font-black text-[#F9C935] mb-2">5L+</p>
                            <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">Active Captains</p>
                        </div>
                        <div>
                            <p className="text-5xl font-black text-[#F9C935] mb-2">10M+</p>
                            <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">Happy Customers</p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-400 space-y-8">
                        <p>
                            Rapido was born out of a simple idea: urban travel in India is congested and expensive. By utilizing the existing pool of two-wheelers, we've created a mobility ecosystem that is faster than a car, cheaper than an auto, and accessible via a single tap.
                        </p>
                        <p>
                            Our mission is to empower millions of bike owners to become entrepreneurs, while providing urban commuters with a reliable, safe, and efficient way to beat the city traffic.
                        </p>
                        <p>
                            Today, Rapido is not just a bike taxi app; we are a multi-modal platform including Auto-rickshaws, Cabs, and Parcel delivery services, serving millions of users across the country.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
