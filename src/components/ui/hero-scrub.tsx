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
  // Timing is pinned to explicit checkpoints on the 0-1 progress scale:
  // "chi siamo" fully open exactly at the midpoint (0.5), the real icons
  // coming out at 0.7 (right as the video's own drawn objects are settled),
  // holding from there to the end.
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.08, 0.26, 0.4], [1, 1, 1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.08, 0.26, 0.4], [0, 1, 1, 0]);
  const ctaY = useTransform(scrollYProgress, [0, 0.08], [16, 0]);
  // "Chi siamo" rises in from below the frame with a fade, holds, then sinks
  // back down out of view as it fades -- never a flat cross-fade in place.
  // Fully open (opacity 1) right at progress 0.5, the halfway point.
  const aboutOpacity = useTransform(scrollYProgress, [0.38, 0.5, 0.6, 0.68], [0, 1, 1, 0]);
  const aboutY = useTransform(scrollYProgress, [0.38, 0.5, 0.6, 0.68], [48, 0, 0, 48]);
  // The about window spans right across progress ~0.59, which is exactly
  // when the video's own drawn gift/wrench/dumbbell finish forming and sit
  // fully visible -- so without this, they show directly behind the "chi
  // siamo" text. Own faster ramp finishing well before the text is at full
  // opacity, so the darkening is already there once the text peaks.
  const aboutScrimOpacity = useTransform(scrollYProgress, [0.4, 0.48, 0.62, 0.68], [0, 1, 1, 0]);
  // The video's own drawn gift/wrench/dumbbell finish forming around
  // progress ~0.59 and hold, fully settled, until the real icons take
  // over -- centered on 0.7 (not starting there) so they're clearly
  // already "coming out" right at that checkpoint, not still at zero.
  const iconsOpacity = useTransform(scrollYProgress, [0.64, 0.78], [0, 1]);
  const iconsPointerEvents = useTransform(scrollYProgress, (v) => (v > 0.72 ? "auto" : "none"));
  // The video itself never stops showing its own drawn objects once
  // they've formed -- this scrim (sitting between the video and the real
  // icons) is what erases them from view. Its own faster ramp finishes
  // right as the icons start becoming legible, so the background is
  // already fully dark by the time there's anything to compare it against
  // -- tying it 1:1 to iconsOpacity instead left it barely-dark while icons
  // were still faint, letting the drawn objects bleed through underneath.
  const iconScrimOpacity = useTransform(scrollYProgress, [0.56, 0.65], [0, 1]);

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
          change: top-[41%] here lands right at progress 0.5, the exact
          midpoint where "chi siamo" is fully open (based on a ~844px
          reference viewport). */}
      <div id="chi-siamo" aria-hidden className="absolute inset-x-0 top-[41%] h-px w-full" />
      {/* Anchor for the "Catalogo" nav item: the real catalog is the 3 real
          app icons that take the video's own drawn icons' place below --
          there is no separate catalog section any more. top-[58%] lands
          around progress 0.71, inside the [0.64, 0.78] icon fade-in window. */}
      <div id="catalogo" aria-hidden className="absolute inset-x-0 top-[58%] h-px w-full" />
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

        {/* Tagline + CTA: rest just above the bottom edge of the screen,
            visible at rest, gone by the second beat of scroll. No panel
            behind it -- the physical text-shadow treatment (bright top
            edge, stepped dark side, soft contact shadow) is what makes it
            read as lifted off the video and the clear focal point. */}
        <motion.div
          className="absolute inset-x-0 bottom-[6%] z-10 flex flex-col items-center gap-6 px-4 sm:bottom-[9%]"
          style={{ opacity: taglineOpacity }}
        >
          <h1
            className="whitespace-nowrap text-center font-display font-black uppercase leading-[0.95] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(1.6rem, 7.2vw, 3.8rem)", textShadow: PHYSICAL_TEXT_SHADOW }}
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

        {/* Darkens the video behind the "chi siamo" text -- without it the
            video's own drawn objects (fully formed by progress ~0.59, right
            in the middle of this text's on-screen window) show directly
            behind the words. */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-[30%] bottom-0 z-[2]"
          style={{
            opacity: aboutScrimOpacity,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 20%, rgba(0,0,0,0.9) 45%, rgba(0,0,0,0.92) 100%)",
          }}
        />

        {/* "Chi siamo": rises from below into the middle-lower part of the
            screen, holds, then sinks back out -- never a flat cross-fade.
            Two short blocks side by side on the same row (not 4 stacked
            lines), split by a glowing rule instead of a boxed panel, same
            physical text-shadow treatment as the tagline. */}
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

        {/* Erases the video's own drawn objects right as the real icons
            fade in below, so the two never show at once -- sits above the
            video but below the icons themselves. */}
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
