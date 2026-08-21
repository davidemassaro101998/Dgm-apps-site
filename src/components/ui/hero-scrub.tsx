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
// this must take several separate scroll/slide gestures to get through, so
// it reads as scrubbing through a continuous video one frame at a time
// rather than resolving in one or two scrolls.
const PIN_VH = 560;

// Every on-screen text block is styled to look physically lifted off the
// video -- a bright bevel edge on top, a stepped dark side, then a soft
// contact shadow -- instead of sitting in a background panel. This is what
// makes the words the clear focal point of the screen without boxing them.
const PHYSICAL_TEXT_SHADOW = [
  "0 -1.5px 0 rgba(255,255,255,0.65)",
  "0 1px 0 rgba(0,0,0,0.45)",
  "0 2px 0 rgba(0,0,0,0.45)",
  "0 3px 0 rgba(0,0,0,0.4)",
  "0 4px 0 rgba(0,0,0,0.4)",
  "0 10px 18px rgba(0,0,0,0.55)",
  "0 26px 50px rgba(0,0,0,0.65)",
].join(", ");

const ENTRANCE_TRANSITION = { delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

export function HeroScrub({
  videoSrc,
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
  // computes progress directly off the section's own bounding rect.
  //
  // The video's own currentTime is a straight linear map of that progress
  // (video.duration * p) -- the footage already has its own natural pacing
  // (spheres merge, light burst, ribbons form, a brief lull, then the
  // gift/wrench/dumbbell appear and settle), so scroll just scrubs through
  // it as-is rather than distorting it to force particular content beats to
  // line up with particular scroll checkpoints. It's the on-screen text/icon
  // windows below that are tuned to match the video's real timing, not the
  // other way around.
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section) return;

    function applyProgress() {
      const rect = section!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      scrollYProgress.set(p);
      if (video && video.duration && !reduced) {
        // Never let this collapse to exactly 0 -- assigning the value the
        // element already holds is a silent no-op seek that paints nothing.
        video.currentTime = Math.max(0.001, Math.min(video.duration, p * video.duration));
      }
    }

    // Scroll events can fire far more often than the screen actually
    // repaints -- seeking the video on every single one (rather than once
    // per animation frame) was producing visible jank. Coalesce with rAF so
    // at most one seek happens per rendered frame.
    let rafId = 0;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        applyProgress();
      });
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
      // through one real playback start. Two independent attempts:
      //  1) on mount, via the native `autoplay` attribute + an explicit
      //     play() call, which covers the common muted-autoplay case;
      //  2) as a fallback, on the visitor's very first real touch/scroll/
      //     wheel gesture, since some autoplay policies specifically
      //     require actual user activation and don't honor attribute-only
      //     autoplay at all. This can't do anything about iOS Low Power
      //     Mode specifically -- that blocks all video autoplay at the OS
      //     level with no override, by design -- but covers other stricter
      //     contexts (some in-app/WebView browsers) that aren't that.
      // Either way, once playback actually starts, wait for the real
      // "playing" event (pausing the instant play() resolves only means
      // playback *started*, not that a frame has painted) then immediately
      // resync to the true scroll-derived frame, so priming never leaves
      // the video ahead of where the user has actually scrolled.
      const settleAfterPlay = () => {
        if (cancelled) return;
        const onPlaying = () => {
          video.pause();
          applyProgress();
          video.removeEventListener("playing", onPlaying);
        };
        video.addEventListener("playing", onPlaying);
        setTimeout(() => {
          video.removeEventListener("playing", onPlaying);
          if (!video.paused) video.pause();
          applyProgress();
        }, 250);
      };
      const primeDecoder = () => {
        if (cancelled) return;
        applyProgress();
        video.play().then(settleAfterPlay).catch(() => {});
      };
      if (video.readyState >= 1) primeDecoder();
      else video.addEventListener("loadedmetadata", primeDecoder, { once: true });

      const gestureRetry = () => {
        if (cancelled || !video.paused) return;
        video.play().then(settleAfterPlay).catch(() => {});
      };
      const gestureEvents = ["touchstart", "pointerdown", "wheel"] as const;
      gestureEvents.forEach((evt) => window.addEventListener(evt, gestureRetry, { once: true, passive: true }));

      applyProgress();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        cancelled = true;
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        gestureEvents.forEach((evt) => window.removeEventListener(evt, gestureRetry));
      };
    }

    applyProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced, videoSrc]);

  // The video's own real content beats, measured directly from the file
  // (public/videos/hero-brand.mp4, 188 frames @ 24fps): the gift/wrench/
  // dumbbell first become visible at frame 107 (progress 0.569) and are
  // fully formed and holding steady by frame 157 (progress 0.835).
  // Re-measure and update both if the video is ever re-cut.
  const VIDEO_ONSET_PROGRESS = 107 / 188;
  const VIDEO_SETTLE_PROGRESS = 157 / 188;

  // Hero fades out as soon as the visitor scrolls at all.
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  // "Chi siamo" rises in, holds, and fades back out again *before* the
  // video's own onset point -- not right up against it -- so there's a real
  // gap of pure video (the footage's own natural lull between the ribbons
  // forming and the objects appearing) with no text and no objects, instead
  // of the two overlapping.
  const aboutOpacity = useTransform(scrollYProgress, [0.15, 0.3, 0.4, 0.5], [0, 1, 1, 0]);
  const aboutY = useTransform(scrollYProgress, [0.15, 0.3, 0.4, 0.5], [48, 0, 0, 48]);
  // Erases the video's own now-settled drawn objects right as the real
  // icons fade in -- the footage just holds them, it never fades them out
  // on its own. Timed to the measured settle point, not a guess.
  const iconScrimOpacity = useTransform(
    scrollYProgress,
    [VIDEO_SETTLE_PROGRESS, VIDEO_SETTLE_PROGRESS + 0.04],
    [0, 1]
  );
  const iconsOpacity = useTransform(scrollYProgress, [VIDEO_SETTLE_PROGRESS + 0.02, 0.95], [0, 1]);
  const iconsY = useTransform(scrollYProgress, [VIDEO_SETTLE_PROGRESS + 0.02, 0.95], [40, 0]);
  const iconsPointerEvents = useTransform(scrollYProgress, (v) => (v > 0.92 ? "auto" : "none"));

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
      {/* NOTE: this offset is a % of the section's own (PIN_VH-tall) height,
          not of the scrollable pin range (height - viewport) that scroll
          progress is measured against -- the two only line up at the very
          top. Recompute both whenever PIN_VH or the opacity windows above
          change (based on a ~844px reference viewport). */}
      {/* Anchor for the "Chi siamo" nav item: top-[31%] lands around
          progress 0.375, the middle of its hold. */}
      <div id="chi-siamo" aria-hidden className="absolute inset-x-0 top-[31%] h-px w-full" />
      {/* Anchor for the "Catalogo" nav item: the real catalog is the 3 real
          app icons that take the video's own drawn icons' place -- there's
          no separate catalog section. top-[74%] lands around progress
          0.90, inside the icon fade-in window. */}
      <div id="catalogo" aria-hidden className="absolute inset-x-0 top-[74%] h-px w-full" />
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ perspective: "1400px" }}>
        <div className="absolute inset-0 z-0">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              muted
              autoPlay
              playsInline
              disablePictureInPicture
              preload="auto"
              tabIndex={-1}
              className="hero-scrub-video h-full w-full object-cover object-center sm:object-[center_40%]"
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

        {/* Dims the video a bit whenever a text/icon layer below is on
            screen -- synced 1:1 to that layer's own opacity, so it fades up
            and down with the content instead of being a flat, always-on
            wash. Keeps the (often bright/busy) video from fighting with the
            text for attention. */}
        <motion.div aria-hidden className="absolute inset-0 z-[1] bg-black/45" style={{ opacity: taglineOpacity }} />
        <motion.div aria-hidden className="absolute inset-0 z-[1] bg-black/45" style={{ opacity: aboutOpacity }} />

        {/* Tagline + CTA: rest just above the bottom edge of the screen.
            Pop in ~0.5s after the page settles (not on scroll), then fade
            out together as soon as the visitor starts scrolling. No panel
            behind them -- the physical text-shadow treatment is what makes
            them read as lifted off the video and the clear focal point. */}
        <motion.div
          className="absolute inset-x-0 bottom-[6%] z-10 flex flex-col items-center gap-6 px-4 sm:bottom-[9%]"
          style={{ opacity: taglineOpacity }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ENTRANCE_TRANSITION}
            className="whitespace-nowrap text-center font-display font-black uppercase leading-[0.95] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(1.6rem, 7.2vw, 3.8rem)", textShadow: PHYSICAL_TEXT_SHADOW }}
          >
            {taglineLine1} {taglineLine2}
          </motion.h1>

          <motion.button
            type="button"
            onClick={handleCtaClick}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ENTRANCE_TRANSITION}
            style={{ opacity: ctaOpacity }}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform duration-200 hover:scale-105 active:scale-95 sm:px-8 sm:py-3.5 sm:text-base"
          >
            {ctaLabel}
          </motion.button>
        </motion.div>

        {/* "Chi siamo": rises from below into the middle-lower part of the
            screen, holds, then sinks back out -- never a flat cross-fade.
            Two short blocks side by side on the same row, split by a
            glowing rule, same physical text-shadow treatment as the
            tagline. Fully faded out well before the video's own onset
            point, leaving a real gap of pure video in between. */}
        <motion.div
          className="absolute inset-x-0 top-[58%] z-10 flex items-start justify-center gap-5 px-4 sm:top-[52%] sm:gap-8"
          style={{ opacity: aboutOpacity, y: aboutY }}
        >
          <p
            className="text-right font-display font-black uppercase leading-tight tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(1.15rem, 5.4vw, 2.6rem)", textShadow: PHYSICAL_TEXT_SHADOW }}
          >
            {aboutLine1}
            <br />
            {aboutLine2}
          </p>
          <div className="mt-1 h-14 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-white/70 via-white/25 to-transparent sm:h-20" />
          <p
            className="text-left font-display font-black uppercase leading-tight tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.15rem, 5.4vw, 2.6rem)", textShadow: PHYSICAL_TEXT_SHADOW }}
          >
            <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-white bg-clip-text text-transparent">
              {aboutLine3}
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-white bg-clip-text text-transparent">
              {aboutLine4}
            </span>
          </p>
        </motion.div>

        {/* Erases the video's own now-settled drawn objects right as the
            real icons fade in below, so the two never show at once --
            sits above the video but below the icons themselves. */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-[28%] bottom-0 z-[2]"
          style={{
            opacity: iconScrimOpacity,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.97) 35%, rgba(0,0,0,0.98) 100%)",
          }}
        />

        {/* Real, tappable icons -- roughly where the video's own objects
            settle, not pixel-matched. Rise up from below as they fade in,
            same entrance motion as "chi siamo". */}
        <motion.div
          className="absolute inset-x-0 top-[56%] z-10 flex justify-center sm:top-[46%]"
          style={{ opacity: iconsOpacity, y: iconsY, pointerEvents: iconsPointerEvents }}
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
