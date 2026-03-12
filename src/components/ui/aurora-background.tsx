"use client"

import { cn } from "@/lib/utils"
import React, { ReactNode } from "react"

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
    children: ReactNode
    showRadialGradient?: boolean
}

export const AuroraBackground = ({
    className,
    children,
    showRadialGradient = true,
    ...props
}: AuroraBackgroundProps) => {
    return (
        <div
            className={cn(
                "relative flex flex-col h-full items-center justify-center bg-slate-50 text-slate-950 transition-bg",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className={cn(
                        `
            [--white-gradient:linear-gradient(to_bottom,white,transparent)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-500)_15%,var(--blue-400)_20%,var(--violet-400)_25%,var(--blue-600)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            [background-size:200%,_100%]
            [background-position:50%_0%,50%_0%]
            filter blur-[100px] invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-80`,
                        showRadialGradient &&
                        `[mask-image:radial-gradient(ellipse_at_100%_0%,black_20%,transparent_80%)]`
                    )}
                ></div>
            </div>
            {children}
        </div>
    )
}
