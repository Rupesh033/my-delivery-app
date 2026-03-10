import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-black text-white pt-20 pb-10 px-6 border-t border-white/5">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="md:col-span-1">
                    <h2 className="text-2xl font-black italic tracking-tighter text-[#F9C935] mb-6">RAPIDO</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        India's leading bike taxi service. Making urban travel affordable, fast, and safe for everyone.
                    </p>
                </div>

                <div>
                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">Customer</h3>
                    <ul className="space-y-4">
                        <li><Link href="/customer" className="text-sm hover:text-[#F9C935] transition-colors">Book a Ride</Link></li>
                        <li><Link href="/safety" className="text-sm hover:text-[#F9C935] transition-colors">Safety First</Link></li>
                        <li><Link href="/help" className="text-sm hover:text-[#F9C935] transition-colors">Support</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">Captain</h3>
                    <ul className="space-y-4">
                        <li><Link href="/rider" className="text-sm hover:text-[#F9C935] transition-colors">Ride with Rapido</Link></li>
                        <li><Link href="#" className="text-sm hover:text-[#F9C935] transition-colors">Captain Benefits</Link></li>
                        <li><Link href="#" className="text-sm hover:text-[#F9C935] transition-colors">Training</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">Corporate</h3>
                    <ul className="space-y-4">
                        <li><Link href="/about" className="text-sm hover:text-[#F9C935] transition-colors">About Us</Link></li>
                        <li><Link href="#" className="text-sm hover:text-[#F9C935] transition-colors">Newsroom</Link></li>
                        <li><Link href="#" className="text-sm hover:text-[#F9C935] transition-colors">Careers</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-10 border-t border-white/10 flex flex-col md:row justify-between items-center gap-6">
                <p className="text-xs text-gray-600">© 2026 Roppen Transportation. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link href="#" className="text-xs text-gray-500 hover:text-white">Privacy Policy</Link>
                    <Link href="#" className="text-xs text-gray-500 hover:text-white">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
