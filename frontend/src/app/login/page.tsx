'use client';

import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="glass-card max-w-sm w-full text-center py-12 px-8">
                <div className="w-20 h-20 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-8 rapido-shadow transform -rotate-6">
                    <LogIn className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl font-black mb-2 rapido-gradient inline-block px-4 py-1 rounded text-black">Rapido</h1>
                <p className="text-gray-400 mb-10">Sign in to book fast and affordable bike rides</p>

                <button
                    onClick={() => signIn('google', { callbackUrl: '/customer' })}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all transform active:scale-95"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                    Continue with Google
                </button>

                <p className="mt-8 text-[10px] text-gray-500 uppercase tracking-widest">
                    By continuing, you agree to our Terms and Privacy Policy
                </p>
            </div>
        </div>
    );
}
