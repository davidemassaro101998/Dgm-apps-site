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
  aboutLine3: string;
  aboutLine4: string;
  icons: HeroScrubIcon[];
}

// Scrollable distance for the whole staged sequence. Deliberately long --
// this must take many separate scroll/slide gestures to get through (a
// couple to reach "chi siamo", a couple through it, a couple more to reach
// the icons), so it reads as scrubbing through a continuous video one
// frame at a time rather than resolving in one or two scrolls.
const PIN_VH = 560;

export function HeroScrub({
  videoSrc,
  posterSrc,
  taglineLine1,
  taglineLine2,
  ctaLabel,
  aboutLine1,
  aboutLine2,
  aboutLine3,
  aboutLine4,
  icons,
}: HeroScrubProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

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

    function syncToScroll() {
      const rect = section!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      scrollYProgress.set(p);
      if (video && video.duration && !reduced) {
        // Never let this collapse to exactly 0 -- assigning the value the
        // element already holds is a silent no-op seek that paints nothing.
        video.currentTime = Math.min(video.duration, Math.max(0.001, p * video.duration));
      }
    }

    let cancelled = false;
    if (video) {
      // React sets `muted`/`autoPlay` as DOM *properties* during commit, not
      // as the literal HTML attributes -- some mobile browsers only check
      // the attribute at parse time when deciding whether to honor
      // autoplay, so the JSX props alone aren't reliable. Force both as real
      // attributes too, redundantly with the JSX props above.
      video.muted = true;
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      // A <video> driven only by currentTime seeks (never actually played)
      // stays visually black on real Safari/Chrome mobile until it has been
      // through one real playback start -- this is why the element also
      // carries the native `autoplay` attribute above, the most broadly
      // reliable way to get a muted video decoding at all on a phone. This
      // effect's own explicit play() call is a redundant fallback for
      // browsers where the attribute alone doesn't fire in time. The naive
      // "play then immediately pause" version of that fallback is flaky for
      // two reasons:
      //  1) assigning currentTime the value it already holds (0 -> 0) is a
      //     no-op with no seek/paint, so priming must force a *different*
      //     value first (handled by syncToScroll's 0.001 floor above);
      //  2) pausing the instant the play() promise resolves only means
      //     playback *started*, not that a frame has painted yet -- and
      //     while it plays, the video visibly drifts away from the frame
      //     the current scroll position calls for. Wait for the real
      //     "playing" event (with a timeout fallback), then immediately
      //     resync to the true scroll-derived frame so priming never
      //     leaves the video ahead of where the user has actually scrolled.
      const primeDecoder = () => {
        if (cancelled) return;
        syncToScroll();
        video
          .play()
          .then(() => {
            if (cancelled) return;
            const onPlaying = () => {
              video.pause();
              syncToScroll();
              video.removeEventListener("playing", onPlaying);
            };
            video.addEventListener("playing", onPlaying);
            setTimeout(() => {
              video.removeEventListener("playing", onPlaying);
              if (!video.paused) video.pause();
              syncToScroll();
            }, 250);
          })
          .catch(() => {});
      };
      if (video.readyState >= 1) primeDecoder();
      else video.addEventListener("loadedmetadata", primeDecoder, { once: true });
    }

    syncToScroll();
    window.addEventListener("scroll", syncToScroll, { passive: true });
    window.addEventListener("resize", syncToScroll);
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", syncToScroll);
      window.removeEventListener("resize", syncToScroll);
    };
  }, [reduced, videoSrc]);

  // Every layer is a smooth, continuous fade over its own slice of the
  // scroll range -- nothing snaps in or out on a single scroll tick.
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.05, 0.14, 0.2], [1, 1, 1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.05, 0.14, 0.2], [0, 1, 1, 0]);
  const ctaY = useTransform(scrollYProgress, [0, 0.05], [16, 0]);
  // "Chi siamo" rises in from below the frame with a fade, holds, then sinks
  // back down out of view as it fades -- never a flat cross-fade in place.
  // Widened vs. the first pass so it gets real scroll time of its own.
  const aboutOpacity = useTransform(scrollYProgress, [0.26, 0.34, 0.48, 0.56], [0, 1, 1, 0]);
  const aboutY = useTransform(scrollYProgress, [0.26, 0.34, 0.48, 0.56], [48, 0, 0, 48]);
  // The video's own drawn gift/wrench/dumbbell finish forming around
  // progress ~0.59 and then just sit there, fully settled, for the rest of
  // the clip -- so let that footage hold and play out almost to the very
  // end of the scroll before swapping to the real, tappable icons. The
  // hand-off should read as "you've reached the end of the video," not as
  // a mid-scroll detail.
  const iconsOpacity = useTransform(scrollYProgress, [0.9, 0.99], [0, 1]);
  const iconsPointerEvents = useTransform(scrollYProgress, (v) => (v > 0.95 ? "auto" : "none"));

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
      {/* Anchor for the "Chi siamo" nav item: scrollIntoView lands right where
          the aboutOpacity beat below is visible, since the standalone "Chi
          siamo" section was removed (it duplicated this in-hero beat). */}
      {/* NOTE: this offset is a % of the section's own (PIN_VH-tall) height,
          not of the scrollable pin range (height - viewport) that scroll
          progress is measured against -- the two only line up at the very
          top. Recompute both whenever PIN_VH or the opacity windows below
          change: top-[34%] here lands around progress ~0.41, inside the
          [0.26, 0.56] window where the about text is on screen (based on a
          ~844px reference viewport). */}
      <div id="chi-siamo" aria-hidden className="absolute inset-x-0 top-[34%] h-px w-full" />
      {/* Anchor for the "Catalogo" nav item: the real catalog is the 3 real
          app icons that take the video's own drawn icons' place below --
          there is no separate catalog section any more. top-[78%] lands
          around progress ~0.945, inside the [0.9, 0.99] icon fade-in window. */}
      <div id="catalogo" aria-hidden className="absolute inset-x-0 top-[78%] h-px w-full" />
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ perspective: "1400px" }}>
        <div className="absolute inset-0 z-0">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              muted
              autoPlay
              playsInline
              disablePictureInPicture
              preload="auto"
              tabIndex={-1}
              className="hero-scrub-video pointer-events-none h-full w-full object-cover object-center sm:object-[center_40%]"
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

        {/* Tagline + CTA: rest just above the bottom edge of the screen,
            visible at rest, gone by the second beat of scroll. Wrapped in a
            glass card so it reads as the clear focal point of this screen,
            not just text floating over a busy video. */}
        <motion.div
          className="absolute inset-x-0 bottom-[6%] z-10 flex justify-center px-4 sm:bottom-[9%]"
          style={{ opacity: taglineOpacity }}
        >
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-black/45 px-6 py-6 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.65)] backdrop-blur-md sm:px-10 sm:py-8">
            <h1
              className="whitespace-nowrap text-center font-display font-black uppercase leading-[0.95] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.3rem, 5.8vw, 3.2rem)",
                color: "#ffffff",
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
          </div>
        </motion.div>

        {/* "Chi siamo": rises from below into the middle-lower part of the
            screen, holds, then sinks back out -- never a flat cross-fade.
            Two short blocks side by side on the same row (not 4 stacked
            lines), inside the same glass-card treatment as the tagline
            above, so it's the clear focal point of the screen rather than
            a caption over the background. */}
        <motion.div
          className="absolute inset-x-0 top-[58%] z-10 flex justify-center px-4 sm:top-[52%]"
          style={{ opacity: aboutOpacity, y: aboutY }}
        >
          <div className="flex items-center gap-5 rounded-3xl border border-white/10 bg-black/45 px-5 py-6 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.65)] backdrop-blur-md sm:gap-8 sm:px-10 sm:py-8">
            <p
              className="text-right font-display font-black uppercase leading-tight tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(0.95rem, 4.4vw, 1.9rem)" }}
            >
              {aboutLine1}
              <br />
              {aboutLine2}
            </p>
            <div className="h-12 w-px shrink-0 bg-white/20 sm:h-16" />
            <p
              className="text-left font-display font-black uppercase leading-tight tracking-[-0.02em]"
              style={{ fontSize: "clamp(0.95rem, 4.4vw, 1.9rem)" }}
            >
              <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-white bg-clip-text text-transparent">
                {aboutLine3}
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-white bg-clip-text text-transparent">
                {aboutLine4}
              </span>
            </p>
          </div>
        </motion.div>

        {/* Real, tappable icons -- roughly where the video's own objects
            settle, not pixel-matched. */}
        <motion.div
          className="absolute inset-x-0 top-[56%] z-10 flex justify-center sm:top-[46%]"
          style={{ opacity: iconsOpacity, pointerEvents: iconsPointerEvents }}
        >
          <div className="relative h-[30vh] w-full max-w-lg">
            {icons.map((icon) => (
              <a
                key={icon.id}
                href={icon.href}
                target="_blank"
                rel="noreferrer"
                className="group absolute top-0 flex -translate-x-1/2 flex-col items-center gap-2"
                style={{ left: `${icon.leftPct}%` }}
              >
                <img
                  src={icon.iconUrl}
                  alt={icon.name}
                  className="h-20 w-20 rounded-[24%] object-cover shadow-[0_20px_44px_-8px_rgba(0,0,0,0.75)] transition-transform duration-200 group-hover:scale-110 group-active:scale-95 sm:h-28 sm:w-28"
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-white/90 sm:text-sm">
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
