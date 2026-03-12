import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DynamicHero } from "@/components/sections/DynamicHero"
import { ProductCarousel } from "@/components/products/ProductCarousel"
import { ImageCarousel } from "@/components/sections/ImageCarousel"
import { ColorPaletteSection } from "@/components/sections/ColorPaletteSection"
import { HeroService } from "@/services/hero-service"
import { CarouselService } from "@/services/carousel-service"
import { ImageCarouselService } from "@/services/image-carousel-service"
import { ColorService } from "@/services/color-service"
import { FixedBannerService } from "@/services/fixed-banner-service"
import React from "react"

export default async function Home() {
  const [heroSettings, activeCarousels, activeImageCarousels, colors, colorSettings, bannerSettings] = await Promise.all([
    HeroService.getHeroSettings(),
    CarouselService.getCarousels().then(carousels => carousels.filter(c => c.is_active)),
    ImageCarouselService.getImages(true),
    ColorService.getColors(true),
    ColorService.getSettings(),
    FixedBannerService.getSettings().catch(() => null),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-white">
      <Header />

      <main className="flex-1">
        <DynamicHero
          title={heroSettings.title}
          accentWords={heroSettings.accent_words}
          accentWords2={heroSettings.accent_words_2}
          accentColor1={heroSettings.accent_color_1}
          accentColor2={heroSettings.accent_color_2}
          subtitle={heroSettings.subtitle}
          buttonText={heroSettings.button_text}
          buttonUrl={heroSettings.button_url}
        />

        {activeImageCarousels.length > 0 && (
          <ImageCarousel images={activeImageCarousels} />
        )}

        {colors.length > 0 && (
          <ColorPaletteSection
            colors={colors}
            sectionTitle={colorSettings.section_title}
          />
        )}

        {activeCarousels.map((carousel, index) => (
          <React.Fragment key={carousel.id}>
            <ProductCarousel
              title={carousel.title}
              products={carousel.products}
              viewAllHref={
                carousel.product_type === 'featured' ? '/produtos?filter=featured' :
                  carousel.product_type === 'new' ? '/produtos?filter=new' :
                    carousel.product_type === 'promo_month' ? '/produtos?filter=promo' :
                      '/produtos?filter=last'
              }
              hasTimer={carousel.has_timer}
              timerTargetDate={carousel.timer_target_date}
              hasQuantity={carousel.has_quantity}
              quantityCount={carousel.quantity_count}
            />

            {/* Banner injetado após o 1º carrossel (índice 0) */}
            {index === 0 && bannerSettings?.is_active && bannerSettings?.image_url && (
              <section className="container mx-auto px-6 py-6 md:py-10">
                <a href={bannerSettings.link_url || '#'} className="block w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden bg-muted group relative shadow-sm">
                  <img
                    src={bannerSettings.image_url}
                    alt="Banner Promocional"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                </a>
              </section>
            )}
          </React.Fragment>
        ))}
      </main>

      <Footer />
    </div>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  )
}
