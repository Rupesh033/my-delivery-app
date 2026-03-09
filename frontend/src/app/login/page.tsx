'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = () => {
        if (phone.length < 10) return alert("Please enter a valid phone number");
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
        }, 1500);
    };

    const handleVerifyOtp = () => {
        if (otp.length < 4) return alert("Enter 4-digit code");
        setIsLoading(true);
        // Simulate Verification
        setTimeout(() => {
            window.location.href = "/customer";
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="glass-card max-w-sm w-full text-center py-12 px-8">
                <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-6 rapido-shadow transform -rotate-6">
                    <LogIn className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-3xl font-black mb-1 rapido-gradient inline-block px-4 py-1 rounded text-black">Rapido</h1>
                <p className="text-gray-400 mb-8 text-sm text-balance">Sign in to book fast and affordable bike rides</p>

                {step === 1 ? (
                    <div className="space-y-4">
                        <div className="text-left font-bold text-xs uppercase text-gray-500 mb-1 ml-1">Mobile Number</div>
                        <div className="flex bg-[#1a1a1a] rounded-xl border border-gray-800 p-1 focus-within:ring-2 ring-[var(--primary)] transition-all">
                            <span className="flex items-center px-4 text-gray-400 font-bold border-r border-gray-800 my-2">+91</span>
                            <input
                                type="tel"
                                placeholder="88888 88888"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                className="w-full bg-transparent p-3 outline-none font-bold text-white"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleSendOtp}
                            disabled={isLoading || phone.length < 10}
                            className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Get OTP"
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-left font-bold text-xs uppercase text-gray-500 mb-1 ml-1">Verify OTP</div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="----"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-center text-3xl tracking-[1rem] font-black focus:ring-2 ring-[var(--primary)] outline-none text-white transition-all"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleVerifyOtp}
                            disabled={isLoading || otp.length < 4}
                            className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Verify & Login"
                            )}
                        </button>
                        <button
                            onClick={() => { setStep(1); setOtp(""); }}
                            className="text-xs text-[var(--primary)] font-bold uppercase tracking-widest mt-4 hover:underline block mx-auto"
                        >
                            Resend to {phone}
                        </button>
                    </div>
                )}

                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                        <span className="bg-black px-4 text-gray-500">Or Social Login</span>
                    </div>
                </div>

                <button
                    onClick={() => signIn('google', { callbackUrl: '/customer' })}
                    className="w-full bg-[#1a1a1a] border border-gray-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all transform active:scale-95 group"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
                    Connect with Google
                </button>

                <p className="mt-8 text-[9px] text-gray-600 uppercase tracking-widest leading-relaxed">
                    Secure and fast login powered by <br /> <span className="text-gray-500 font-bold">Rapido Security Cloud</span>
                </p>
            </div>
        </div>
    );
}
