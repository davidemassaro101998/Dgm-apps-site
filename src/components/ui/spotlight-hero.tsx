import { lazy, Suspense, Component, type ReactNode, type Ref } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightHeroProps {
  tagline: string;
  title: string;
  description: string;
  ctaText: string;
  onCtaClick?: () => void;
  secondaryCtaText: string;
  onSecondaryCtaClick?: () => void;
  className?: string;
  sectionRef: Ref<HTMLElement>;
  progress: MotionValue<number>;
}

const FADE = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
};

const VolumetricRoomBackground = lazy(() =>
  import("./volumetric-room").then((m) => ({ default: m.VolumetricRoom }))
);

class RoomErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function SpotlightHero({ tagline, title, description, ctaText, onCtaClick, secondaryCtaText, onSecondaryCtaClick, className, sectionRef, progress }: SpotlightHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const roomScale = useTransform(progress, [0, 1], [1, 1.08]);
  const roomY = useTransform(progress, [0, 1], ["0%", "-5%"]);
  const roomOpacity = useTransform(progress, [0, 0.7, 1], [1, 0.6, 0]);

  return (
    <section
      ref={sectionRef}
      className={cn("relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 text-center", className)}
    >
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        style={prefersReducedMotion ? undefined : { scale: roomScale, y: roomY, opacity: roomOpacity }}
      >
        <RoomErrorBoundary>
          <Suspense fallback={null}>
            <VolumetricRoomBackground className="h-full w-full" />
          </Suspense>
        </RoomErrorBoundary>
      </motion.div>

      <div className="relative z-10 flex translate-y-10 flex-col items-center px-4 sm:translate-y-16 md:translate-y-20">
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={FADE}
          className="mb-5 inline-block rounded-full border border-violet-400/30 bg-zinc-900/90 px-4 py-1.5 text-xs font-semibold tracking-wide text-zinc-200 shadow-md backdrop-blur-md sm:mb-6 sm:text-sm"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="font-display text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-7xl md:text-8xl"
          style={{ textShadow: "0 0 30px rgba(255,255,255,0.25), 0 4px 20px rgba(0,0,0,0.9)" }}
        >
          {title.split(" ").map((word, i) => (
            <motion.span key={i} variants={FADE} className="inline-block">
              {word}&nbsp;
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={FADE}
          transition={{ delay: 0.4 }}
          className="mt-6 max-w-md text-sm font-medium leading-relaxed text-zinc-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:mt-8 sm:max-w-xl sm:text-lg"
        >
          {description}
        </motion.p>

        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={FADE}
          transition={{ delay: 0.5 }}
          className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
        >
          <motion.button
            type="button"
            onClick={onCtaClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-auto rounded-full bg-aurora px-6 py-2.5 text-center text-xs font-bold text-ink-950 shadow-lg shadow-violet-500/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background sm:px-8 sm:py-3.5 sm:text-base"
          >
            {ctaText}
          </motion.button>
          <motion.button
            type="button"
            onClick={onSecondaryCtaClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-auto rounded-full border border-white/20 bg-zinc-900/80 px-6 py-2.5 text-center text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background sm:px-8 sm:py-3.5 sm:text-base"
          >
            {secondaryCtaText}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}