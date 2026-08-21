import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export interface BentoAppItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  accentFrom: string;
  accentTo: string;
}

interface AppBentoGridProps {
  items: BentoAppItem[];
  onItemClick?: (id: string) => void;
  comingSoonLabel: string;
}

const ROTATIONS = ["-rotate-1", "rotate-1", "-rotate-1", "rotate-2"];

export function AppBentoGrid({ items, onItemClick, comingSoonLabel }: AppBentoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item, i) => (
        <motion.button
          key={item.id}
          type="button"
          onClick={() => onItemClick?.(item.id)}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.03, rotate: 0 }}
          whileTap={{ scale: 0.97 }}
          className={`group relative flex h-[220px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[28px] border bg-white/[0.03] p-6 text-center transition-all duration-200 sm:h-[260px] ${ROTATIONS[i % ROTATIONS.length]}`}
          style={{ borderColor: `${item.accentFrom}40` }}
        >
          {/* Brand-colour glow, unique per app */}
          <div
            className="pointer-events-none absolute -inset-6 opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-70"
            style={{ background: `radial-gradient(circle at 50% 25%, ${item.accentFrom}, transparent 65%)` }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ background: item.accentFrom }}
          />

          <span
            className="absolute right-3.5 top-3.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-md"
          >
            {item.badge}
          </span>

          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="relative h-20 w-20 rounded-[22%] object-cover shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-[1.08] sm:h-24 sm:w-24"
          />

          <div className="relative">
            <h3 className="font-display text-lg font-bold text-white sm:text-xl">{item.title}</h3>
            <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-zinc-400 sm:text-sm">
              {item.subtitle}
            </p>
          </div>
        </motion.button>
      ))}

      {/* Teaser tile: keeps the grid from feeling like a closed set of 3. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: items.length * 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-[220px] rotate-1 flex-col items-center justify-center gap-2 rounded-[28px] border border-dashed border-white/15 bg-transparent p-6 text-center sm:h-[260px]"
      >
        <Sparkles className="h-5 w-5 text-white/30" />
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40 sm:text-sm">
          {comingSoonLabel}
        </p>
      </motion.div>
    </div>
  );
}
