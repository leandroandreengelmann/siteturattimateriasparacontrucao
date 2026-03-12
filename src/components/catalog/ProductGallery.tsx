'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface ProductGalleryProps {
    images: string[]
    productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    if (!images || images.length === 0) {
        return (
            <div className="pd-main-img">
                <div className="pd-img-placeholder" />
            </div>
        )
    }

    return (
        <div className="pd-gallery">
            <div className="pd-main-img" style={{ background: 'transparent' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={images[activeIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pd-img-container"
                    >
                        <Image
                            src={images[activeIndex]}
                            alt={productName}
                            fill
                            className="pd-img"
                            style={{ objectFit: 'contain' }}
                            unoptimized
                            priority
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {images.length > 1 && (
                <div className="pd-thumbs custom-scrollbar">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`pd-thumb ${i === activeIndex ? 'pd-thumb-active' : ''}`}
                            onClick={() => setActiveIndex(i)}
                            aria-label={`Ver foto ${i + 1}`}
                        >
                            <div className="pd-thumb-img-container">
                                <Image
                                    src={img}
                                    alt={`Miniatura ${i + 1}`}
                                    fill
                                    className="pd-thumb-img"
                                    style={{ objectFit: 'contain', padding: '4px' }}
                                    unoptimized
                                />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <style jsx>{`
                .pd-gallery {
                    flex: 1;
                    width: 100%;
                }
                .pd-main-img {
                    border-radius: 20px;
                    overflow: hidden;
                    aspect-ratio: 1 / 1;
                    max-width: 480px;
                    width: 100%;
                    border: 1px solid var(--color-border);
                    position: relative;
                }
                .pd-img-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                .pd-img-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #eee, #ddd);
                }
                .pd-thumbs {
                    display: flex;
                    gap: 12px;
                    margin-top: 16px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }
                .pd-thumb {
                    flex: 0 0 72px;
                    width: 72px;
                    height: 72px;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 1px solid var(--color-border);
                    cursor: pointer;
                    background: transparent;
                    transition: all 0.2s;
                    padding: 0;
                    position: relative;
                }
                .pd-thumb-img-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                .pd-thumb:hover {
                    border-color: var(--color-primary);
                }
                .pd-thumb-active {
                    border-color: var(--color-accent);
                }
            `}</style>
        </div>
    )
}
