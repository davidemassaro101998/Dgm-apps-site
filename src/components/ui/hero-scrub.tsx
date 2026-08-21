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

    // Scroll events can fire far more often than the screen actually
    // repaints -- coalesce with rAF so at most one draw happens per frame.
    let rafId = 0;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        applyProgress();
      });
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

    applyProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
  // The hand-off: each of the three drawn objects gets its own iris that
  // closes from the outside in, down to a tiny dot -- not one global wipe
  // -- and right as each iris shuts, the matching real icon grows outward
  // from that same point, reading as "the drawing became the icon."
  const IRIS_CLOSE_START = VIDEO_SETTLE_PROGRESS; // 0.835
  const IRIS_CLOSE_END = VIDEO_SETTLE_PROGRESS + 0.045; // 0.88
  const FLASH_PEAK = IRIS_CLOSE_END; // the exact instant of hand-off
  const ICONS_POP_START = IRIS_CLOSE_END;
  const ICONS_POP_MID = VIDEO_SETTLE_PROGRESS + 0.105; // overshoot peak
  const ICONS_POP_END = VIDEO_SETTLE_PROGRESS + 0.15; // 0.985
  const irisRadiusPct = useTransform(scrollYProgress, [IRIS_CLOSE_START, IRIS_CLOSE_END], [46, 0]);
  // A soft, feathered falloff (three stops instead of a hard edge two
  // percentage points apart) reads as the object dissolving away rather
  // than being cut out with a knife -- closer to "real" than a crisp wipe.
  const irisMidPct = useTransform(irisRadiusPct, (r) => r + 6);
  const irisEdgePct = useTransform(irisRadiusPct, (r) => r + 16);
  // A circle inscribed at 46% radius never reaches a square box's corners
  // (they sit at ~70.7% distance from center), so the iris divs render
  // permanent black corner triangles for every scroll position before the
  // close starts -- visible from page load, not just during the hand-off.
  // Keep each iris fully invisible until the exact instant the close begins,
  // snapping in on the same near-instant window as the scrim below so there
  // is never a frame where the corners show but the matching scrim doesn't.
  const irisOpacity = useTransform(scrollYProgress, [IRIS_CLOSE_START, IRIS_CLOSE_START + 0.005], [0, 1]);
  // Solid opaque black (not a translucent rgba) so the square edge of this
  // div never shows as a seam against the surrounding scrim below, however
  // their opacities happen to line up at a given scroll position.
  const irisBackground = useMotionTemplate`radial-gradient(circle, transparent ${irisRadiusPct}%, rgba(0,0,0,0.55) ${irisMidPct}%, rgba(0,0,0,1) ${irisEdgePct}%, rgba(0,0,0,1) 100%)`;
  // Darkens everything outside the three irises -- and critically, snaps to
  // fully opaque almost instantly (a 0.01-wide ramp) right as the irises
  // start closing, rather than fading in gradually over the same window
  // the irises take to close. The iris's own "outside the circle" area is
  // always instantly solid black the moment it starts shrinking (it has no
  // opacity ramp of its own, only its transparent hole animates) -- if this
  // scrim faded in slowly in parallel, the two wouldn't match for most of
  // the close and it would read as a hard-edged black square sitting on a
  // still-lit background. Snapping this dark first turns the whole moment
  // into "everything already dark except a shrinking spotlight on each
  // object," which is the actual "outside to inside" effect that was asked
  // for -- not two independently-timed darkenings that drift apart.
  const iconScrimOpacity = useTransform(scrollYProgress, [IRIS_CLOSE_START, IRIS_CLOSE_START + 0.01], [0, 1]);
  // A brief bright burst right at the exact hand-off instant -- the object
  // doesn't just vanish into a dark dot, it flashes into light and the icon
  // condenses out of that light, which is what actually reads as "real"
  // materialization instead of a wipe/mask trick.
  const flashOpacity = useTransform(
    scrollYProgress,
    [FLASH_PEAK - 0.02, FLASH_PEAK, FLASH_PEAK + 0.05],
    [0, 0.9, 0]
  );
  const iconsOpacity = useTransform(scrollYProgress, [ICONS_POP_START, ICONS_POP_START + 0.02], [0, 1]);
  // A slight overshoot (grows past full size, then eases back down) instead
  // of a linear scale-up -- the small bit of "bounce" is what sells it as a
  // physical thing settling into place rather than a flat CSS tween.
  const iconsScale = useTransform(
    scrollYProgress,
    [ICONS_POP_START, ICONS_POP_MID, ICONS_POP_END],
    [0.1, 1.12, 1]
  );
  const iconsPointerEvents = useTransform(scrollYProgress, (v) => (v > ICONS_POP_END ? "auto" : "none"));

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
            <canvas ref={canvasRef} className="pointer-events-none h-full w-full" aria-hidden />
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
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,1) 35%, rgba(0,0,0,1) 100%)",
          }}
        />

        {/* Each drawn object gets its own iris, closing from the outside in
            down to a tiny dot right at the settle point -- not one global
            wipe -- so it reads as that specific object shutting off. */}
        <div className="absolute inset-x-0 top-[56%] z-[3] flex justify-center sm:top-[46%]">
          <div className="relative h-[34vh] w-full max-w-lg">
            {icons.map((icon) => (
              <motion.div
                key={icon.id}
                aria-hidden
                className="absolute h-32 w-32 sm:h-44 sm:w-44"
                style={{
                  left: `${icon.leftPct}%`,
                  top: `${icon.topPct}%`,
                  x: "-50%",
                  y: "-50%",
                  opacity: irisOpacity,
                  background: irisBackground,
                }}
              />
            ))}
          </div>
        </div>

        {/* A brief bright flash at each object's exact position, right as
            its iris shuts -- reads as the drawing condensing into light and
            the icon crystallizing out of it, instead of just popping in on
            top of a plain dark hole. Additive blend so it brightens rather
            than paints a flat white disc. */}
        <div className="absolute inset-x-0 top-[56%] z-[3] flex justify-center sm:top-[46%]" aria-hidden>
          <div className="relative h-[34vh] w-full max-w-lg">
            {icons.map((icon) => (
              <motion.div
                key={icon.id}
                className="absolute h-32 w-32 sm:h-44 sm:w-44"
                style={{
                  left: `${icon.leftPct}%`,
                  top: `${icon.topPct}%`,
                  x: "-50%",
                  y: "-50%",
                  opacity: flashOpacity,
                  mixBlendMode: "plus-lighter",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(196,181,253,0.5) 35%, rgba(34,211,238,0.2) 60%, transparent 75%)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Real, tappable icons -- each grows outward from the exact point/
            moment its own drawn object's iris shut, like the drawing
            itself turned into the icon, rather than sliding in separately.
            Bigger than the "in-flight" hand-off state, with a status pill
            so this genuinely reads as the catalog. */}
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
                  scale: iconsScale,
                  opacity: iconsOpacity,
                }}
              >
                <img
                  src={icon.iconUrl}
                  alt={icon.name}
                  className="h-24 w-24 rounded-[24%] object-cover shadow-[0_24px_50px_-8px_rgba(0,0,0,0.8)] transition-transform duration-200 group-hover:scale-110 group-active:scale-95 sm:h-36 sm:w-36"
                />
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
