import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { SparklesIcon, ExternalLink } from "lucide-react"
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

import { Badge } from "@/components/ui/badge"

export interface CarouselAppItem {
  id: string
  title: string
  subtitle: string
  badge: string
  imageUrl: string
  href?: string
}

interface CarouselProps {
  items: CarouselAppItem[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
  onItemClick?: (id: string) => void
}

export const CardCarousel: React.FC<CarouselProps> = ({
  items,
  autoplayDelay = 4500,
  showPagination = true,
  showNavigation = true,
  onItemClick,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 52px;
    padding-top: 16px;
    padding-left: 8px;
    padding-right: 8px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: min(78vw, 300px);
    height: min(108vw, 410px);
    min-height: 310px;
    border-radius: 20px;
    transition: transform 0.4s ease, opacity 0.4s ease;
  }

  @media (min-width: 640px) {
    .swiper-slide {
      width: 310px;
      height: 410px;
    }
  }
  
  .swiper-3d .swiper-slide-shadow-left,
  .swiper-3d .swiper-slide-shadow-right {
    background-image: none !important;
    background: none !important;
  }

  .swiper-pagination-bullet {
    background: rgba(255, 255, 255, 0.3) !important;
    opacity: 0.7 !important;
  }
  .swiper-pagination-bullet-active {
    background: #a78bfa !important;
    opacity: 1 !important;
    width: 22px !important;
    border-radius: 8px !important;
  }
  .swiper-button-next, .swiper-button-prev {
    color: #a78bfa !important;
  }
  @media (max-width: 640px) {
    .swiper-button-next, .swiper-button-prev {
      display: none !important;
    }
  }
  `

  // Ensure at least 6-9 slides for smooth 3D coverflow infinite loop without jumps
  const displayItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    if (items.length < 6) {
      return [...items, ...items, ...items];
    }
    return items;
  }, [items]);

  return (
    <div className="w-full relative px-2 sm:px-4">
      <style>{css}</style>
      
      {/* Header Badge */}
      <div className="flex flex-col items-center mb-4 text-center">
        <Badge
          variant="outline"
          className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 backdrop-blur-md"
        >
          <SparklesIcon className="mr-1.5 h-3.5 w-3.5 fill-violet-300 text-violet-300" />
          Catalogo Soluzioni DGM
        </Badge>
      </div>

      {/* Swiper Carousel without outer container box */}
      <div className="w-full flex items-center justify-center">
        <Swiper
          initialSlide={0}
          spaceBetween={16}
          speed={800}
          autoplay={{
            delay: autoplayDelay,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: false,
          }}
          pagination={
            showPagination
              ? {
                  clickable: true,
                }
              : false
          }
          navigation={
            showNavigation
              ? {
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }
              : false
          }
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        >
          {displayItems.map((item, index) => (
            <SwiperSlide key={`${item.id}-${index}`}>
              <div
                onClick={() => onItemClick?.(item.id)}
                className="group relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-2xl transition-all duration-300 hover:border-violet-400/50 hover:scale-[1.02]"
              >
                {/* Background Image */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                {/* Top Badge */}
                <div className="absolute right-3 top-3 z-10">
                  <span className="rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-md">
                    {item.badge}
                  </span>
                </div>

                {/* Bottom Info */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg font-bold text-white group-hover:text-violet-300 transition-colors sm:text-xl">
                      {item.title}
                    </h4>
                    <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300 line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
