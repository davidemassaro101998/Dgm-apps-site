import React from "react"
import { motion } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { SparklesIcon } from "lucide-react"
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
  expandedId?: string | null
  /** Auto-rotate and infinite-loop the carousel. Turn off when there are few
   *  enough apps to show them all at once, statically. */
  loop?: boolean
}

export const CardCarousel: React.FC<CarouselProps> = ({
  items,
  autoplayDelay = 4500,
  showPagination = true,
  showNavigation = true,
  onItemClick,
  expandedId,
  loop = true,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 52px;
    padding-top: 16px;
    padding-left: 8px;
    padding-right: 8px;
  }

  /* Sized to the icon + label content itself (not the old big-card
     dimensions from before cards became bare icons) -- at the old
     220px width, 3 slides side by side overflowed past a phone's
     viewport, leaving only the centered one actually visible. */
  .swiper-slide {
    width: min(30vw, 132px);
    height: min(38vw, 176px);
    min-height: 150px;
    transition: transform 0.4s ease, opacity 0.4s ease;
  }

  @media (min-width: 640px) {
    .swiper-slide {
      width: 152px;
      height: 196px;
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

  // Ensure at least 6-9 slides for smooth 3D coverflow infinite loop without jumps.
  // Only relevant when looping -- a static, non-looping row must show each app once.
  const displayItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    if (loop && items.length < 6) {
      return [...items, ...items, ...items];
    }
    return items;
  }, [items, loop]);

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
          spaceBetween={10}
          speed={800}
          autoplay={
            loop
              ? {
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          loop={loop}
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
              {/* The icon itself IS the button -- no card chrome around it,
                  same as tapping an app icon on a phone home screen. */}
              <button
                type="button"
                onClick={() => onItemClick?.(item.id)}
                className="group flex h-full w-full flex-col items-center justify-start gap-3 bg-transparent text-center cursor-pointer"
              >
                <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                  {item.id !== expandedId && (
                    <motion.img
                      layoutId={`app-icon-${item.id}`}
                      src={item.imageUrl}
                      alt={item.title}
                      transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      className="h-28 w-28 rounded-[22%] object-cover shadow-[0_16px_36px_-8px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-[1.06] group-active:scale-95 sm:h-32 sm:w-32"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md shadow-md">
                    {item.badge}
                  </span>
                </div>

                <div className="mt-2 max-w-[180px]">
                  <h4 className="font-display text-base font-bold text-white transition-colors group-hover:text-violet-300 sm:text-lg">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400 line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
