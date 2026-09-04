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

/* Dove il pavimento incontra il vuoto. Cade appena sotto la base dei
   telefoni, che con le misure qui sotto finiscono intorno al 77%: piu
   in alto l'orizzonte li taglia a meta, piu in basso tornano a
   galleggiare nel nero. */
const HORIZON = "78%";

function hexToRgba(hex: string, alpha: number): string {
  const v = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`;
}

/* Monospazio di sistema per le letture tecniche (stato, etichette dei
   dati, numeri dei passi): dice "strumento" senza caricare un font. */
const MONO = 'ui-monospace, SFMono-Regular, Menlo, "Roboto Mono", monospace';

/* Piani della scena. L'insegna col nome sta DIETRO il telefono al
   centro -- che deve restare l'oggetto piu vicino -- ma DAVANTI alle
   due laterali, che sono in fondo alla stanza: e' quello che fa
   leggere la profondita invece di appiattire tutto su un piano solo. */
const Z = { laterali: 1, insegna: 2, centrale: 12 } as const;

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className="h-px w-4" style={{ backgroundColor: color }} />
      <span
        className="text-[9px] font-bold uppercase text-white/50"
        style={{ letterSpacing: "0.24em", fontFamily: MONO }}
      >
        {children}
      </span>
    </span>
  );
}

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
          background: `radial-gradient(120% 85% at 50% 6%, ${scene.core}47 0%, ${scene.glow}1E 30%, transparent 66%)`,
        }}
        transition={{ duration: DUR, ease: EASE }}
      />
      {/* Un secondo alone, largo e basso, dal lato opposto: due sorgenti
          invece di una sola fanno cambiare la stanza INTERA quando si
          gira il tamburo, non solo la fascia in alto. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{
          background: `radial-gradient(90% 60% at 50% 78%, ${scene.glow}24 0%, ${scene.core}12 40%, transparent 72%)`,
        }}
        transition={{ duration: DUR, ease: EASE }}
      />
      {/* ---------- La stanza senza fine ----------
          Tre strati e nient'altro: un pavimento in prospettiva che
          scappa verso un orizzonte, una riga di luce dove il pavimento
          finisce, e la foschia che mangia le linee prima che arrivino
          al punto di fuga. Basta questo perche i telefoni smettano di
          galleggiare nel nero e sembrino appoggiati su qualcosa che
          continua oltre lo schermo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0"
        style={{ top: HORIZON, bottom: 0, perspective: "260px", perspectiveOrigin: "50% 0%" }}
      >
        <motion.div
          className="absolute inset-0 origin-top"
          style={{
            transform: "rotateX(72deg) scale(2.4)",
            // Celle grandi: una griglia fitta a questa inclinazione
            // diventa moire' appena lo schermo non e' a densita' intera.
            backgroundSize: "84px 84px",
            /* La griglia si spegne quasi subito, in alto e in basso: in
               alto perche linee nitide fino al punto di fuga leggono
               come texture piatta invece che come distanza, in basso
               perche sotto ci passa il nome dell'app e una griglia
               dietro al testo lo rende faticoso da leggere. */
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 26%, #000 48%, transparent 72%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 26%, #000 48%, transparent 72%)",
          }}
          animate={{
            // Appena percepibile: la stanza deve sentirsi, non farsi
            // guardare. Una griglia squillante e' un fondale anni
            // Ottanta, non profondita.
            backgroundImage: `linear-gradient(to right, ${scene.core}17 1px, transparent 1px), linear-gradient(to bottom, ${scene.core}17 1px, transparent 1px)`,
          }}
          transition={{ duration: DUR, ease: EASE }}
        />
      </div>

      {/* La riga dell'orizzonte: dove il pavimento finisce e comincia
          il vuoto. E' la cosa che da la scala a tutto il resto. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{ top: HORIZON }}
        animate={{ background: `linear-gradient(to right, transparent, ${scene.core}80 30%, ${scene.glow}99 50%, ${scene.core}80 70%, transparent)` }}
        transition={{ duration: DUR, ease: EASE }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0"
        style={{ top: `calc(${HORIZON} - 14vh)`, height: "28vh" }}
        animate={{ background: `radial-gradient(60% 50% at 50% 50%, ${scene.core}33, transparent 70%)` }}
        transition={{ duration: DUR, ease: EASE }}
      />

      {/* Foschia bassa: da spessore all'aria e, soprattutto, restituisce
          un fondo pulito sotto il nome dell'app e i comandi. Griglia e
          riflessi si spengono dentro questa fascia invece di correre
          dietro al testo. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
        animate={{
          background: `linear-gradient(to top, #08070A 0%, #08070A 55%, ${scene.core}14 78%, transparent 100%)`,
        }}
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

      {/* ---------- Il nome, grande, dentro la stanza ----------
          Non piu un fantasma quasi invisibile: e un'insegna vera, con
          spessore. L'inclinazione e la stessa del pavimento, cosi la
          parola sta NELLA stanza invece che essere incollata sul vetro
          davanti; il rilievo e una pila di ombre che scende in diagonale
          (la stessa direzione della luce del resto della scena) e prende
          la tinta dell'app, non un grigio qualsiasi. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[13%] flex select-none justify-center px-4"
        style={{ perspective: "1100px", zIndex: Z.insegna }}
        /* Con la scheda aperta l'insegna si spegne: il nome grande ce
           l'ha gia la scheda, e tenerla accesa la faceva finire sotto
           al testo, illeggibili tutte e due. */
        animate={{ opacity: selected ? 0 : 1 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={scene.id}
            initial={{ opacity: 0, y: 26, rotateX: 14, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, rotateX: 6, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -26, rotateX: 14, filter: "blur(16px)" }}
            transition={{ duration: DUR, ease: EASE }}
            className="whitespace-nowrap font-display-hero font-black uppercase leading-none text-white"
            style={{
              /* Sta SOPRA i telefoni, non in mezzo: quindi puo essere
                 bianco pieno e va letto per primo. La misura si tiene
                 dentro la finestra invece di sfondarla -- una parola
                 tagliata ai lati non e' un titolo, e' un ritaglio. */
              fontSize: narrow ? "clamp(40px, 13vw, 62px)" : "clamp(62px, 8.5vw, 132px)",
              letterSpacing: "-0.035em",
              transformOrigin: "50% 100%",
              /* Rilievo, non contorno: due piani scuri che scendono in
                 diagonale danno spessore senza sporcare il bianco, e un
                 alone nella tinta dell'app lo stacca dal fondo. */
              textShadow: [
                `0 2px 0 ${hexToRgba(scene.core, 0.55)}`,
                "0 5px 0 rgba(9,8,14,0.9)",
                "0 10px 22px rgba(0,0,0,0.75)",
                `0 0 70px ${hexToRgba(scene.glow, 0.35)}`,
              ].join(", "),
            }}
          >
            {scene.name.replace(" AI", "")}
          </motion.span>
        </AnimatePresence>
      </motion.div>

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
            className="absolute inset-x-0 top-[8%] z-20 px-6 text-center text-[10px] font-semibold uppercase text-white/55 sm:text-xs"
            style={{ letterSpacing: "0.28em" }}
          >
            {t.familyThesis}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ---------- Il tamburo ---------- */}
      <motion.div
        className="absolute inset-0"
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
                height: "min(50vh, calc(100dvh - 26rem))",
                top: "52%",
                zIndex: isCenter || isSelected ? Z.centrale : Z.laterali,
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

                {/* Il riflesso: la stessa scocca ribaltata sotto la
                    base, sfocata e in dissolvenza. E' questo -- non la
                    griglia -- a far leggere il telefono come appoggiato
                    su una superficie invece che incollato sul fondo.
                    Fuori dal bottone: e decorazione, non un secondo
                    bersaglio da toccare. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-full h-full origin-top"
                  style={{
                    transform: "scaleY(-1)",
                    opacity: isCenter || isSelected ? 0.26 : 0.14,
                    filter: "blur(3px)",
                    maskImage: "linear-gradient(to top, transparent 8%, rgba(0,0,0,0.75) 62%)",
                    WebkitMaskImage: "linear-gradient(to top, transparent 8%, rgba(0,0,0,0.75) 62%)",
                  }}
                >
                  <PhoneMock app={app} language={language} dimmed />
                </div>
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
                  {/* Il nome non si ripete qui: ora sta grande in cima.
                      Resta la promessa, che e' l'unica cosa che questa
                      riga deve aggiungere. */}
                  <p className="max-w-md text-[14px] leading-snug text-white/80 sm:text-[16px]">
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

            {/* Penombra, non contenitore: una sfumatura che scurisce la
                parte di stanza dove atterra il testo. Non ha bordi ne
                angoli, quindi non legge come un pannello appoggiato
                sopra -- ma da al bianco il contrasto per essere letto.
                Sale dal basso su telefono, entra da destra su schermo
                largo, cioe da dove arriva il testo. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden lg:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR, ease: EASE }}
              style={{
                background:
                  "linear-gradient(to left, #08070A 0%, rgba(8,7,10,0.94) 30%, rgba(8,7,10,0.55) 44%, transparent 56%)",
              }}
            />

            <div className="absolute inset-0 flex items-end lg:items-center">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: DUR, ease: EASE, delay: 0.12 }}
                /* Niente contenitore: il testo si apre direttamente
                   nella stanza. Nessun riquadro, nessun bordo, nessun
                   vetro -- una scheda dentro una scatola sembra un
                   volantino appoggiato sopra la scena, non parte della
                   scena. La leggibilita la da lo strato di penombra
                   qui sotto, che e' una sfumatura e non una scatola. */
                /* Su telefono scorre TUTTA la schermata, non un riquadro
                   dentro la schermata: il contenitore e alto quanto la
                   finestra e il testo comincia sotto al telefono grazie
                   al padding in cima. Prima era alto 64dvh e il suo
                   bordo superiore tagliava il testo di netto a meta
                   parola -- da li l'impressione del riquadro che scorre.
                   Lo sfondo scuro sta ATTACCATO al contenuto, quindi
                   scorre con lui e il testo resta leggibile anche quando
                   passa sopra al telefono. */
                className="relative ml-auto flex h-full w-full flex-col gap-5 overflow-y-auto overflow-x-hidden overscroll-contain px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[46dvh] lg:h-auto lg:max-h-[88dvh] lg:w-[46%] lg:px-0 lg:pt-9 lg:pb-9 lg:mr-14 xl:w-[42%]"
                style={{
                  backgroundImage: narrow
                    ? "linear-gradient(to bottom, transparent 0, rgba(8,7,10,0.55) 38dvh, #08070A 46dvh)"
                    : undefined,
                }}
              >
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: selected.core,
                        boxShadow: `0 0 10px 2px ${hexToRgba(selected.core, 0.7)}`,
                      }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ letterSpacing: "0.3em", color: selected.core, fontFamily: MONO }}
                    >
                      {selected.status === "live" ? t.statusLive : t.statusPresto}
                    </span>
                  </span>
                  <h2 className="font-display text-[2rem] font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
                    {selected.name}
                  </h2>
                </div>

                {/* Testo piu grande e piu contrastato di prima: questa e
                    la riga che deve convincere, non un sottotitolo da
                    strizzare gli occhi. */}
                <p className="text-[16px] leading-[1.45] text-white/85 sm:text-xl">
                  {selected.tagline[language]}
                </p>

                {/* La tesi, declinata: e la riga che spiega il modello --
                    l'AI capisce, Amazon consegna. Barra di colore a
                    sinistra invece di una cornice tutt'intorno: guida
                    l'occhio all'inizio della riga. */}
                <p
                  className="py-1 pl-4 text-[15px] font-semibold leading-[1.45] text-white sm:text-[17px]"
                  style={{ borderLeft: `2px solid ${selected.core}` }}
                >
                  {selected.thesis[language]}
                </p>

                {/* Cosa fa */}
                <ul className="flex flex-col gap-3">
                  {selected.features[language].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: hexToRgba(selected.core, 0.16),
                          boxShadow: `inset 0 0 0 1px ${hexToRgba(selected.core, 0.45)}`,
                        }}
                      >
                        <Check className="h-3 w-3" style={{ color: selected.core }} strokeWidth={3.2} />
                      </span>
                      <span className="text-[15px] leading-[1.45] text-white/85 sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Il percorso: quattro passi numerati su una riga di
                    luce, non pillole sparse. Il numero dice che e una
                    sequenza -- qui lo e davvero. */}
                <div className="flex flex-col gap-3">
                  <SectionLabel color={selected.core}>{t.howItWorks}</SectionLabel>
                  <ol className="relative flex justify-between gap-1">
                    <span
                      aria-hidden
                      className="absolute left-0 right-0 top-[11px] h-px"
                      style={{
                        background: `linear-gradient(to right, ${hexToRgba(selected.core, 0.55)}, ${hexToRgba(selected.core, 0.12)})`,
                      }}
                    />
                    {selected.steps[language].map((step, i) => (
                      <li key={i} className="relative flex flex-1 flex-col items-center gap-2 text-center">
                        <span
                          className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{
                            backgroundColor: "#0A0910",
                            boxShadow: `inset 0 0 0 1.5px ${selected.core}`,
                            fontFamily: MONO,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-[11px] font-medium leading-tight text-white/70 sm:text-xs">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Dati verificabili, presentati come una lettura da
                    strumento: etichetta minuta in monospazio, valore
                    grande. Righe separate da un filo, non scatole --
                    quattro scatole in fila leggono come quattro bottoni
                    da premere. */}
                <div className="flex flex-col gap-2">
                  <SectionLabel color={selected.core}>{t.specsLabel}</SectionLabel>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {selected.specs.map((spec, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-1 border-t pt-2"
                        style={{ borderColor: "rgba(255,255,255,0.1)" }}
                      >
                        <dt
                          className="text-[9px] font-bold uppercase text-white/45"
                          style={{ letterSpacing: "0.2em", fontFamily: MONO }}
                        >
                          {spec.label[language]}
                        </dt>
                        <dd className="text-[15px] font-semibold leading-tight text-white">
                          {spec.value[language]}
                        </dd>
                      </div>
                    ))}
                  </dl>
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
                    /* In hover si SOLLEVA, non si allarga. Ingrandendosi (scale 1.02)
                       un pulsante largo quanto il pannello sfora di 6px, e
                       siccome overflow-y:auto costringe l'altro asse da
                       `visible` ad `auto`, quei 6px facevano comparire una
                       barra di scorrimento orizzontale sotto. Il movimento
                       verticale da la stessa risposta al tocco senza
                       toccare la larghezza. */
                    className="group mt-1 flex items-center justify-center gap-2 rounded-full bg-white py-4 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
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
