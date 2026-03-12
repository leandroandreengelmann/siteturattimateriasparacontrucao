'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { ProductService, type Product } from '@/services/product-service'
import { useDebounce } from '@/hooks/use-debounce'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export function HeaderSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const debouncedQuery = useDebounce(query, 300)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery || debouncedQuery.trim().length < 2) {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                const data = await ProductService.searchProducts(debouncedQuery)
                setResults(data)
            } catch (error) {
                console.error("Search error", error)
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchResults()
    }, [debouncedQuery])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [wrapperRef])

    return (
        <div ref={wrapperRef} className="relative w-full max-w-[300px] lg:max-w-[400px]">
            <div className="relative flex items-center">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="O que você procura?"
                    className="w-full h-11 pl-12 pr-4 rounded-full border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/70 text-foreground shadow-sm"
                />
                <div className="absolute left-4 text-muted-foreground">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Search className="w-5 h-5" />}
                </div>
            </div>

            {/* Results Dropdown */}
            {isOpen && query.trim().length >= 2 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="max-h-[400px] overflow-y-auto pt-2 pb-2">
                        {isLoading && results.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                Buscando produtos...
                            </div>
                        ) : results.length > 0 ? (
                            <div className="flex flex-col">
                                <div className="px-4 py-2 bg-muted/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Resultados Populares
                                </div>
                                {results.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/produtos/${product.subcategories?.categories?.slug}/${product.slug}`}
                                        onClick={() => {
                                            setIsOpen(false)
                                            setQuery('')
                                        }}
                                        className="flex items-center gap-4 px-4 py-3 hover:bg-muted/80 transition-colors border-b border-border/50 last:border-0 group"
                                    >
                                        <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shrink-0 border border-border/50 overflow-hidden group-hover:border-primary/30 transition-colors">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <div className="w-8 h-8 bg-muted rounded-sm" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                {product.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {product.is_on_sale && product.sale_price ? (
                                                    <>
                                                        <span className="text-xs text-muted-foreground line-through">
                                                            {formatCurrency(product.price)}
                                                        </span>
                                                        <span className="text-sm font-bold text-emerald-600">
                                                            {formatCurrency(product.sale_price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-bold text-foreground">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                <Link
                                    href={`/produtos?q=${encodeURIComponent(query)}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center p-4 text-sm text-primary font-bold hover:bg-primary/5 transition-colors border-t border-border mt-1"
                                >
                                    Ver todos os resultados
                                </Link>
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Nenhum produto encontrado para "<span className="text-foreground font-medium">{query}</span>"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
