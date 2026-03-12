'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { SunvinilColor } from '@/services/color-service'

interface ColorPaletteSectionProps {
    colors: SunvinilColor[]
    sectionTitle?: string
}

function getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.55 ? '#1A1A1A' : '#FFFFFF'
}

// Marquee row component
function MarqueeRow({ colors, reverse = false }: { colors: SunvinilColor[]; reverse?: boolean }) {
    const repeated = [...colors, ...colors, ...colors]
    return (
        <div className="color-marquee-wrapper">
            <div className={`color-marquee-track ${reverse ? 'color-marquee-reverse' : 'color-marquee-forward'}`}>
                {repeated.map((color, i) => {
                    const text = getContrastColor(color.hex_code)
                    return (
                        <div
                            key={`${color.id}-${i}`}
                            className="color-chip"
                            style={{ backgroundColor: color.hex_code, color: text }}
                        >
                            <span className="color-chip-dot" style={{ backgroundColor: text === '#FFFFFF' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)' }} />
                            <span className="color-chip-name">{color.name}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Single color card for the grid
function ColorCard({ color, index, onClick }: { color: SunvinilColor; index: number; onClick: (color: SunvinilColor) => void }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-40px' })
    const text = getContrastColor(color.hex_code)

    return (
        <motion.button
            ref={ref}
            onClick={() => onClick(color)}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: (index % 8) * 0.06, ease: 'easeOut' }}
            whileTap={{ scale: 0.96 }}
            className="color-grid-card group"
            style={{ backgroundColor: color.hex_code }}
            aria-label={`Ver detalhes da cor ${color.name}`}
        >
            <div className="color-card-shine" />
            {/* Nome da cor visível diretamente no card */}
            <span
                className="color-card-name-label"
                style={{ color: text }}
            >
                {color.name}
            </span>
            {color.code && (
                <span className="color-card-code" style={{ color: text, opacity: 0.5 }}>
                    {color.code}
                </span>
            )}
        </motion.button>
    )
}

// Color detail drawer (bottom-sheet on mobile)
function ColorDrawer({ color, onClose }: { color: SunvinilColor | null; onClose: () => void }) {
    const textColor = color ? getContrastColor(color.hex_code) : '#1A1A1A'

    return (
        <AnimatePresence>
            {color && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="color-drawer-backdrop"
                    />
                    <motion.div
                        key="drawer"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="color-drawer"
                    >
                        {/* Solid color preview */}
                        <div className="color-drawer-preview" style={{ backgroundColor: color.hex_code }}>
                            <motion.button
                                onClick={onClose}
                                whileTap={{ scale: 0.9 }}
                                className="color-drawer-close"
                                style={{
                                    backgroundColor: textColor === '#FFFFFF' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)',
                                    color: textColor,
                                }}
                                aria-label="Fechar"
                            >
                                <X size={18} />
                            </motion.button>
                        </div>

                        {/* Info */}
                        <div className="color-drawer-info">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-10 h-10 rounded-xl border border-black/10 flex-shrink-0"
                                    style={{ backgroundColor: color.hex_code }}
                                />
                                <h3 className="color-drawer-title">{color.name}</h3>
                            </div>

                            <div className="color-drawer-tags">
                                {color.code && (
                                    <div className="color-drawer-tag">
                                        <span className="color-drawer-tag-label">CÓDIGO</span>
                                        <span className="color-drawer-tag-value">{color.code}</span>
                                    </div>
                                )}
                            </div>

                            <p className="color-drawer-subtext">
                                Disponível na linha Sunvinil. Consulte produtos disponíveis nessa cor com nossos atendentes.
                            </p>

                            {color.link_url && (
                                <Link
                                    href={color.link_url}
                                    className="color-drawer-cta"
                                    onClick={onClose}
                                >
                                    Ver Produto
                                    <ArrowRight size={16} />
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export function ColorPaletteSection({ colors, sectionTitle = 'Nossa Paleta de Cores' }: ColorPaletteSectionProps) {
    const [selectedColor, setSelectedColor] = useState<SunvinilColor | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)

    if (!colors.length) return null

    const half = Math.ceil(colors.length / 2)
    const row1 = colors.slice(0, half)
    const row2 = colors.slice(half)

    const visibleColors = isExpanded ? colors : colors.slice(0, 6)

    return (
        <>
            <style>{`
                /* ======================== MARQUEE ======================== */
                .color-marquee-wrapper {
                    overflow: hidden;
                    width: 100%;
                }
                .color-marquee-wrapper:hover .color-marquee-track {
                    animation-play-state: paused;
                }
                .color-marquee-track {
                    display: flex;
                    width: max-content;
                    gap: 10px;
                }
                .color-marquee-forward { animation: marquee-left 35s linear infinite; }
                .color-marquee-reverse { animation: marquee-right 40s linear infinite; }
                @keyframes marquee-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                @keyframes marquee-right {
                    0% { transform: translateX(-33.333%); }
                    100% { transform: translateX(0); }
                }
                .color-chip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 18px;
                    border-radius: 9999px;
                    white-space: nowrap;
                    flex-shrink: 0;
                    font-size: 0.78rem;
                    font-weight: 600;
                    letter-spacing: 0.03em;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
                    user-select: none;
                }
                .color-chip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                .color-chip-name { line-height: 1; }

                /* ======================== GRID CARDS ======================== */
                .color-grid-card {
                    position: relative;
                    border-radius: 12px;
                    aspect-ratio: 1 / 1;
                    overflow: hidden;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.04);
                    transition: box-shadow 0.25s ease, transform 0.25s ease;
                    width: 100%;
                }
                .color-grid-card:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.04);
                    transform: translateY(-2px);
                }
                .color-card-shine {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
                    pointer-events: none;
                }
                .color-card-badge {
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    white-space: nowrap;
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    width: calc(100% - 20px);
                    text-align: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .color-card-name-label {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 20px 8px 8px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    text-align: center;
                    line-height: 1.2;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    background: linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%);
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    pointer-events: none;
                }
                .color-grid-card:hover .color-card-name-label { opacity: 1; }
                @media (hover: none) {
                    .color-card-name-label { opacity: 1; }
                }
                .color-card-code {
                    position: absolute;
                    top: 8px;
                    right: 10px;
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                }

                /* ======================== DRAWER ======================== */
                .color-drawer-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 999;
                    backdrop-filter: blur(2px);
                }
                .color-drawer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: white;
                    border-radius: 24px 24px 0 0;
                    overflow: hidden;
                    max-width: 480px;
                    margin: 0 auto;
                    box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
                }
                .color-drawer-preview {
                    position: relative;
                    height: 160px;
                    width: 100%;
                }
                .color-drawer-close {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .color-drawer-info {
                    padding: 20px 24px 32px;
                }
                .color-drawer-title {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #1A1A1A;
                    line-height: 1.2;
                }
                .color-drawer-tags {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-bottom: 14px;
                }
                .color-drawer-tag {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #F5F5F5;
                    border-radius: 10px;
                    padding: 8px 14px;
                }
                .color-drawer-tag-label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #888;
                    letter-spacing: 0.06em;
                }
                .color-drawer-tag-value {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #1A1A1A;
                    font-family: monospace;
                }
                .color-drawer-swatch {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    border: 1px solid rgba(0,0,0,0.1);
                    flex-shrink: 0;
                }
                .color-drawer-subtext {
                    font-size: 0.82rem;
                    color: #888;
                    line-height: 1.5;
                    margin-bottom: 16px;
                }
                .color-drawer-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: #1A1A1A;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 12px;
                    font-size: 0.88rem;
                    font-weight: 700;
                    text-decoration: none;
                    transition: background 0.2s;
                    width: 100%;
                    justify-content: center;
                }
                .color-drawer-cta:hover { background: #333; }

                /* ======================== SECTION ======================== */
                .color-section-eyebrow {
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: var(--primary, #005CA9);
                    margin-bottom: 8px;
                }
                .color-section-title {
                    font-size: clamp(1.8rem, 5vw, 3rem);
                    font-weight: 900;
                    line-height: 1.1;
                    color: #1A1A1A;
                    margin-bottom: 6px;
                }
                .color-section-subtitle {
                    font-size: 0.95rem;
                    color: #888;
                    line-height: 1.5;
                }

                /* ======================== SHOW MORE ======================== */
                .color-grid-container {
                    position: relative;
                    padding: 0 16px 40px;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .color-grid-collapsed {
                    max-height: calc( (100vw - 32px - 16px) / 3 * 2 + 8px ); /* Exactly 2 rows based on width and gap */
                    overflow: hidden;
                    position: relative;
                }
                @media (min-width: 640px) {
                    .color-grid-collapsed {
                        max-height: none;
                        overflow: visible;
                    }
                }
                .color-grid-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 120px;
                    background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 60%, rgba(255,255,255,1) 100%);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding-bottom: 8px;
                    pointer-events: none;
                    backdrop-filter: blur(2px);
                    -webkit-backdrop-filter: blur(2px);
                    z-index: 10;
                }
                @media (min-width: 640px) {
                    .color-grid-overlay {
                        display: none;
                    }
                }
                .color-grid-expand-btn {
                    pointer-events: auto;
                    background: #2b00ff;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 9999px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(43, 0, 255, 0.25);
                    transition: all 0.2s ease;
                }
                .color-grid-expand-btn:hover {
                    filter: brightness(1.1);
                    transform: translateY(-2px);
                }
                .color-grid-expand-btn:active {
                    transform: translateY(0);
                }
            `}</style>

            <section aria-label="Paleta de Cores Sunvinil" style={{ overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', padding: '56px 24px 36px' }}>
                    <h2 className="color-section-title" style={{ color: '#000000' }}>{sectionTitle}</h2>
                </div>

                {/* Marquee rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
                    <MarqueeRow colors={row1} reverse={false} />
                    <MarqueeRow colors={row2} reverse={true} />
                </div>

                {/* Grid */}
                <div className="color-grid-container">
                    <div className={!isExpanded ? "color-grid-collapsed" : ""}>
                        <div className="color-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {/* Mobile uses visibleColors, desktop shows all by CSS logic hiding overlay */}
                            <div className="contents sm:hidden">
                                {visibleColors.map((color, i) => (
                                    <ColorCard
                                        key={color.id}
                                        color={color}
                                        index={i}
                                        onClick={setSelectedColor}
                                    />
                                ))}
                            </div>
                            <div className="hidden sm:contents">
                                {colors.map((color, i) => (
                                    <ColorCard
                                        key={color.id}
                                        color={color}
                                        index={i}
                                        onClick={setSelectedColor}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {!isExpanded && colors.length > 6 && (
                        <div className="color-grid-overlay sm:hidden">
                            <button
                                className="color-grid-expand-btn"
                                onClick={() => setIsExpanded(true)}
                                aria-expanded={isExpanded}
                                aria-label="Ver todas as cores"
                            >
                                Ver Todas as Cores
                            </button>
                        </div>
                    )}
                </div>

                <style>{`
                    @media (min-width: 640px) { .color-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 10px !important; } }
                    @media (min-width: 1024px) { .color-grid { grid-template-columns: repeat(8, 1fr) !important; gap: 12px !important; } }
                `}</style>
            </section>

            <ColorDrawer color={selectedColor} onClose={() => setSelectedColor(null)} />
        </>
    )
}
