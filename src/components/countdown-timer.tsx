import React, { useEffect, useRef, useState } from "react";
import { useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  return (
    <div className={cn("inline-flex flex-col bg-background border border-border rounded-xl p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs font-bold tracking-widest text-muted-foreground">
          Termina em
        </span>
      </div>
      <div className="flex items-center gap-1">
        <CountdownItem unit="Day" label="Dias" targetDate={targetDate} />
        <span className="text-border font-bold -mt-4">:</span>
        <CountdownItem unit="Hour" label="Horas" targetDate={targetDate} />
        <span className="text-border font-bold -mt-4">:</span>
        <CountdownItem unit="Minute" label="Mins" targetDate={targetDate} />
        <span className="text-border font-bold -mt-4">:</span>
        <CountdownItem unit="Second" label="Segs" targetDate={targetDate} />
      </div>
    </div>
  );
}

interface CountdownItemProps {
  unit: "Day" | "Hour" | "Minute" | "Second";
  label: string;
  targetDate: string;
}

function CountdownItem({ unit, label, targetDate }: CountdownItemProps) {
  const { ref, time } = useTimer(unit, targetDate);
  const display = String(time).padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center bg-muted/80 px-3 py-2 rounded-lg min-w-[56px]">
      <div className="relative w-full overflow-hidden text-center h-8 flex items-center justify-center">
        <span
          ref={ref}
          className="block text-2xl font-semibold text-foreground leading-none"
        >
          {display}
        </span>
      </div>
      <span className="text-xs font-bold text-muted-foreground tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}

function useTimer(unit: "Day" | "Hour" | "Minute" | "Second", targetDate: string) {
  const [ref, animate] = useAnimate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    handleCountdown();
    intervalRef.current = setInterval(handleCountdown, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  const handleCountdown = async () => {
    const end = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const distance = end - now;

    let newTime = 0;
    if (distance > 0) {
      switch (unit) {
        case "Day":
          newTime = Math.floor(distance / DAY);
          break;
        case "Hour":
          newTime = Math.floor((distance % DAY) / HOUR);
          break;
        case "Minute":
          newTime = Math.floor((distance % HOUR) / MINUTE);
          break;
        default:
          newTime = Math.floor((distance % MINUTE) / SECOND);
      }
    }

    if (newTime !== timeRef.current) {
      await animate(
        ref.current,
        { y: ["0%", "-50%"], opacity: [1, 0] },
        { duration: 0.3 }
      );

      timeRef.current = newTime;
      setTime(newTime);

      await animate(
        ref.current,
        { y: ["50%", "0%"], opacity: [0, 1] },
        { duration: 0.3 }
      );
    }
  };

  return { ref, time };
}
