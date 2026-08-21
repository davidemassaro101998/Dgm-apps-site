import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

export interface SolutionCard {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
}

interface SolutionsCarouselProps {
  items: SolutionCard[];
  onOpen: (id: string) => void;
  className?: string;
}

export function SolutionsCarousel({ items, onOpen, className }: SolutionsCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ startX: number; scrollLeft: number; dragging: boolean; moved: boolean; pointerId: number } | null>(null);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;
    dragState.current = { startX: e.clientX, scrollLeft: track.scrollLeft, dragging: true, moved: false, pointerId: e.pointerId };
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const state = dragState.current;
    const track = trackRef.current;
    if (!state?.dragging || !track) return;
    const delta = e.clientX - state.startX;
    if (!state.moved && Math.abs(delta) > 4) {
      state.moved = true;
      track.setPointerCapture(state.pointerId);
    }
    if (state.moved) {
      track.scrollLeft = state.scrollLeft - delta;
    }
  }

  function handlePointerUp() {
    if (dragState.current) dragState.current.dragging = false;
  }

  function handleCardClick(id: string) {
    if (dragState.current?.moved) {
      dragState.current.moved = false;
      return;
    }
    onOpen(id);
  }

  return (
    <div
      ref={trackRef}
      role="list"
      aria-label="Catalogo soluzioni"
      className={cn(
        "flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 pt-2",
        "cursor-grab active:cursor-grabbing",
        className
      )}
      style={{ scrollbarWidth: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="listitem"
          className="relative w-[78vw] max-w-[280px] shrink-0 snap-center first:ml-[11vw] last:mr-[11vw] sm:w-[300px] sm:first:ml-0 sm:last:mr-0"
        >
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[1.75rem] bg-black/50" />
          <button
            type="button"
            onClick={() => handleCardClick(item.id)}
            className="relative block aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] border border-white/10 text-left shadow-[0_25px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_35px_65px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.16)]"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/15 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-background/80 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur">
              {item.badge}
            </span>
            <div className="pointer-events-none absolute bottom-0 left-0 w-full p-4 text-white">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-white/80">{item.subtitle}</p>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}