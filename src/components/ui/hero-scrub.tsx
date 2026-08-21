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
  /** Scroll-scrubbed brand video: currentTime tracks scroll position (via a
   *  non-linear map, see progressToVideoTime), it never plays on its own. */
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
// this must take several separate scroll/slide gestures to get through, so
// it reads as scrubbing through a continuous video one frame at a time
// rather than resolving in one or two scrolls.
const PIN_VH = 560;

// The production video (public/videos/hero-brand.mp4) is cut from the
// original render starting right after its opening frames (which had a
// brief visual glitch showing the gift/wrench/dumbbell too early), through
// to well past the point where they finish forming. These two checkpoints
// are measured directly from that file -- re-measure and update both if the
// video is ever re-cut.
const VIDEO_FPS = 24;
const VIDEO_ONSET_FRAME = 107; // gift/wrench/dumbbell first become visible
const VIDEO_SETTLE_FRAME = 157; // fully formed, holds steady from here on
const VIDEO_ONSET_T = VIDEO_ONSET_FRAME / VIDEO_FPS;
const VIDEO_SETTLE_T = VIDEO_SETTLE_FRAME / VIDEO_FPS;

// Maps scroll progress (0-1) to video currentTime -- deliberately NOT
// linear. The video's own content is front-loaded (all the motion --
// spheres merging, light burst, ribbons, objects forming -- happens before
// VIDEO_SETTLE_T) and then just holds a static frame for the rest of its
// duration. A linear map would spend the back quarter of the scroll on a
// video that's barely moving. Instead this pins three checkpoints that
// match the on-screen content beats:
//   progress 0    -> video 0          (rest state)
//   progress 0.5  -> VIDEO_ONSET_T    ("chi siamo" fully open, objects not
//                                       visible yet -- clean background)
//   progress 0.75 -> VIDEO_SETTLE_T   (objects fully formed, "chi siamo"
//                                       has finished dissolving into them)
//   progress 1    -> video duration   (icons in; video motion barely
//                                       matters here, it's under the scrim)
function progressToVideoTime(p: number, duration: number): number {
  const onset = Math.min(VIDEO_ONSET_T, duration);
  const settle = Math.min(VIDEO_SETTLE_T, duration);
  if (p <= 0.5) return (p / 0.5) * onset;
  if (p <= 0.75) return onset + ((p - 0.5) / 0.25) * (settle - onset);
  return settle + ((p - 0.75) / 0.25) * (duration - settle);
}

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
  // computes progress directly off the section's own bounding rect.
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
        video.currentTime = Math.max(0.001, Math.min(video.duration, progressToVideoTime(p, video.duration)));
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
          syncToScroll();
          video.removeEventListener("playing", onPlaying);
        };
        video.addEventListener("playing", onPlaying);
        setTimeout(() => {
          video.removeEventListener("playing", onPlaying);
          if (!video.paused) video.pause();
          syncToScroll();
        }, 250);
      };
      const primeDecoder = () => {
        if (cancelled) return;
        syncToScroll();
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

      syncToScroll();
      window.addEventListener("scroll", syncToScroll, { passive: true });
      window.addEventListener("resize", syncToScroll);
      return () => {
        cancelled = true;
        window.removeEventListener("scroll", syncToScroll);
        window.removeEventListener("resize", syncToScroll);
        gestureEvents.forEach((evt) => window.removeEventListener(evt, gestureRetry));
      };
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

  // Four even quarters of the scroll range, each one big scroll/slide wide:
  //   Q1 [0,    0.25] hero fades out
  //   Q2 [0.25, 0.5 ] "chi siamo" fades in, fully open exactly at 0.5
  //   Q3 [0.5,  0.75] "chi siamo" fades out while the video's own objects
  //                    form behind it (see progressToVideoTime above --
  //                    that's exactly what video time this quarter covers)
  //   Q4 [0.75, 1   ] the formed objects are erased (scrim) and the real
  //                    tappable icons rise in from below
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const aboutOpacity = useTransform(scrollYProgress, [0.25, 0.48, 0.52, 0.75], [0, 1, 1, 0]);
  const aboutY = useTransform(scrollYProgress, [0.25, 0.48, 0.52, 0.75], [48, 0, 0, 48]);
  // Erases the video's own now-fully-formed drawn objects right at the
  // start of Q4 -- the footage itself just holds them, it never fades them
  // out on its own, so this is what makes them "disappear completely"
  // before the real icons take their place.
  const iconScrimOpacity = useTransform(scrollYProgress, [0.75, 0.82], [0, 1]);
  const iconsOpacity = useTransform(scrollYProgress, [0.8, 0.95], [0, 1]);
  const iconsY = useTransform(scrollYProgress, [0.8, 0.95], [40, 0]);
  const iconsPointerEvents = useTransform(scrollYProgress, (v) => (v > 0.9 ? "auto" : "none"));

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
      {/* Anchor for the "Chi siamo" nav item: top-[41%] lands right at
          progress 0.5, the exact midpoint where it's fully open. */}
      <div id="chi-siamo" aria-hidden className="absolute inset-x-0 top-[41%] h-px w-full" />
      {/* Anchor for the "Catalogo" nav item: the real catalog is the 3 real
          app icons that take the video's own drawn icons' place -- there's
          no separate catalog section. top-[70%] lands around progress
          0.85, inside the [0.8, 0.95] icon fade-in window. */}
      <div id="catalogo" aria-hidden className="absolute inset-x-0 top-[70%] h-px w-full" />
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
            tagline. No scrim needed here: progressToVideoTime keeps this
            quarter's video content to the pre-object part of the clip. */}
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
