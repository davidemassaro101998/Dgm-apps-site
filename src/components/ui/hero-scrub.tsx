"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";

export interface HeroScrubIcon {
  id: string;
  name: string;
  iconUrl: string;
  href: string;
  /** Approximate on-screen position, as a percentage, matching where this
   *  object floats in the video -- doesn't need to be pixel-exact. */
  leftPct: number;
}

export interface HeroScrubProps {
  /** Scroll-scrubbed brand video: currentTime tracks scroll position 1:1,
   *  it never plays on its own. */
  videoSrc?: string;
  posterSrc?: string;
  taglineLine1: string;
  taglineLine2: string;
  ctaLabel: string;
  aboutLine1: string;
  aboutLine2: string;
  icons: HeroScrubIcon[];
}

const PIN_VH = 320;

export function HeroScrub({
  videoSrc,
  posterSrc,
  taglineLine1,
  taglineLine2,
  ctaLabel,
  aboutLine1,
  aboutLine2,
  icons,
}: HeroScrubProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute("muted", "");
  }, [videoSrc]);

  // Manual scroll tracking: framer's useScroll({ target }) was silently
  // falling back to whole-document scroll instead of this section's own
  // range (progress only reached 1 at the very bottom of the page). This
  // computes progress directly off the section's own bounding rect, the
  // same math already verified working in the standalone preview builds.
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section) return;
    function onScroll() {
      const rect = section!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      scrollYProgress.set(p);
      if (video && video.duration && !reduced) {
        video.currentTime = Math.min(video.duration, Math.max(0, p * video.duration));
      }
    }
    onScroll();
    // Duration is 0 until metadata loads -- re-sync once it does so the
    // very first frame isn't stuck waiting for the next scroll event.
    video?.addEventListener("loadedmetadata", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      video?.removeEventListener("loadedmetadata", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  // Every layer is a smooth, continuous fade over its own slice of the
  // scroll range -- nothing snaps in or out on a single scroll tick.
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.05, 0.14, 0.2], [1, 1, 1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.05, 0.14, 0.2], [0, 1, 1, 0]);
  const ctaY = useTransform(scrollYProgress, [0, 0.05], [16, 0]);
  const aboutOpacity = useTransform(scrollYProgress, [0.28, 0.34, 0.44, 0.5], [0, 1, 1, 0]);
  // Icons fade in right as the video's own rendered objects finish forming
  // (~0.59 in the trimmed clip) and simply sit on top from then on --
  // the "swap" reads as the video handing off to real, tappable icons.
  const iconsOpacity = useTransform(scrollYProgress, [0.56, 0.66], [0, 1]);
  const iconsPointerEvents = useTransform(scrollYProgress, (v) => (v > 0.6 ? "auto" : "none"));

  const handleCtaClick = () => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const target = sectionTop + section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative w-full bg-black text-white" style={{ height: `${PIN_VH}vh` }} id="top">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ perspective: "1400px" }}>
        <div className="absolute inset-0 z-0">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              muted
              playsInline
              preload="auto"
              className="h-full w-full object-cover object-center sm:object-[center_40%]"
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

        <div
          aria-hidden
          className="absolute inset-0 z-[1]"
          style={{ background: "radial-gradient(ellipse at 50% 22%, transparent 35%, rgba(0,0,0,0.6) 100%)" }}
        />

        {/* Tagline + CTA: sit just under the two spheres, visible at rest,
            gone by the second beat of scroll */}
        <motion.div
          className="absolute inset-x-0 top-[44%] z-10 flex flex-col items-center gap-6 px-4"
          style={{ opacity: taglineOpacity }}
        >
          <h1
            className="whitespace-nowrap text-center font-display font-black uppercase leading-[0.95] tracking-[-0.02em]"
            style={{
              fontSize: "clamp(1.4rem, 6.2vw, 3.5rem)",
              color: "#ffffff",
              textShadow: [
                "0 -1px 0 rgba(255,255,255,0.5)",
                "0 2px 0 rgba(0,0,0,0.35)",
                "0 4px 0 rgba(0,0,0,0.3)",
                "0 6px 10px rgba(0,0,0,0.35)",
                "0 20px 40px rgba(0,0,0,0.55)",
              ].join(", "),
            }}
          >
            {taglineLine1} {taglineLine2}
          </h1>

          <motion.button
            type="button"
            onClick={handleCtaClick}
            style={{ opacity: ctaOpacity, y: ctaY }}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform duration-200 hover:scale-105 active:scale-95 sm:px-8 sm:py-3.5 sm:text-base"
          >
            {ctaLabel}
          </motion.button>
        </motion.div>

        {/* "Chi siamo", two lines, appears/disappears mid-scroll over the video,
            in the same reading zone the tagline just vacated */}
        <motion.div
          className="absolute inset-x-0 top-[44%] z-10 px-6 text-center"
          style={{ opacity: aboutOpacity }}
        >
          <p
            className="font-display font-black uppercase leading-tight tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.6rem, 6vw, 3.2rem)", textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}
          >
            {aboutLine1}
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-white bg-clip-text text-transparent">
              {aboutLine2}
            </span>
          </p>
        </motion.div>

        {/* Real, tappable icons -- roughly where the video's own objects
            settle, not pixel-matched. */}
        <motion.div
          className="absolute inset-x-0 top-[56%] z-10 flex justify-center sm:top-[46%]"
          style={{ opacity: iconsOpacity, pointerEvents: iconsPointerEvents }}
        >
          <div className="relative h-[26vh] w-full max-w-md">
            {icons.map((icon) => (
              <a
                key={icon.id}
                href={icon.href}
                target="_blank"
                rel="noreferrer"
                className="group absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1.5"
                style={{ left: `${icon.leftPct}%` }}
              >
                <img
                  src={icon.iconUrl}
                  alt={icon.name}
                  className="h-16 w-16 rounded-[24%] object-cover shadow-[0_16px_36px_-8px_rgba(0,0,0,0.7)] transition-transform duration-200 group-hover:scale-110 group-active:scale-95 sm:h-20 sm:w-20"
                />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/90 sm:text-xs">
                  {icon.name}
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
