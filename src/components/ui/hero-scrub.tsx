"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export interface HeroScrubProps {
  /** Full-bleed looping brand video, muted/playsInline. */
  videoSrc?: string;
  posterSrc?: string;
  title: string;
}

export function HeroScrub({ videoSrc, posterSrc, title }: HeroScrubProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // The whole hero fades out as a single piece while you scroll into the
  // next section -- no per-element choreography, just one clean dissolve.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0]);

  return (
    <section ref={sectionRef} className="relative w-full bg-black text-white" style={{ height: "150vh" }} id="top">
      <motion.div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{ opacity: heroOpacity, perspective: "1400px" }}
      >
        <div className="absolute inset-0 z-0">
          {videoSrc ? (
            <video
              src={videoSrc}
              poster={posterSrc}
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
              aria-hidden
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Video brand in arrivo
              </span>
            </div>
          )}
        </div>

        {/* Readability scrim, doesn't fight the video's own contrast */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1]"
          style={{ background: "radial-gradient(ellipse at 50% 22%, transparent 35%, rgba(0,0,0,0.6) 100%)" }}
        />

        <div className="relative z-10 flex h-full w-full items-start justify-center pt-14 sm:pt-20" style={{ transformStyle: "preserve-3d" }}>
          <motion.h1
            initial={reduced ? undefined : { opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="whitespace-nowrap px-4 text-center font-display font-black uppercase leading-none tracking-[-0.03em]"
            style={{
              fontSize: "clamp(2.6rem, 12vw, 8rem)",
              fontWeight: 900,
              /* Layered shadow stack gives the wordmark real extruded depth
                 plus a bright top edge -- reads as lifted off the video,
                 not just flat text with a drop-shadow. */
              color: "#ffffff",
              textShadow: [
                "0 -1px 0 rgba(255,255,255,0.55)",
                "0 1px 0 rgba(0,0,0,0.35)",
                "0 2px 0 rgba(0,0,0,0.35)",
                "0 3px 0 rgba(0,0,0,0.3)",
                "0 4px 0 rgba(0,0,0,0.25)",
                "0 6px 10px rgba(0,0,0,0.35)",
                "0 20px 40px rgba(0,0,0,0.55)",
              ].join(", "),
              transform: "rotateX(14deg)",
              transformOrigin: "50% 100%",
              transformStyle: "preserve-3d",
            }}
          >
            {title}
          </motion.h1>
        </div>
      </motion.div>
    </section>
  );
}
