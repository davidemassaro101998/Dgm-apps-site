"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export interface HeroScrubProps {
  /** Full-bleed looping brand video, muted/playsInline. */
  videoSrc?: string;
  posterSrc?: string;
  titleTop: string;
  titleBottom: string;
  ctaLabel: string;
  onCta?: () => void;
}

export function HeroScrub({ videoSrc, posterSrc, titleTop, titleBottom, ctaLabel, onCta }: HeroScrubProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  // The video plays on its own timeline (not tied to scroll) and boomerangs
  // forward/reverse in a seamless loop -- rewinding frame by frame via rAF
  // once it ends, since <video> has no native reverse playback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    let raf = 0;
    let reversing = false;

    const stepBack = () => {
      if (!reversing) return;
      video.currentTime = Math.max(0, video.currentTime - 1 / 30);
      if (video.currentTime <= 0.03) {
        reversing = false;
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        raf = requestAnimationFrame(stepBack);
      }
    };
    const onEnded = () => {
      reversing = true;
      raf = requestAnimationFrame(stepBack);
    };

    video.addEventListener("ended", onEnded);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("ended", onEnded);
      cancelAnimationFrame(raf);
    };
  }, [videoSrc]);

  // The "DGM APPS" wordmark sits big at the top in 3D (perspective +
  // resting tilt). As you scroll it tumbles down and fades; since it's a
  // pure function of scrollYProgress, scrolling back up re-composes it
  // exactly the same way, for free -- no separate "undo" animation needed.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "160%"]);
  const titleRotateX = useTransform(scrollYProgress, [0, 1], [-10, reduced ? -10 : -70]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <section ref={sectionRef} className="relative w-full bg-black text-white" style={{ height: "180vh" }} id="top">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ perspective: "1400px" }}>
        <motion.div className="absolute inset-0 z-0" style={{ scale: videoScale }}>
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              muted
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
        </motion.div>

        {/* Readability scrim, doesn't fight the video's own contrast */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1]"
          style={{ background: "radial-gradient(ellipse at 50% 20%, transparent 35%, rgba(0,0,0,0.65) 100%)" }}
        />

        <div className="relative z-10 flex h-full w-full flex-col items-center pt-14 sm:pt-20" style={{ transformStyle: "preserve-3d" }}>
          {/* Outer wrapper: one-time entrance fade-in on load. */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Inner wrapper: pure scroll-linked fall/recompose. */}
            <motion.h1
              style={{
                y: titleY,
                rotateX: titleRotateX,
                opacity: titleOpacity,
                transformOrigin: "50% 0%",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
              }}
              className="font-display text-center font-black uppercase leading-[0.85] tracking-[-0.04em]"
            >
            <span
              className="block"
              style={{
                fontSize: "clamp(3.5rem, 13vw, 10rem)",
                textShadow:
                  "1px 1px 0 rgba(255,255,255,0.15), 2px 2px 0 rgba(0,0,0,0.5), 4px 4px 0 rgba(0,0,0,0.4), 8px 10px 24px rgba(0,0,0,0.55)",
              }}
            >
              {titleTop}
            </span>
            <span
              className="block"
              style={{
                fontSize: "clamp(3.5rem, 13vw, 10rem)",
                textShadow:
                  "1px 1px 0 rgba(255,255,255,0.15), 2px 2px 0 rgba(0,0,0,0.5), 4px 4px 0 rgba(0,0,0,0.4), 8px 10px 24px rgba(0,0,0,0.55)",
              }}
            >
              {titleBottom}
            </span>
            </motion.h1>
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center sm:bottom-16">
          <motion.div
            style={{ opacity: ctaOpacity }}
          >
            <motion.button
              type="button"
              onClick={onCta}
              initial={reduced ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1 }}
              className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform duration-200 hover:scale-105 active:scale-95 sm:px-8 sm:py-3.5 sm:text-base"
            >
              {ctaLabel}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
