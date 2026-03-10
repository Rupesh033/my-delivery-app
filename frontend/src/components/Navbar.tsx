import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-black italic tracking-tighter text-[#F9C935]">
                    RAPIDO PRO
                </Link>

                <div className="hidden md:flex gap-8 items-center">
                    <Link href="/about" className="text-sm font-bold hover:text-[#F9C935] transition-colors">About Us</Link>
                    <Link href="/safety" className="text-sm font-bold hover:text-[#F9C935] transition-colors">Safety</Link>
                    <Link href="/help" className="text-sm font-bold hover:text-[#F9C935] transition-colors">Help</Link>
                    <Link href="/customer" className="bg-[#F9C935] text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95">
                        Book a Ride
                    </Link>
                </div>

                <button className="md:hidden text-[#F9C935]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </div>
        </nav>
    );
}
