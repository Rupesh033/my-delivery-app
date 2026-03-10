'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from 'react';

export default function HelpPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        { q: 'How do I book a Rapido ride?', a: 'Open the Rapido app, enter your destination, select your ride type (Bike/Auto/Cab), and tap "Book Now". A captain nearby will accept your request.' },
        { q: 'Is it safe to ride a bike taxi?', a: 'Yes! We provide mandatory helmets for both captains and customers, live ride tracking, and every ride is insured.' },
        { q: 'How can I become a Rapido Captain?', a: 'Navigate to the "Captain" section of our app or website, register with your vehicle details and driving license, and start earning after verification.' },
        { q: 'What are the payment options available?', a: 'We support Cash, UPI, Rapido Wallet, and all major Credit/Debit cards for a seamless payment experience.' },
        { q: 'What happened if I leave something in the ride?', a: 'You can contact your Captain directly through the app history, or reach out to our 24/7 support team via the Help section.' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Navbar />
            <main className="flex-grow pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-5xl font-black mb-4">How can we help?</h1>
                    <p className="text-gray-500 mb-12">Search for answers or browse our FAQs below</p>

                    <div className="relative mb-16">
                        <input
                            type="text"
                            placeholder="Search for a topic..."
                            className="w-full bg-[#111] border border-white/10 rounded-2xl py-5 px-8 outline-none focus:border-[#F9C935] transition-colors font-bold"
                        />
                        <div className="absolute right-6 top-5 text-[#F9C935]">🔍</div>
                    </div>

                    <h2 className="text-2xl font-black mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-white/10 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full px-8 py-6 flex justify-between items-center bg-[#0a0a0a] hover:bg-[#111] transition-colors text-left"
                                >
                                    <span className="font-bold">{faq.q}</span>
                                    <span className={`text-[#F9C935] transform transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                {openFaq === i && (
                                    <div className="px-8 py-6 bg-black border-t border-white/5 text-gray-400 leading-relaxed text-sm">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-10 border border-white/10 rounded-3xl text-center">
                        <h3 className="text-xl font-bold mb-4 text-[#F9C935]">Still have questions?</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">If you couldn't find the answer you were looking for, our team is always here to help.</p>
                        <button className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">Contact Support</button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
