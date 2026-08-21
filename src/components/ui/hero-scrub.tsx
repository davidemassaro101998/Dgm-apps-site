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

  // As you scroll past the hero, the whole scene tips away in 3D and
  // implodes -- like a wall falling flat away from you -- fading out to
  // reveal the real page (Chi siamo / Catalogo) underneath. Pure
  // scroll-linked Framer Motion, no GSAP.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 65]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.55]);
  const translateY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={sectionRef} className="relative w-full bg-black text-white" style={{ height: "180vh" }} id="top">
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{ perspective: "1400px" }}
      >
        <motion.div
          className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
          style={{
            rotateX,
            scale,
            y: translateY,
            opacity,
            transformOrigin: "50% 100%",
            transformStyle: "preserve-3d",
          }}
        >
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
            style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)" }}
          />

          <div className="relative z-10 flex h-full w-full flex-col items-center justify-between py-10 sm:py-16">
            <motion.h1
              initial={reduced ? undefined : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="font-display font-black uppercase"
              style={{ fontSize: "clamp(3.25rem, 11vw, 9rem)", lineHeight: 0.85, letterSpacing: "-0.04em" }}
            >
              {titleTop}
            </motion.h1>

            <motion.button
              type="button"
              onClick={onCta}
              initial={reduced ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
              className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform duration-200 hover:scale-105 active:scale-95 sm:px-8 sm:py-3.5 sm:text-base"
            >
              {ctaLabel}
            </motion.button>

            <motion.h2
              initial={reduced ? undefined : { opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
              className="font-display font-black uppercase"
              style={{ fontSize: "clamp(3.25rem, 11vw, 9rem)", lineHeight: 0.85, letterSpacing: "-0.04em" }}
            >
              {titleBottom}
            </motion.h2>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
