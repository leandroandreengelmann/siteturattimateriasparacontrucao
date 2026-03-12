"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Phone, Clock, MessageSquare } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SettingsService, SiteSettings } from "@/services/settings-service"
import { useEffect, useState } from "react"

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await SettingsService.getSettings()
        setSettings(data)
      } catch (error) {
        console.error("Error loading footer settings:", error)
      }
    }
    fetchSettings()
  }, [])

  return (
    <footer className="relative bg-primary border-t border-white/20 pt-20 pb-10 overflow-hidden text-primary-foreground">
      {/* Decorative Glow Elements - Optimized for Blue Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 border-b border-white/5 pb-16">
          {/* Logo & About Section */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link href="/" className="inline-block group">
              <div className="relative h-20 w-64 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/logo-white.png"
                  alt="Turatti Materiais para Construção"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <p className="text-primary-foreground text-base max-w-sm leading-relaxed font-medium">
              Elevando o conceito de construção com sofisticação e curadoria técnica.
              Sua visão, nossa excelência em cada detalhe.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-8">
            <h3 className="text-xs font-bold tracking-[0.2em] text-primary-foreground uppercase opacity-60">
              Navegação
            </h3>
            <ul className="space-y-4">
              {[
                { label: "Início", href: "/" },
                { label: "Categorias", href: "/produtos" },
                { label: "Promoções", href: "/promocoes" },
                { label: "Sobre Nós", href: "/sobre-nos" },
                { label: "Nossas Lojas", href: "/nossas-lojas" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-all hover:pl-1 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/0 group-hover:bg-white transition-all transform scale-0 group-hover:scale-100" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social Section */}
          <div className="space-y-10">
            {/* Social Presence */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold tracking-[0.2em] text-primary-foreground uppercase opacity-60">
                Redes Sociais
              </h3>
              <div className="flex gap-4">
                <Link
                  href={settings?.instagram_url || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full bg-white/5 border-white/10 text-primary-foreground hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300")}
                >
                  <Instagram className="size-5" />
                </Link>
                <Link
                  href={settings?.facebook_url || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full bg-white/5 border-white/10 text-primary-foreground hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300")}
                >
                  <Facebook className="size-5" />
                </Link>
              </div>
            </div>

            {/* Contact Info - Dynamic */}
            <div className="space-y-6 animate-in fade-in duration-1000">
              <h3 className="text-xs font-bold tracking-[0.2em] text-primary-foreground uppercase opacity-60">
                Atendimento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {settings?.store_contacts.map((store, idx) => (
                  <div key={idx} className="space-y-5 group">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold tracking-widest text-white/60">{store.name}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                          <Phone className="size-4 text-white/70" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-white">{store.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-1">
                      {store.weekday_hours && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mt-0.5">
                            <Clock className="size-4 text-white/70" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold tracking-wider text-white/60">Segunda a sexta</p>
                            <p className="text-sm font-medium opacity-100 text-white">{store.weekday_hours}</p>
                          </div>
                        </div>
                      )}
                      {store.saturday_hours && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mt-0.5">
                            <Clock className="size-4 text-white/70" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold tracking-wider text-white/60">Sábado</p>
                            <p className="text-sm font-medium opacity-100 text-white">{store.saturday_hours}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-primary-foreground/40 text-[10px] font-bold tracking-[0.3em] uppercase">
            Turatti todos os direitos reservados © {new Date().getFullYear()}
          </p>
          <div className="flex gap-8">
          </div>
        </div>
      </div>
    </footer>
  )
}

