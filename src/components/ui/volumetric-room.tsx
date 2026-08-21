import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { SpotLight } from "@react-three/drei";

const METAL_NOISE =
  'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")';
const GRAIN_NOISE =
  'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22g%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23g)%22/%3E%3C/svg%3E")';

const BACK_WALL = { tl: [22, 10], tr: [78, 10], br: [78, 70], bl: [22, 70] } as const;
// Due fari invece di tre, ma non troppo ravvicinati: su telefono, troppo
// vicini finivano per sembrare un unico faro schiacciato invece di due
// fasci ben distinti che si fondono scendendo. Un po' più aperti, restano
// due fasci leggibili che comunque si incontrano verso il basso.
const SPOTS = [37, 63];
const LIGHT_COLOR = "196,181,253"; // violet-300, in tema col brand invece del bianco freddo originale

// Il faretto era disegnato con dimensioni fisse in px, tarate per desktop:
// su schermi stretti risultava sproporzionatamente grande rispetto al
// resto della hero. clamp(min, preferito-in-vw, max) lo fa scalare in modo
// continuo con la larghezza dello schermo — piccolo su telefono, invariato
// su desktop — senza breakpoint fissi che scattano bruscamente.
const FIXTURE_CYL_W = "clamp(8px, 1.7vw, 14px)";
const FIXTURE_CYL_H = "clamp(20px, 4vw, 34px)";
const FIXTURE_NECK_W = "clamp(5px, 1vw, 8px)";
const FIXTURE_NECK_H = "clamp(11px, 2.1vw, 18px)";
const FIXTURE_GAP = "clamp(4px, 0.7vw, 6px)";
const FIXTURE_HEAD_W = "clamp(34px, 6.3vw, 54px)";
const FIXTURE_HEAD_H = "clamp(40px, 7.5vw, 64px)";
const FIXTURE_BULB_W = "clamp(38px, 6.8vw, 58px)";
const FIXTURE_BULB_H = "clamp(11px, 2.1vw, 18px)";
const FIXTURE_GLOW_W = "clamp(22px, 4vw, 34px)";
const FIXTURE_GLOW_H = "clamp(7px, 1.2vw, 10px)";
// Altezza totale del faretto (cilindro + collo + gap + testa)
const FIXTURE_TOTAL_H = `calc(${FIXTURE_CYL_H} + ${FIXTURE_NECK_H} + ${FIXTURE_GAP} + ${FIXTURE_HEAD_H})`;
const BEAM_CANVAS_WIDTH = "clamp(130px, 25vw, 260px)";

function poly(pts: readonly (readonly [number, number])[]) {
  return `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
}

interface SpotItemProps {
  pos: number;
  i: number;
  lightsOn: boolean;
  isFlickering: boolean;
}

function SpotItem({ pos, i, lightsOn, isFlickering }: SpotItemProps) {
  return (
    <div
      className="pointer-events-none absolute flex flex-col items-center"
      style={{
        left: `${pos}%`,
        top: "3%",
        transform: "translateX(-50%)",
        zIndex: 20,
      }}
    >
      {/* 1. Lamp Fixture Graphic */}
      <div className="relative flex flex-col items-center z-30">
        {/* Top Cylinder */}
        <div
          className="relative overflow-hidden rounded-sm border border-zinc-900 shadow-[0_5px_10px_rgba(0,0,0,0.9),inset_0_0_4px_rgba(255,255,255,0.5)]"
          style={{
            width: FIXTURE_CYL_W,
            height: FIXTURE_CYL_H,
            background: "linear-gradient(to right, #666 0%, #ffffff 40%, #999 60%, #333 100%)",
          }}
        >
          <div className="absolute left-1/2 top-[10%] h-[18%] w-[40%] -translate-x-1/2 rounded-full bg-zinc-900 shadow-[inset_0_1px_1px_rgba(0,0,0,1)]" />
          <div className="absolute bottom-[10%] left-1/2 h-[18%] w-[40%] -translate-x-1/2 rounded-full bg-zinc-900 shadow-[inset_0_1px_1px_rgba(0,0,0,1)]" />
        </div>

        {/* Neck */}
        <div
          className="relative border-x border-black bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-950"
          style={{ width: FIXTURE_NECK_W, height: FIXTURE_NECK_H }}
        >
          <div
            className="absolute bottom-[-45%] left-1/2 aspect-square h-[100%] -translate-x-1/2 rounded-full border border-zinc-900 shadow-[0_4px_8px_rgba(0,0,0,1),inset_0_1px_2px_rgba(255,255,255,0.3)]"
            style={{ background: "radial-gradient(circle at top left, #777, #111)" }}
          />
        </div>

        {/* Head Housing & Bulb */}
        <div
          className="relative flex justify-center"
          style={{ marginTop: FIXTURE_GAP, width: FIXTURE_HEAD_W, height: FIXTURE_HEAD_H, perspective: "100px" }}
        >
          <div
            className="absolute inset-0 flex flex-col justify-evenly overflow-hidden rounded-b-2xl rounded-t-sm border border-black shadow-[0_20px_30px_rgba(0,0,0,0.9)]"
            style={{ background: "linear-gradient(to right, #111 0%, #3a3a3a 30%, #555 50%, #2a2a2a 80%, #000 100%)" }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay" style={{ backgroundImage: METAL_NOISE }} />
            <div className="z-10 h-[2px] w-full bg-black/90 shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
            <div className="z-10 h-[2px] w-full bg-black/90 shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
            <div className="z-10 h-[2px] w-full bg-black/90 shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
          </div>

          <div
            className="absolute bottom-[-6px] z-10 flex items-center justify-center overflow-hidden rounded-[50%] border-2 border-zinc-900 shadow-[0_10px_15px_rgba(0,0,0,1)]"
            style={{ width: FIXTURE_BULB_W, height: FIXTURE_BULB_H, background: "radial-gradient(ellipse at center, #222, #000)" }}
          >
            <div
              className="rounded-[50%] transition-all duration-700"
              style={{
                width: FIXTURE_GLOW_W,
                height: FIXTURE_GLOW_H,
                background: lightsOn ? "#e9d5ff" : "#111",
                boxShadow: lightsOn ? `0 0 20px 8px rgba(196,181,253,0.8), inset 0 0 8px #fff` : `inset 0 2px 5px rgba(0,0,0,0.9)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. 3D Volumetric Light Cone - Permanently anchored directly below the bulb center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: lightsOn ? 1 : 0 }}
        transition={isFlickering ? { duration: 0 } : { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none relative -mt-[2px] z-10"
        style={{
          width: BEAM_CANVAS_WIDTH,
          height: "clamp(460px, 75vh, 780px)",
          willChange: "opacity",
          mixBlendMode: "screen",
          maskImage: "linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.5) 80%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.5) 80%, transparent 100%)",
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 10], fov: 45 }}
          shadows={false}
          dpr={[1, 1.25]}
          frameloop="always"
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
          style={{ position: "absolute", inset: 0 }}
        >
          <ambientLight intensity={0.5} />
          <SpotLight
            distance={12}
            angle={0.25}
            attenuation={6}
            anglePower={5}
            color={`rgb(${LIGHT_COLOR})`}
            position={[0, 4.142, 0]}
            volumetric
            opacity={1}
            radiusTop={0.08}
            radiusBottom={3.8}
          />
        </Canvas>
      </motion.div>
    </div>
  );
}

function Room({ lightsOn, isFlickering }: { lightsOn: boolean; isFlickering: boolean }) {
  const { tl, tr, br, bl } = BACK_WALL;
  const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#07070b]">
      <div className="absolute inset-0" style={{ clipPath: poly([tl, tr, br, bl]), background: "linear-gradient(to bottom, rgba(20,20,22,1) 0%, rgba(8,8,10,1) 100%)" }} />
      <div className="absolute inset-0" style={{ clipPath: poly([[0, 0], [100, 0], tr, tl]), background: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 100%)" }} />
      <div className="absolute inset-0" style={{ clipPath: poly([[0, 0], tl, bl, [0, 100]]), background: "linear-gradient(to right, rgba(8,8,10,1) 0%, rgba(18,18,20,1) 70%, rgba(26,26,28,1) 100%)" }} />
      <div className="absolute inset-0" style={{ clipPath: poly([[100, 0], tr, br, [100, 100]]), background: "linear-gradient(to left, rgba(8,8,10,1) 0%, rgba(18,18,20,1) 70%, rgba(26,26,28,1) 100%)" }} />
      <div className="absolute inset-0" style={{ clipPath: poly([[0, 100], [100, 100], br, bl]), backgroundColor: "rgb(7,7,11)" }} />

      <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 10 }}>
        <defs>
          <linearGradient id="baseGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="20%" stopColor="white" stopOpacity="0.5" />
            <stop offset="80%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.18" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={`${bl[0]}%`} y1={`${bl[1]}%`} x2={`${br[0]}%`} y2={`${br[1]}%`} stroke="rgba(255,255,255,0.2)" strokeWidth="5" style={{ filter: "blur(3px)" }} />
        <line x1={`${bl[0]}%`} y1={`${bl[1]}%`} x2={`${br[0]}%`} y2={`${br[1]}%`} stroke="url(#baseGrad)" strokeWidth="1" />
        <line x1={`${tl[0]}%`} y1={`${tl[1]}%`} x2={`${bl[0]}%`} y2={`${bl[1]}%`} stroke="url(#vGrad)" strokeWidth="1" />
        <line x1={`${tr[0]}%`} y1={`${tr[1]}%`} x2={`${br[0]}%`} y2={`${br[1]}%`} stroke="url(#vGrad)" strokeWidth="1" />
      </svg>

      {/* Ambient floor illumination */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 15,
          opacity: lightsOn ? 1 : 0,
          transition: isFlickering ? "none" : `opacity 700ms ${EASE}`,
          mixBlendMode: "screen",
          background: [
            ...SPOTS.map((x) => `radial-gradient(ellipse 55% 55% at ${x}% 62%, rgba(${LIGHT_COLOR},0.18) 0%, transparent 75%)`),
            `radial-gradient(ellipse 80% 50% at 50% 70%, rgba(${LIGHT_COLOR},0.12) 0%, transparent 80%)`,
          ].join(", "),
        }}
      />

      {/* Unified Spot Items (Lamp + Beam) */}
      {SPOTS.map((pos, i) => (
        <SpotItem key={i} pos={pos} i={i} lightsOn={lightsOn} isFlickering={isFlickering} />
      ))}

      <div className="pointer-events-none absolute left-0 top-[4%] h-[80px] w-full bg-gradient-to-b from-black/60 to-transparent blur-xl" style={{ zIndex: 29 }} />
      <div className="absolute inset-0" style={{ zIndex: 30, clipPath: poly([[0, 0], [100, 0], tr, tl]) }}>
        <div
          className="absolute top-[3%] left-0 h-[26px] w-full"
          style={{
            background: "linear-gradient(to bottom, #111 0%, #3a3a3a 30%, #555 50%, #2a2a2a 80%, #000 100%)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.9), 0 10px 20px -5px rgba(0,0,0,0.8)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay" style={{ backgroundImage: METAL_NOISE }} />
        </div>
      </div>

      {/* Soft Vignette and Seamless Bottom Blend into Page Background */}
      <div className="absolute inset-0" style={{ zIndex: 22, background: "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 50%, rgba(7,7,11,0.6) 100%)" }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#07070b]/80 to-[#07070b]" style={{ zIndex: 28 }} />
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 25, opacity: 0.04, mixBlendMode: "screen", backgroundImage: GRAIN_NOISE, backgroundSize: "256px 256px" }} />
    </div>
  );
}

export function VolumetricRoom({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [lightsOn, setLightsOn] = useState(false);
  const [isFlickering, setIsFlickering] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (prefersReducedMotion) {
      setIsFlickering(false);
      setLightsOn(true);
      return;
    }

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const runFlicker = async () => {
      await sleep(500);
      if (!mounted.current) return;
      setLightsOn(true);
      await sleep(90);
      setLightsOn(false);
      await sleep(260);
      setLightsOn(true);
      await sleep(50);
      setLightsOn(false);
      await sleep(180);
      setLightsOn(true);
      if (!mounted.current) return;
      setIsFlickering(false);
    };
    runFlicker();

    return () => {
      mounted.current = false;
    };
  }, [prefersReducedMotion]);

  return (
    <div className={className}>
      <Room lightsOn={lightsOn} isFlickering={isFlickering} />
    </div>
  );
}