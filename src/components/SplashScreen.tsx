import React, { useState, useEffect } from 'react';
import { ShieldCheck, Compass, Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedBus } from './AnimatedBus';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(3);

  useEffect(() => {
    const totalDuration = 3000; // 3 seconds as requested
    const intervalTime = 50;
    const step = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onFinish();
          }, 100);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    const countdownTimer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(countdownTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-slate-950 via-[#0A192F] to-slate-950 text-white overflow-hidden p-6 sm:p-10 select-none animate-in fade-in duration-300">
      
      {/* Background Ambience & Golden Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Bar with Skip Action */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>India's Verified Travel Network</span>
        </div>

        <button
          onClick={onFinish}
          className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center gap-1"
        >
          <span>Skip ({secondsRemaining}s)</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Center Branding & Cruising Bus Animation */}
      <div className="flex flex-col items-center justify-center text-center my-auto z-10 max-w-sm">
        
        {/* Medium-Sized Circle Badge with Animated Bus */}
        <div className="mb-6 relative flex items-center justify-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/95 border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.35)] backdrop-blur-md flex items-center justify-center overflow-hidden relative">
            <div className="scale-95 flex items-center justify-center">
              <AnimatedBus size="md" showRoad={true} />
            </div>
            {/* Soft inner radial sheen */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/10 via-transparent to-amber-400/5 pointer-events-none" />
          </div>
          <div className="w-24 h-2.5 bg-amber-400/30 blur-lg rounded-full absolute -bottom-1.5" />
        </div>

        {/* App Title & Tagline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-white flex items-center justify-center gap-1">
          <span>Apna</span>
          <span className="text-amber-400">Trips</span>
        </h1>

        <div className="flex items-center justify-center gap-2 mt-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-slate-300">
          <span>BOOK</span>
          <span className="text-amber-400 font-bold">•</span>
          <span>TRAVEL</span>
          <span className="text-amber-400 font-bold">•</span>
          <span>EXPLORE</span>
        </div>

        <p className="mt-4 text-xs text-slate-400 max-w-xs leading-relaxed font-normal">
          Volvo Multi-Axle Sleepers • IRCTC Trains • Luxury Resorts • Outstation Cabs
        </p>

        {/* 3-Second Loading Progress Bar */}
        <div className="w-64 mt-8 flex flex-col items-center gap-2">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-75 ease-out rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between w-full text-[11px] text-slate-400 font-mono">
            <span>Initializing Engine...</span>
            <span className="text-amber-400 font-bold">{Math.min(100, Math.round(progress))}%</span>
          </div>
        </div>

      </div>

      {/* Bottom Footer Trust Badge */}
      <div className="z-10 text-[11px] text-slate-500 text-center pb-2 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Live GPS Telemetry & Razorpay Bank-Grade Secure</span>
      </div>

    </div>
  );
};
