import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, X, Lock } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { apps } from "../data/apps";
import { PhoneMock } from "./PhoneMock";

/* La curva di tutta la scena. Expo-out: parte decisa e si adagia --
   un movimento che sembra pesante e comandato, non un'interpolazione
   lineare. Una sola curva per tutto, cosi rotazione, colore e pannello
   sembrano lo stesso gesto e non tre animazioni scollegate. */
const EASE = [0.16, 1, 0.3, 1] as const;
const DUR = 0.65;

/* Le tre posizioni del tamburo. Non un cilindro a 120 gradi reale:
   a 120 gradi le due laterali finirebbero di taglio, quasi invisibili,
   e la richiesta e vederle tutte e tre insieme. Angolo piu dolce, spinta
   indietro sull'asse Z e scala ridotta: la rotazione resta leggibile
   come un tamburo che gira, ma le tre app restano tutte riconoscibili.

   La posizione orizzontale e `left` in percentuale del palco (cioe della
   finestra), non uno spostamento `x`: in framer una x percentuale si
   calcola sulla larghezza dell'ELEMENTO -- un telefono stretto -- e le
   due laterali finivano appiccicate sopra la centrale invece che ai
   lati dello schermo. */
type Slot = { left: number; z: number; rotateY: number; scale: number; opacity: number; blur: number };

const SLOT_WIDE: Record<SlotName, Slot> = {
  center: { left: 50, z: 0, rotateY: 0, scale: 1, opacity: 1, blur: 0 },
  right: { left: 78, z: -320, rotateY: -40, scale: 0.62, opacity: 0.48, blur: 1.6 },
  left: { left: 22, z: -320, rotateY: 40, scale: 0.62, opacity: 0.48, blur: 1.6 },
};

/* Su schermo stretto le laterali vanno spinte piu fuori e rimpicciolite
   ancora: a parita di percentuali si sovrapporrebbero alla centrale. */
const SLOT_NARROW: Record<SlotName, Slot> = {
  center: { left: 50, z: 0, rotateY: 0, scale: 1, opacity: 1, blur: 0 },
  right: { left: 88, z: -320, rotateY: -38, scale: 0.5, opacity: 0.42, blur: 1.6 },
  left: { left: 12, z: -320, rotateY: 38, scale: 0.5, opacity: 0.42, blur: 1.6 },
};

type SlotName = "center" | "right" | "left";

function slotFor(index: number, activeIndex: number, total: number): SlotName {
  const raw = (index - activeIndex + total) % total;
  if (raw === 0) return "center";
  if (raw === 1) return "right";
  return "left";
}

export function RevolverHero({
  requestedAppId,
  onRequestHandled,
}: {
  /** Un'app scelta dal menu: il tamburo ci gira sopra e ne apre la scheda. */
  requestedAppId?: string | null;
  onRequestHandled?: () => void;
} = {}) {
  const { language, t } = useLanguage();
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* Le due geometrie del tamburo non sono esprimibili con classi
     responsive (finiscono dentro un oggetto animato da framer, non nel
     className), quindi la larghezza va misurata davvero. */
  const [narrow, setNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    function onResize() {
      setNarrow(window.innerWidth < 640);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const slots = narrow ? SLOT_NARROW : SLOT_WIDE;

  const active = apps[activeIndex];
  const selected = useMemo(() => apps.find((a) => a.id === selectedId) ?? null, [selectedId]);
  /* Il colore che comanda la scena: quello dell'app aperta se ce n'e
     una, altrimenti quello al centro del tamburo. */
  const scene = selected ?? active;

  const rotate = useCallback(
    (dir: 1 | -1) => {
      if (selectedId) return;
      setActiveIndex((prev) => (prev + dir + apps.length) % apps.length);
    },
    [selectedId]
  );

  // Richiesta dal menu: porta il tamburo su quell'app e apre la scheda.
  useEffect(() => {
    if (!requestedAppId) return;
    const index = apps.findIndex((a) => a.id === requestedAppId);
    if (index >= 0) {
      setActiveIndex(index);
      setSelectedId(requestedAppId);
    }
    onRequestHandled?.();
  }, [requestedAppId, onRequestHandled]);

  // Frecce da tastiera: il tamburo si gira anche senza mouse, e Esc
  // chiude la scheda aperta.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") rotate(1);
      else if (e.key === "ArrowLeft") rotate(-1);
      else if (e.key === "Escape") setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rotate]);

  const isOpenable = scene.status !== "presto";

  return (
    <section
      className="relative h-[100dvh] w-full overflow-hidden bg-[#08070A]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ---------- Ambiente: l'alone della tinta di categoria ----------
          Il fondo resta quasi nero (il nero alza il valore percepito e
          lascia tutta la salienza agli accenti); e la tinta a inondare
          la scena dall'alto, cambiando con l'app. Nessun colore piatto
          a tutto schermo: un alone che si accende dietro il prodotto. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{
          background: `radial-gradient(120% 85% at 50% 8%, ${scene.core}33 0%, ${scene.glow}14 32%, transparent 68%)`,
        }}
        transition={{ duration: DUR, ease: EASE }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
        animate={{ background: `linear-gradient(to top, ${scene.core}1F, transparent)` }}
        transition={{ duration: DUR, ease: EASE }}
      />

      {/* Grana: rompe le sfumature larghe, che su schermi a 8 bit
          fasciano visibilmente. Costa un solo elemento fisso. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      {/* ---------- Parola fantasma dietro la scena ---------- */}
      <div className="pointer-events-none absolute inset-x-0 top-[19%] z-[2] flex select-none justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={scene.id}
            initial={{ opacity: 0, y: 24, filter: "blur(18px)" }}
            animate={{ opacity: 0.055, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, filter: "blur(18px)" }}
            transition={{ duration: DUR, ease: EASE }}
            className="whitespace-nowrap font-display-hero font-black uppercase leading-none text-white"
            style={{ fontSize: "clamp(64px, 17vw, 240px)", letterSpacing: "-0.03em" }}
          >
            {scene.name.replace(" AI", "")}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ---------- La tesi della famiglia ----------
          Una riga sola, sempre presente: e la cosa che tutte e tre le app
          fanno. Sparisce quando si apre una scheda, dove la stessa tesi
          torna declinata sul dominio. */}
      <AnimatePresence>
        {!selected && (
          <motion.p
            key="thesis"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: DUR, ease: EASE }}
            className="absolute inset-x-0 top-[11.5%] z-20 px-6 text-center text-[10px] font-semibold uppercase text-white/55 sm:text-xs"
            style={{ letterSpacing: "0.28em" }}
          >
            {t.familyThesis}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ---------- Il tamburo ---------- */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{ perspective: 1500 }}
        drag={selected || reduced ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.14}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 60) rotate(info.offset.x < 0 ? 1 : -1);
        }}
      >
        {apps.map((app, index) => {
          const slot = slotFor(index, activeIndex, apps.length);
          const pos = slots[slot];
          const isCenter = slot === "center";
          const isSelected = selected?.id === app.id;
          const hiddenBySelection = !!selected && !isSelected;

          return (
            <motion.div
              key={app.id}
              className="absolute w-auto"
              style={{
                // Le proporzioni del render della scocca, non un valore
                // scelto a occhio: se non combaciano, l'immagine della
                // cornice si deforma.
                aspectRatio: "714 / 1264",
                transformStyle: "preserve-3d",
                /* Il telefono non prende un'altezza fissa in vh: prende
                   quella che avanza dopo la riga della tesi in alto e la
                   pulsantiera in basso, altrimenti su finestre basse il
                   nome dell'app finisce sopra lo schermo del telefono. */
                height: "min(56vh, calc(100dvh - 22rem))",
                top: "43%",
              }}
              animate={
                hiddenBySelection
                  ? // Le due non scelte escono: scendono, rimpiccioliscono
                    // e si spengono. Nessuna resta a mezz'aria a contendere
                    // l'attenzione alla scheda che si sta aprendo.
                    { left: "50%", x: "-50%", y: "-38%", scale: 0.5, opacity: 0, z: -500, rotateY: 0, filter: "blur(6px)" }
                  : isSelected
                  ? // La scelta prende il posto: al centro su schermo
                    // stretto, a sinistra quando c'e spazio per la scheda
                    // (lo spostamento vero e in SelectedPositioner, che lo
                    // fa via classi responsive invece che misurando la
                    // finestra in JavaScript).
                    { left: "50%", x: "-50%", y: "-50%", scale: 1, opacity: 1, z: 0, rotateY: 0, filter: "blur(0px)" }
                  : {
                      left: `${pos.left}%`,
                      x: "-50%",
                      y: "-50%",
                      scale: pos.scale,
                      opacity: pos.opacity,
                      z: pos.z,
                      rotateY: pos.rotateY,
                      filter: `blur(${pos.blur}px)`,
                    }
              }
              transition={{ duration: reduced ? 0 : DUR, ease: EASE }}
            >
              <SelectedPositioner isSelected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    if (selected) return;
                    if (isCenter) setSelectedId(app.id);
                    else setActiveIndex(index);
                  }}
                  aria-label={app.name}
                  className="block h-full w-full cursor-pointer focus:outline-none"
                  style={{ pointerEvents: selected ? "none" : "auto" }}
                >
                  <PhoneMock app={app} language={language} dimmed={!isCenter && !isSelected} />
                </button>
              </SelectedPositioner>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ---------- Modalità tamburo: nome, promessa, frecce ---------- */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            key="carousel-ui"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: DUR, ease: EASE }}
            className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-4 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-5 sm:pb-10"
          >
            <div className="flex flex-col items-center gap-1.5 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <h1 className="font-display text-xl font-black uppercase tracking-tight text-white sm:text-3xl">
                    {active.name}
                  </h1>
                  <p className="max-w-md text-[13px] leading-snug text-white/70 sm:text-[15px]">
                    {active.tagline[language]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-5 sm:gap-7">
              <RoundButton onClick={() => rotate(-1)} label={t.prevApp}>
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
              </RoundButton>

              {/* Il richiamo all'azione: bianco pieno. Su fondo quasi nero
                  e l'elemento col massimo contrasto di luminanza della
                  scena, quindi quello che l'occhio trova per primo -- e
                  resta lo stesso per tutte e tre le app, cosi il gesto da
                  imparare e uno solo. */}
              <button
                type="button"
                onClick={() => setSelectedId(active.id)}
                className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 transition-transform duration-200 hover:scale-[1.04] active:scale-95 sm:px-8 sm:py-3.5"
                style={{ boxShadow: `0 10px 40px -8px ${active.core}` }}
              >
                <span className="font-display text-[13px] font-black uppercase tracking-[0.1em] text-black sm:text-sm">
                  {t.discover}
                </span>
                <ArrowUpRight className="h-4 w-4 text-black transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-[18px] sm:w-[18px]" strokeWidth={2.6} />
              </button>

              <RoundButton onClick={() => rotate(1)} label={t.nextApp}>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
              </RoundButton>
            </div>

            {/* Indicatori: tre tacche, quella attiva si allunga e prende
                la tinta dell'app -- posizione nel tamburo leggibile a
                colpo d'occhio senza contare i telefoni. */}
            <div className="flex items-center gap-1.5">
              {apps.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={a.name}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIndex ? 24 : 8,
                    backgroundColor: i === activeIndex ? a.core : "rgba(255,255,255,0.22)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Modalità scheda: specifiche + azione ---------- */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-30"
          >
            {/* Chiudi */}
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label={t.backToCatalog}
              className="absolute right-4 top-[max(4.5rem,calc(env(safe-area-inset-top)+4rem))] z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-colors hover:border-white/35 hover:text-white sm:right-8"
            >
              <X className="h-5 w-5" strokeWidth={2.2} />
            </button>

            <div className="absolute inset-0 flex items-end lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: DUR, ease: EASE, delay: 0.12 }}
                className="ml-auto flex h-[62dvh] w-full flex-col gap-4 overflow-y-auto overscroll-contain rounded-t-3xl border-t border-white/10 bg-[#0B0A0F]/92 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 backdrop-blur-xl lg:h-auto lg:max-h-[86dvh] lg:w-[46%] lg:rounded-none lg:border-l lg:border-t-0 lg:bg-transparent lg:px-12 lg:backdrop-blur-none xl:w-[42%]"
              >
                <div className="flex flex-col gap-1">
                  <span
                    className="text-[10px] font-bold uppercase"
                    style={{ letterSpacing: "0.26em", color: selected.core }}
                  >
                    {selected.status === "live" ? t.statusLive : t.statusPresto}
                  </span>
                  <h2 className="font-display text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl">
                    {selected.name}
                  </h2>
                </div>

                <p className="text-[15px] leading-snug text-white/75 sm:text-lg">
                  {selected.tagline[language]}
                </p>

                {/* La tesi, declinata: e la riga che spiega il modello --
                    l'AI capisce, Amazon consegna. */}
                <p
                  className="rounded-xl px-4 py-3 text-[13px] font-semibold leading-snug sm:text-[15px]"
                  style={{
                    color: "#FFFFFF",
                    background: `linear-gradient(135deg, ${selected.core}22, ${selected.glow}0D)`,
                    boxShadow: `inset 0 0 0 1px ${selected.core}44`,
                  }}
                >
                  {selected.thesis[language]}
                </p>

                {/* Cosa fa */}
                <ul className="flex flex-col gap-2.5">
                  {selected.features[language].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${selected.core}26` }}
                      >
                        <Check className="h-2.5 w-2.5" style={{ color: selected.core }} strokeWidth={3.2} />
                      </span>
                      <span className="text-[13px] leading-snug text-white/80 sm:text-[15px]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Il percorso dentro l'app */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase text-white/40" style={{ letterSpacing: "0.22em" }}>
                    {t.howItWorks}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                    {selected.steps[language].map((step, i, arr) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white/85"
                          style={{ backgroundColor: "rgba(255,255,255,0.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
                        >
                          {step}
                        </span>
                        {i < arr.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-white/25" strokeWidth={2.5} />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dati verificabili */}
                <div className="grid grid-cols-2 gap-2">
                  {selected.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-0.5 rounded-xl px-3 py-2.5"
                      style={{ backgroundColor: "rgba(255,255,255,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-[9px] font-bold uppercase text-white/40" style={{ letterSpacing: "0.16em" }}>
                        {spec.label[language]}
                      </span>
                      <span className="text-[13px] font-semibold text-white/90">{spec.value[language]}</span>
                    </div>
                  ))}
                </div>

                {/* L'azione. Bianca e piena quando l'app e aperta al
                    pubblico; spenta e bloccata quando non lo e ancora --
                    l'app gira, ma il sito non ci manda nessuno finche
                    non e davvero pronta. */}
                {isOpenable ? (
                  <a
                    href={selected.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group mt-1 flex items-center justify-center gap-2 rounded-full bg-white py-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ boxShadow: `0 14px 44px -10px ${selected.core}` }}
                  >
                    <span className="font-display text-sm font-black uppercase tracking-[0.1em] text-black">
                      {t.useItNow}
                    </span>
                    <ArrowUpRight className="h-[18px] w-[18px] text-black transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.6} />
                  </a>
                ) : (
                  <div
                    className="mt-1 flex cursor-default items-center justify-center gap-2 rounded-full py-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}
                  >
                    <Lock className="h-4 w-4 text-white/45" strokeWidth={2.4} />
                    <span className="font-display text-sm font-black uppercase tracking-[0.1em] text-white/45">
                      {t.statusPresto}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* Quando la scheda e aperta il telefono deve stare a sinistra, ma solo
   dove c'e spazio per mettere le specifiche accanto: sotto lg la scheda
   occupa la meta bassa e il telefono resta centrato in alto. Due
   posizioni diverse per lo stesso elemento, gestite con le classi
   invece che misurando la finestra in JavaScript. */
function SelectedPositioner({ isSelected, children }: { isSelected: boolean; children: React.ReactNode }) {
  return (
    <div
      className={
        isSelected
          ? "h-full w-full origin-center transition-transform duration-[650ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] -translate-y-[22%] scale-[0.62] lg:-translate-x-[62%] lg:translate-y-0 lg:scale-[0.92]"
          : "h-full w-full"
      }
    >
      {children}
    </div>
  );
}

function RoundButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/70 text-white transition-all duration-150 hover:scale-[1.08] hover:border-white hover:bg-white/12 active:scale-95 sm:h-14 sm:w-14"
    >
      {children}
    </button>
  );
}
