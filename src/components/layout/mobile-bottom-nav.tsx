import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid, MapPin, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileBottomNav({
    toggleMenu
}: {
    toggleMenu: () => void
}) {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[40] flex h-[60px] pb-[env(safe-area-inset-bottom)] items-center justify-around bg-background/80 backdrop-blur-md border-t border-border/60 lg:hidden shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]">
            <Link
                href="/"
                className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                    pathname === "/" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Home className="size-5" />
                <span className="text-[10px] font-semibold tracking-wider">Início</span>
            </Link>

            <Link
                href="/produtos"
                className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                    pathname?.startsWith("/produtos") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Grid className="size-5" />
                <span className="text-[10px] font-semibold tracking-wider">Produtos</span>
            </Link>

            <Link
                href="/nossas-lojas"
                className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                    pathname === "/nossas-lojas" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <MapPin className="size-5" />
                <span className="text-[10px] font-semibold tracking-wider">Lojas</span>
            </Link>

            <button
                onClick={toggleMenu}
                className="flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground hover:text-foreground transition-colors active:scale-95"
            >
                <Menu className="size-5" />
                <span className="text-[10px] font-semibold tracking-wider">Menu</span>
            </button>
        </div>
    )
}
