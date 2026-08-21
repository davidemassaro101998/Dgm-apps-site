"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useMotionTemplate, useTransform, useReducedMotion } from "framer-motion";

export interface HeroScrubIcon {
  id: string;
  name: string;
  statusLabel: string;
  iconUrl: string;
  href: string;
  /** Approximate on-screen position, as a percentage, matching where this
   *  object floats in the video -- doesn't need to be pixel-exact. */
  leftPct: number;
  /** Extra vertical offset (percent of the icon row's own height) from the
   *  shared baseline, since the video's own objects don't all sit at the
   *  same height. */
  topPct: number;
}

export interface HeroScrubProps {
  /** Scroll-scrubbed brand sequence: a directory of pre-extracted frames
   *  (f000.webp, f001.webp, ...) drawn to a canvas in lockstep with scroll
   *  position -- no <video> element, so there is never a native play/pause
   *  affordance for a mobile browser to show, and no per-scroll video
   *  decode stalls. */
  framesBaseUrl?: string;
  frameCount?: number;
  taglineLine1: string;
  taglineLine2: string;
  ctaLabel: string;
  aboutLine1: string;
  aboutLine2: string;
  aboutLine3: string;
  aboutLine4: string;
  catalogHeading: string;
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
  framesBaseUrl,
  frameCount = 0,
  taglineLine1,
  taglineLine2,
  ctaLabel,
  aboutLine1,
  aboutLine2,
  aboutLine3,
  aboutLine4,
  catalogHeading,
  icons,
}: HeroScrubProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  // Manual scroll tracking: framer's useScroll({ target }) was silently
  // falling back to whole-document scroll instead of this section's own
  // range (progress only reached 1 at the very bottom of the page). This
  // computes progress directly off the section's own bounding rect.
  const scrollYProgress = useMotionValue(0);

  // Pre-extracted frame sequence drawn straight to a <canvas>, instead of
  // scrubbing a <video> element's currentTime. Two problems that repeated
  // attempts couldn't fully fix on a real <video> are structurally gone
  // with this approach: (1) mobile browsers show a native tap-to-play
  // affordance on a video element that's paused/never confirmed "playing"
  // -- a canvas has no such element-level UI, ever; (2) seeking a video's
  // currentTime forces a real decode of a keyframe on every call, which is
  // what was producing the reported scroll lag -- drawing a already-decoded
  // Image bitmap to canvas is comparatively free.
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas || !framesBaseUrl || frameCount <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    const images: HTMLImageElement[] = new Array(frameCount);
    let loadedCount = 0;
    let currentFrame = -1;

    function drawFrame(index: number) {
      const img = images[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      if (index === currentFrame) return;
      currentFrame = index;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas!.clientWidth;
      const ch = canvas!.clientHeight;
      if (canvas!.width !== Math.round(cw * dpr) || canvas!.height !== Math.round(ch * dpr)) {
        canvas!.width = Math.round(cw * dpr);
        canvas!.height = Math.round(ch * dpr);
      }
      const cwPx = canvas!.width;
      const chPx = canvas!.height;
      // object-fit: cover, with a focal point that shifts lower on wider
      // (sm+) viewports to match the CSS the <video> element used to have.
      const focalY = window.innerWidth >= 640 ? 0.4 : 0.5;
      const scale = Math.max(cwPx / img.naturalWidth, chPx / img.naturalHeight);
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      const dx = (cwPx - drawW) / 2;
      const dy = (chPx - drawH) * focalY;
      ctx!.clearRect(0, 0, cwPx, chPx);
      ctx!.drawImage(img, dx, dy, drawW, drawH);
    }

    function applyProgress() {
      const rect = section!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      scrollYProgress.set(p);
      const index = Math.min(frameCount - 1, Math.max(0, Math.round(p * (frameCount - 1))));
      drawFrame(index);
    }

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = `${framesBaseUrl}/f${String(i).padStart(3, "0")}.webp`;
      img.onload = () => {
        loadedCount++;
        if (cancelled) return;
        // Paint as soon as the frame the visitor is currently scrolled to
        // becomes available, rather than waiting for the whole sequence.
        applyProgress();
      };
      images[i] = img;
    }

    // Reading scrollY off the native "scroll" event and reacting to it is
    // the thing that was still reading as laggy on mobile: touch/momentum
    // scrolling on many mobile browsers batches or throttles that event
    // independently of when frames are actually being rendered. Polling
    // scrollY once per animation frame instead -- the same technique behind
    // any buttery-smooth scroll-scrub site -- ties the draw directly to the
    // render loop rather than to however the browser chooses to dispatch
    // scroll events. Only run the loop while the section is anywhere near
    // the viewport (generous margin) so it costs nothing once scrolled well
    // past into the footer.
    let looping = false;
    let rafId = 0;
    function loop() {
      applyProgress();
      if (looping) rafId = requestAnimationFrame(loop);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !looping) {
          looping = true;
          loop();
        } else if (!entry.isIntersecting && looping) {
          looping = false;
          if (rafId) cancelAnimationFrame(rafId);
        }
      },
      { rootMargin: "50% 0px 50% 0px" }
    );
    observer.observe(section);

    function onResize() {
      applyProgress();
    }

    applyProgress();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      looping = false;
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, framesBaseUrl, frameCount]);

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
  // The hand-off: the screen darkens to full black almost instantly (no
  // visible fade to watch happen), then the three real icons arrive from
  // below like a stack of notifications sliding up into their resting
  // position -- rather than growing out of the drawings in place.
  const BLACKOUT_AT = VIDEO_SETTLE_PROGRESS; // 0.835
  const ICONS_POP_START = BLACKOUT_AT + 0.01;
  const ICONS_POP_END = VIDEO_SETTLE_PROGRESS + 0.11;
  const iconScrimOpacity = useTransform(scrollYProgress, [BLACKOUT_AT, BLACKOUT_AT + 0.006], [0, 1]);
  const iconsOpacity = useTransform(scrollYProgress, [ICONS_POP_START, ICONS_POP_START + 0.03], [0, 1]);
  // Slide up from below into their real resting position, like a
  // notification arriving -- no scale/grow, just a clean rise + settle.
  const iconsY = useTransform(scrollYProgress, [ICONS_POP_START, ICONS_POP_END], [64, 0]);
  const iconsHeadingY = useTransform(scrollYProgress, [ICONS_POP_START, ICONS_POP_END], [-16, 0]);
  const iconsPointerEvents = useTransform(scrollYProgress, (v) => (v > ICONS_POP_END ? "auto" : "none"));
  // The tiles arrive dim -- matching the same dark, cupo tone the background
  // just faded to -- and only light up brighter once they've settled into
  // place, instead of popping in at full brightness against a background
  // that's still noticeably darker than they are.
  const iconsBrightness = useTransform(
    scrollYProgress,
    [ICONS_POP_START, ICONS_POP_END, ICONS_POP_END + 0.05],
    [0.35, 0.85, 1.1]
  );
  const iconsBrightnessFilter = useMotionTemplate`brightness(${iconsBrightness})`;

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
          no separate catalog section. top-[76%] lands around progress
          0.92, inside the icons' pop-in window. */}
      <div id="catalogo" aria-hidden className="absolute inset-x-0 top-[76%] h-px w-full" />
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ perspective: "1400px" }}>
        <div className="absolute inset-0 z-0">
          {framesBaseUrl ? (
            <canvas
              ref={canvasRef}
              className="pointer-events-none h-full w-full"
              style={{ willChange: "contents" }}
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
          className="absolute inset-x-0 bottom-[14%] z-10 flex flex-col items-center gap-8 px-4 sm:bottom-[17%]"
          style={{ opacity: taglineOpacity }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ENTRANCE_TRANSITION}
            className="text-center font-display font-black uppercase leading-[1.05] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(2rem, 9vw, 4.8rem)", textShadow: PHYSICAL_TEXT_SHADOW }}
          >
            <span className="block">{taglineLine1}</span>
            <span className="block">{taglineLine2}</span>
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
            One centered column, four short iconic lines, all the same
            bright white and the same size -- no accent-colored or
            differently-sized sub-line -- same physical text-shadow
            treatment as the tagline. Fully faded out well before the
            video's own onset point, leaving a real gap of pure video in
            between. */}
        <motion.div
          className="absolute inset-x-0 top-[58%] z-10 flex flex-col items-center gap-1 px-4 text-center sm:top-[52%]"
          style={{ opacity: aboutOpacity, y: aboutY }}
        >
          <p
            className="font-display font-black uppercase leading-tight tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(1.15rem, 5.4vw, 2.6rem)", textShadow: PHYSICAL_TEXT_SHADOW }}
          >
            {aboutLine1}
            <br />
            {aboutLine2}
            <br />
            {aboutLine3}
            <br />
            {aboutLine4}
          </p>
        </motion.div>

        {/* Blacks out the entire screen almost instantly right at the
            video's settle point -- the darkening itself is never visible as
            a fade, it just snaps to black -- hiding the drawn objects
            completely before the real icons arrive. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 z-[2] bg-black"
          style={{ opacity: iconScrimOpacity }}
        />

        {/* Heading that introduces the icons the instant they start
            arriving -- same fade-in window as the icons themselves, with
            its own small settle-down so it doesn't feel pasted on top. */}
        <motion.p
          aria-hidden
          className="absolute inset-x-0 top-[34%] z-10 px-4 text-center font-display font-black uppercase leading-[0.95] tracking-[-0.02em] text-white sm:top-[25%]"
          style={{
            fontSize: "clamp(2.1rem, 10vw, 5.2rem)",
            opacity: iconsOpacity,
            y: iconsHeadingY,
            textShadow: PHYSICAL_TEXT_SHADOW,
          }}
        >
          {catalogHeading}
        </motion.p>

        {/* Real, tappable icons -- arrive from below into their resting
            position like a notification sliding up, once the screen is
            already fully black. Bigger, with a status pill, so this reads
            as the catalog. */}
        <motion.div
          className="absolute inset-x-0 top-[56%] z-10 flex justify-center sm:top-[46%]"
          style={{ pointerEvents: iconsPointerEvents }}
        >
          <div className="relative h-[34vh] w-full max-w-lg">
            {icons.map((icon) => (
              <motion.a
                key={icon.id}
                href={icon.href}
                target="_blank"
                rel="noreferrer"
                className="group absolute flex flex-col items-center gap-2"
                style={{
                  left: `${icon.leftPct}%`,
                  top: `${icon.topPct}%`,
                  x: "-50%",
                  y: iconsY,
                  opacity: iconsOpacity,
                }}
              >
                <motion.span
                  className="relative block h-24 w-24 shrink-0 sm:h-36 sm:w-36"
                  style={{ filter: iconsBrightnessFilter }}
                >
                  {/* Against the near-solid-black backdrop at this point in
                      the sequence, a dark contact shadow is literally
                      invisible -- what actually sells "floating in air" here
                      is a soft ambient glow underneath instead, like bounce
                      light off a surface that isn't shown. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-2 -bottom-4 h-8 rounded-full bg-white/25 blur-lg transition-opacity duration-200 group-hover:opacity-70"
                  />
                  <img
                    src={icon.iconUrl}
                    alt={icon.name}
                    className="relative h-full w-full rounded-[24%] object-cover shadow-[0_4px_10px_rgba(0,0,0,0.5),0_22px_45px_-10px_rgba(0,0,0,0.85)] ring-1 ring-white/15 transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
                    style={{ filter: "drop-shadow(0 14px 26px rgba(255,255,255,0.12))" }}
                  />
                  {/* Glossy top highlight -- a thin bright edge along the
                      upper-left, like light catching a rounded, lifted
                      surface -- sells the 3D read without needing an actual
                      3D render. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[24%]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 22%, transparent 45%, transparent 100%)",
                    }}
                  />
                </motion.span>
                <span className="text-sm font-semibold uppercase tracking-wide text-white/90 sm:text-base">
                  {icon.name}
                </span>
                <span className="rounded-full border border-white/20 bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300 sm:text-xs">
                  {icon.statusLabel}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
