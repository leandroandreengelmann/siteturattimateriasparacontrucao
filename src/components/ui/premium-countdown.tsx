'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface PremiumCountdownProps {
    targetDate: string;
    className?: string;
}

const AnimatedNumber = ({ value }: { value: number | string }) => {
    return (
        <div className="relative flex h-14 w-12 md:h-20 md:w-16 items-center justify-center overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent z-10 pointer-events-none" />
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={value}
                    initial={{ y: '50%', opacity: 0, filter: 'blur(4px)', scale: 0.9 }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)', scale: 1 }}
                    exit={{ y: '-50%', opacity: 0, filter: 'blur(4px)', scale: 0.9 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        mass: 1,
                    }}
                    className="absolute text-3xl md:text-5xl font-mono font-black tracking-tighter text-white"
                >
                    {String(value).padStart(2, '0')}
                </motion.span>
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 top-1/2 h-px bg-zinc-950/80 z-20" />
        </div>
    );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-3">
        <AnimatedNumber value={value} />
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            {label}
        </span>
    </div>
);

export function PremiumCountdown({ targetDate, className }: PremiumCountdownProps) {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

    useEffect(() => {
        setMounted(true);
        const target = new Date(targetDate).getTime();

        const calculateTimeLeft = () => {
            const difference = target - new Date().getTime();

            if (difference <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                return;
            }

            setTimeLeft({
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((difference % (1000 * 60)) / 1000),
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!mounted) {
        return (
            <div className={cn("flex flex-col items-center justify-center p-6 gap-6 rounded-3xl bg-zinc-50/50 border border-zinc-200/50", className)}>
                <div className="animate-pulse flex gap-4">
                    <div className="w-16 h-20 bg-zinc-200 rounded-xl" />
                    <div className="w-16 h-20 bg-zinc-200 rounded-xl" />
                    <div className="w-16 h-20 bg-zinc-200 rounded-xl" />
                    <div className="w-16 h-20 bg-zinc-200 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "relative inline-flex flex-col items-center justify-center p-8 md:p-10 rounded-[2rem] bg-white border border-zinc-200/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden group",
            className
        )}>
            {/* Background glowing effects */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
            <div className="absolute inset-0 bg-grid-zinc-900/[0.02] bg-[size:20px_20px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Header Tag */}
            <div className="relative z-10 flex items-center gap-2 mb-8 bg-zinc-100/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200/80">
                <Clock className="size-3.5 text-blue-600 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">
                    Encerra em Confirmação
                </span>
            </div>

            {/* The Counters */}
            <div className="relative z-10 flex items-center gap-2 md:gap-4">
                <TimeUnit value={timeLeft.d} label="Dias" />
                <span className="text-2xl text-zinc-300 font-black pt-4 md:pt-6 mb-8 animate-pulse">:</span>
                <TimeUnit value={timeLeft.h} label="Horas" />
                <span className="text-2xl text-zinc-300 font-black pt-4 md:pt-6 mb-8 animate-pulse">:</span>
                <TimeUnit value={timeLeft.m} label="Minutos" />
                <span className="text-2xl text-zinc-300 font-black pt-4 md:pt-6 mb-8 animate-pulse">:</span>
                <TimeUnit value={timeLeft.s} label="Seg" />
            </div>
        </div>
    );
}
