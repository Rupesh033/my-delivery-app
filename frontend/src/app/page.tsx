'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#F9C935]/10 text-[#F9C935] text-xs font-bold uppercase tracking-widest mb-6 border border-[#F9C935]/20">
                India's Largest Bike Taxi Service
              </span>
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
                Easiest way to <span className="text-[#F9C935]">commute</span> with Rapido Pro
              </h1>
              <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
                Rapido is the fastest and most affordable way to travel within your city. Beat the traffic and reach your destination on time, every time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/customer" className="bg-[#F9C935] text-black px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform active:scale-95 text-center">
                  Book a Ride Now
                </Link>
                <Link href="/rider/register" className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-colors text-center">
                  Become a Captain
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F9C935]/20 to-transparent blur-3xl rounded-full opacity-30 transform -translate-y-12"></div>
              <img
                src="/hero.png"
                alt="Rapido Pro Hero"
                className="w-full h-auto rounded-3xl shadow-2xl relative z-10 border border-white/5 grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </section>

        {/* Features / Service Selection */}
        <section className="px-6 py-24 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">Our Services</h2>
              <p className="text-gray-500">Pick the way you want to ride</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Bike Taxi', desc: 'Beat the traffic with the fastest two-wheelers.', icon: '🏍️' },
                { title: 'Auto', desc: 'Safe and comfortable three-wheeler rides.', icon: '🛺' },
                { title: 'Cab', desc: 'Premium four-wheeler rides for your comfort.', icon: '🚗' },
              ].map((service, i) => (
                <div key={i} className="glass-card group hover:border-[#F9C935]/50 transition-colors pointer-events-none">
                  <div className="text-5xl mb-6">{service.icon}</div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-[#F9C935] transition-colors">{service.title}</h3>
                  <p className="text-gray-500 text-sm">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Become a Captain */}
        <section className="px-6 py-24 bg-black border-y border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
              <img
                src="/captain.png"
                alt="Become a Captain"
                className="w-full h-auto rounded-3xl shadow-2xl border border-white/5"
              />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-5xl font-black mb-8 leading-tight italic tracking-tighter">
                Know Your <span className="text-[#F9C935]">Earnings</span> 💰
              </h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Join our family of 5,00,000+ Captains. Ride your own bike and earn up to ₹25,000 per month. Flexible hours, instant payouts, and zero commission for the first month!
              </p>

              <ul className="space-y-6 mb-12">
                {['Zero Commission', 'Instant Payouts', 'Accident Insurance', 'Flexible Working Hours'].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#F9C935]/10 flex items-center justify-center text-[#F9C935]">✓</div>
                    <span className="font-bold text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/rider/register" className="inline-block bg-[#F9C935] text-black px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform active:scale-95">
                Apply to Ride
              </Link>
                Register as a Captain
              </Link>
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section className="px-6 py-24 bg-[#F9C935] text-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black mb-6 italic tracking-tighter">Safety First, Always.</h2>
              <p className="font-bold text-lg mb-8 opacity-80 leading-relaxed">
                We prioritize your safety with our high-standard safety protocols, including mandatory helmets for both captains and customers, live ride tracking, and 24/7 SOS support.
              </p>
              <Link href="/safety" className="inline-block bg-black text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-all">
                Learn More About Safety
              </Link>
            </div>
            <div className="text-9xl opacity-20">🛡️</div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
