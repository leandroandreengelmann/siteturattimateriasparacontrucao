'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface CircularCountdownProps {
    targetDate: string;
    className?: string;
}

const CircleUnit = ({ value, maxValue, label, urgency = 'normal' }: { value: number; maxValue: number; label: string; urgency?: 'normal' | 'warning' | 'critical' }) => {
    // Radius of the circle
    const r = 26;
    // Context size
    const cx = 32;
    const cy = 32;
    // Circumference
    const circumference = 2 * Math.PI * r;
    // Offset calculation (0 means full, circumference means empty)
    // We want it to decrease as value decreases.
    const fillPercentage = Math.max(0, Math.min(1, value / maxValue));
    const strokeDashoffset = circumference - (fillPercentage * circumference);

    const trackColor = urgency === 'critical' ? 'text-destructive/20' : urgency === 'warning' ? 'text-amber-500/20' : 'text-primary/15'
    const progressColor = urgency === 'critical' ? 'text-destructive' : urgency === 'warning' ? 'text-amber-500' : 'text-primary'
    const numberColor = urgency === 'critical' ? 'text-destructive' : urgency === 'warning' ? 'text-amber-500' : 'text-foreground'

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-14 h-14 md:w-16 md:h-16">
                <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 64 64">
                    {/* Background Track */}
                    <circle
                        className={trackColor}
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="transparent"
                        r={r}
                        cx={cx}
                        cy={cy}
                    />
                    {/* Progress Track */}
                    <circle
                        className={cn(progressColor, "transition-all duration-1000 ease-linear")}
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={r}
                        cx={cx}
                        cy={cy}
                    />
                </svg>
                {/* Number inside */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn("text-xl md:text-2xl font-black tracking-tight", numberColor)}>
                        {String(value).padStart(2, '0')}
                    </span>
                </div>
            </div>
            {/* Label outside */}
            <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
                {label}
            </span>
        </div>
    );
};

export function CircularCountdown({ targetDate, className }: CircularCountdownProps) {
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

    // Loading skeleton to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className={cn("flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8", className)}>
                <div className="w-40 h-8 bg-muted rounded animate-pulse" />
                <div className="flex items-center gap-4 md:gap-6 animate-pulse">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted" />
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted" />
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted" />
                    <div className="hidden sm:block w-14 h-14 md:w-16 md:h-16 rounded-full bg-muted" />
                </div>
            </div>
        );
    }

    const totalHours = timeLeft.d * 24 + timeLeft.h
    const urgency = totalHours < 1 ? 'critical' : totalHours < 24 ? 'warning' : 'normal'
    const labelColor = urgency === 'critical' ? 'text-destructive' : urgency === 'warning' ? 'text-amber-500' : 'text-primary'

    return (
        <div className={cn(
            "relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8",
            className
        )}>
            {/* Text Label */}
            <span className={cn("text-2xl md:text-4xl font-black uppercase tracking-tight text-center transition-colors duration-500", labelColor)}>
                {urgency === 'critical' ? 'Encerrando!' : urgency === 'warning' ? 'Últimas horas' : 'Termina em'}
            </span>

            {/* The Counters */}
            <div className="flex items-center gap-4 md:gap-6">
                {timeLeft.d > 0 && (
                    <CircleUnit value={timeLeft.d} maxValue={30} label="Dias" urgency={urgency} />
                )}
                <CircleUnit value={timeLeft.h} maxValue={24} label="Hrs" urgency={urgency} />
                <CircleUnit value={timeLeft.m} maxValue={60} label="Min" urgency={urgency} />
                <CircleUnit value={timeLeft.s} maxValue={60} label="Seg" urgency={urgency} />
            </div>
        </div>
    );
}
