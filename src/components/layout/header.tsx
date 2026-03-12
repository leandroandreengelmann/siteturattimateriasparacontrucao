"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Menu, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import { CATEGORIES_DATA } from "@/config/navigation"
import { CategoryService, CategoryWithSub } from "@/services/category-service"
import { HeaderSearch } from "./header-search"
import { MobileBottomNav } from "./mobile-bottom-nav"

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubCategory {
  title: string
  href: string
  description?: string
}

interface Category {
  title: string
  href?: string
  slug?: string
  subcategories?: SubCategory[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NAV_LINKS_BASE: Category[] = [
  { title: "Início", href: "/" },
  { title: "Categorias" },
  { title: "Promoções", href: "/promocoes" },
  { title: "Sobre Nós", href: "/sobre-nos" },
  { title: "Nossas Lojas", href: "/nossas-lojas" },
]



// ─── Mobile Nav Item ──────────────────────────────────────────────────────────
function MobileNavItem({
  cat,
  displayCategories,
  closeMobileMenu,
}: {
  cat: Category
  displayCategories: Category[]
  closeMobileMenu: () => void
}) {
  if (!cat.subcategories) {
    return (
      <Link
        href={cat.href || "#"}
        onClick={closeMobileMenu}
        className="block py-4 text-lg font-semibold text-foreground transition-colors hover:text-primary active:scale-[0.98]"
      >
        {cat.title}
      </Link>
    )
  }

  return (
    <AccordionItem value={cat.title} className="border-b border-border/20">
      <AccordionTrigger className="py-4 text-lg font-semibold text-foreground hover:text-primary transition-colors data-[state=open]:text-primary group hover:no-underline">
        <span className="text-left">{cat.title}</span>
      </AccordionTrigger>
      <AccordionContent className="pb-4 pt-1">
        {cat.title === "Categorias" ? (
          <Accordion className="space-y-1 pl-4 pr-2">
            {displayCategories.map((group) => (
              <AccordionItem value={group.title} key={group.title} className="border-b-0">
                <AccordionTrigger className="py-2.5 text-base font-medium text-foreground hover:text-primary transition-colors hover:no-underline data-[state=open]:text-primary">
                  <span className="text-left">{group.title}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="flex flex-col space-y-3 pl-4 mt-2 pr-2">
                    {group.subcategories?.map((sub) => (
                      <Link
                        key={sub.title}
                        href={sub.href}
                        onClick={closeMobileMenu}
                        className="text-sm font-normal text-muted-foreground transition-colors hover:text-primary break-words"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col space-y-4 pl-4 mt-2 pr-2">
            {cat.subcategories.map((sub) => (
              <Link
                key={sub.title}
                href={sub.href}
                onClick={closeMobileMenu}
                className="text-base font-medium text-foreground transition-colors hover:text-primary"
              >
                {sub.title}
              </Link>
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

// ─── Main Header Component ────────────────────────────────────────────────────
export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)
  const [activeGroup, setActiveGroup] = React.useState<string>(CATEGORIES_DATA[0]?.title || "")
  const [dbCategories, setDbCategories] = React.useState<CategoryWithSub[]>([])

  // ── Load DB categories ──
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoryService.getAllCategories()
        const activeData = data
          .filter((cat) => cat.is_active !== false)
          .map((cat) => ({
            ...cat,
            subcategories: cat.subcategories?.filter((sub) => sub.is_active !== false),
          }))
        setDbCategories(activeData)
        if (activeData.length > 0 && !activeGroup) {
          setActiveGroup(activeData[0].name)
        }
      } catch (error) {
        console.error("Erro ao carregar categorias dinâmicas:", error)
      }
    }
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Display categories: DB > fallback ──
  const displayCategories: Category[] =
    dbCategories.length > 0
      ? dbCategories.map((cat) => ({
        title: cat.name,
        slug: cat.slug,
        subcategories: cat.subcategories?.map((sub) => ({
          title: sub.name,
          href: `/produtos/${cat.slug}/${sub.slug}`,
        })),
      }))
      : CATEGORIES_DATA

  // ── Nav links (inject live displayCategories into Categorias) ──
  const navLinks: Category[] = NAV_LINKS_BASE.map((link) =>
    link.title === "Categorias"
      ? {
        ...link,
        href: "/produtos",
        subcategories: displayCategories.map((cat) => ({
          title: cat.title,
          href: cat.slug
            ? `/produtos/${cat.slug}`
            : `/produtos/${cat.title
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, "-")}`,
        })),
      }
      : link
  )

  // ── Helpers ──
  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  // ── Scroll detection ──
  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])


  return (
    <>
      {/* ── Top Bar ── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background",
          isScrolled ? "border-b border-border py-2 sm:py-4 shadow-sm" : "py-3 sm:py-6"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-center lg:justify-between relative">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group relative z-[60] lg:-ml-48"
          >
            <div className="relative h-14 w-44 sm:h-16 sm:w-56 md:h-20 md:w-64 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Turatti Materiais para Construção"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Search Bar - Center */}
          <div className="hidden lg:flex flex-1 items-center justify-end px-10 mr-4">
            <HeaderSearch />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((cat) => (
              <div
                key={cat.title}
                className={cn(
                  cat.title === "Categorias" ? "static" : "relative"
                )}
                onMouseEnter={() =>
                  setActiveCategory(cat.subcategories ? cat.title : null)
                }
                onMouseLeave={() => setActiveCategory(null)}
              >
                <Link
                  href={cat.href || "#"}
                  className={cn(
                    "text-sm font-medium transition-colors flex items-center gap-2 py-2 px-4 rounded-[7px]",
                    activeCategory === cat.title
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {cat.title}
                  {cat.subcategories && (
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform duration-300",
                        activeCategory === cat.title && "rotate-180"
                      )}
                    />
                  )}
                </Link>

                {/* Mega Menu – Categorias */}
                <AnimatePresence>
                  {cat.title === "Categorias" &&
                    activeCategory === "Categorias" && (
                      <motion.div
                        initial={{ opacity: 0, y: 2, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 2, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mx-auto w-full max-w-[1240px] mt-[-12px] z-50"
                      >
                        <div className="bg-background rounded-[7px] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex h-[540px]">
                          {/* Left sidebar */}
                          <div className="w-[340px] bg-muted/50 border-r border-border p-6 overflow-y-auto custom-scrollbar">
                            <div className="mb-4 px-2">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                                Departamentos
                              </h3>
                            </div>
                            <div className="space-y-1">
                              {displayCategories.map((group) => (
                                <Button
                                  key={group.title}
                                  variant="ghost"
                                  onMouseEnter={() =>
                                    setActiveGroup(group.title)
                                  }
                                  className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 h-auto justify-start",
                                    activeGroup === group.title
                                      ? "bg-white shadow-sm border border-border text-primary font-semibold"
                                      : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                                  )}
                                >
                                  <span className="text-sm flex-1 text-left">{group.title}</span>
                                  <ChevronRight
                                    className={cn(
                                      "size-4 transition-all ml-2",
                                      activeGroup === group.title
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 -translate-x-2 group-hover:opacity-40"
                                    )}
                                  />
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Right panel */}
                          <div className="flex-1 p-8 overflow-y-auto bg-background relative custom-scrollbar">
                            <div className="mb-8 flex items-center gap-4">
                              <Link
                                href={
                                  (displayCategories as Category[]).find(
                                    (c) => c.title === activeGroup
                                  )?.slug
                                    ? `/produtos/${(
                                      displayCategories as Category[]
                                    ).find(
                                      (c) => c.title === activeGroup
                                    )?.slug
                                    }`
                                    : "#"
                                }
                                className="text-3xl font-bold text-foreground mb-2 hover:text-primary transition-colors"
                              >
                                {activeGroup}
                              </Link>
                              <div className="h-1.5 w-12 bg-primary rounded-[7px] mt-2" />
                            </div>

                            <div className="grid grid-cols-3 gap-y-2 gap-x-6">
                              {(
                                displayCategories.find(
                                  (c) => c.title === activeGroup
                                )?.subcategories || []
                              ).map((sub, idx) => (
                                <motion.div
                                  key={`${activeGroup}-${sub.title}`}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.01 }}
                                >
                                  <Link
                                    href={sub.href}
                                    className="group/link flex items-center py-2 text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    <span className="text-sm font-medium border-b border-transparent group-hover/link:border-primary/30 py-0.5">
                                      {sub.title}
                                    </span>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  {/* Simple dropdown for non-Categorias items */}
                  {cat.title !== "Categorias" &&
                    cat.subcategories &&
                    activeCategory === cat.title && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[560px] bg-background border border-border rounded-[7px] shadow-2xl p-6 overflow-hidden z-50"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              className="group/sub p-3 rounded-[7px] hover:bg-muted transition-colors border border-transparent hover:border-border flex items-center justify-between"
                            >
                              <span className="text-sm font-medium group-hover/sub:text-primary transition-colors line-clamp-1">
                                {sub.title}
                              </span>
                              <ChevronRight className="size-3 opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all text-primary" />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Mobile Top actions (Like search/cart) can go here if needed, but hamburger moved to BottomNav */}
        </div>
      </header>

      {/* ── Mobile Menu Drawer ── */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-[85vw] sm:max-w-sm p-0 bg-background border-r-0 flex flex-col pt-safe z-[60] shadow-2xl overflow-hidden">
          {/* Drawer header */}
          <SheetHeader className="relative flex flex-row items-center justify-center px-5 py-5 border-b border-border/10 shrink-0 text-center bg-muted/5">
            <SheetTitle className="sr-only">Menu principal</SheetTitle>
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center justify-center"
            >
              <div className="relative h-14 w-48 active:scale-95 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Turatti"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={closeMobileMenu} aria-label="Fechar menu" className="absolute right-4 hover:bg-muted/50 rounded-full h-10 w-10 flex items-center justify-center">
              <XIcon className="size-6 text-foreground" />
            </Button>
          </SheetHeader>

          {/* Nav links */}
          <div className="flex-1 w-full overflow-y-auto overscroll-contain">
            <div className="px-5 py-6">
              <Accordion className="w-full flex flex-col">
                {navLinks.map((cat) => (
                  <MobileNavItem
                    key={cat.title}
                    cat={cat}
                    displayCategories={displayCategories}
                    closeMobileMenu={closeMobileMenu}
                  />
                ))}
              </Accordion>
            </div>
          </div>

          {/* Drawer footer */}
          <div className="shrink-0 border-t border-border/10 px-5 py-6 flex flex-col gap-4 bg-muted/5">
            <Link
              href="/produtos"
              onClick={closeMobileMenu}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              <span>Ver Todos os Produtos</span>
              <ChevronRight className="size-4" />
            </Link>
            <div className="flex flex-col gap-0.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest text-center">
              <p>Turatti Materiais para Construção</p>
              <p>Excelência desde 2026</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <MobileBottomNav toggleMenu={() => setMobileMenuOpen(true)} />
    </>
  )
}
