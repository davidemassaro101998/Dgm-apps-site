import {
  Heart,
  Users,
  Smile,
  Briefcase,
  Wrench,
  House,
  Trees,
  Hammer,
  Dumbbell,
  HeartPulse,
  Timer,
  Activity,
  Mic,
  Camera,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { AppEntry } from "../data/apps";
import type { Language } from "../context/LanguageContext";

/* Lo schermo dentro il telefono non e uno screenshot: e la UI vera
   ricostruita in miniatura, cosi resta allineata alle app anche quando
   cambiano e non invecchia come un'immagine catturata una volta sola.
   Le quattro scelte sono quelle reali del primo passo di ogni app. */
const SCREEN_CHOICES: Record<string, { icon: LucideIcon; label: Record<Language, string> }[]> = {
  kado: [
    { icon: Heart, label: { it: "Partner", en: "Partner", es: "Pareja", fr: "Partenaire", de: "Partner" } },
    { icon: Users, label: { it: "Famiglia", en: "Family", es: "Familia", fr: "Famille", de: "Familie" } },
    { icon: Smile, label: { it: "Amico", en: "Friend", es: "Amigo", fr: "Ami", de: "Freund" } },
    { icon: Briefcase, label: { it: "Collega", en: "Colleague", es: "Colega", fr: "Collègue", de: "Kollege" } },
  ],
  bricolo: [
    { icon: House, label: { it: "Casa", en: "Home", es: "Casa", fr: "Maison", de: "Haus" } },
    { icon: Trees, label: { it: "Giardino", en: "Garden", es: "Jardín", fr: "Jardin", de: "Garten" } },
    { icon: Wrench, label: { it: "Officina", en: "Workshop", es: "Taller", fr: "Atelier", de: "Werkstatt" } },
    { icon: Hammer, label: { it: "Riparo", en: "Repair", es: "Reparo", fr: "Réparer", de: "Reparieren" } },
  ],
  forma: [
    { icon: Dumbbell, label: { it: "Forza", en: "Strength", es: "Fuerza", fr: "Force", de: "Kraft" } },
    { icon: Activity, label: { it: "Cardio", en: "Cardio", es: "Cardio", fr: "Cardio", de: "Cardio" } },
    { icon: HeartPulse, label: { it: "Recupero", en: "Recovery", es: "Recuperación", fr: "Récupération", de: "Erholung" } },
    { icon: Timer, label: { it: "Mobilità", en: "Mobility", es: "Movilidad", fr: "Mobilité", de: "Mobilität" } },
  ],
};

const SCREEN_QUESTION: Record<string, Record<Language, string>> = {
  kado: {
    it: "Per chi è il regalo?",
    en: "Who is the gift for?",
    es: "¿Para quién es el regalo?",
    fr: "Pour qui est le cadeau ?",
    de: "Für wen ist das Geschenk?",
  },
  bricolo: {
    it: "Dove devi lavorare?",
    en: "Where are you working?",
    es: "¿Dónde vas a trabajar?",
    fr: "Où travaillez-vous ?",
    de: "Wo arbeitest du?",
  },
  forma: {
    it: "Qual è l'obiettivo?",
    en: "What's the goal?",
    es: "¿Cuál es el objetivo?",
    fr: "Quel est l'objectif ?",
    de: "Was ist das Ziel?",
  },
};

/* I prezzi sono finti ma plausibili e non tondi: "29,90" legge come un
   listino vero, "30" legge come un segnaposto. */
const PRICES = ["29,90", "54,00", "18,50"];

const RESULT_LABEL: Record<Language, string> = {
  it: "3 idee trovate",
  en: "3 ideas found",
  es: "3 ideas encontradas",
  fr: "3 idées trouvées",
  de: "3 Ideen gefunden",
};

const SCREEN_CTA: Record<Language, string> = {
  it: "TROVA ORA",
  en: "FIND IT NOW",
  es: "BUSCAR YA",
  fr: "TROUVER",
  de: "JETZT FINDEN",
};

const SCREEN_HINT: Record<Language, string> = {
  it: "Parla o inquadra",
  en: "Speak or point",
  es: "Habla o enfoca",
  fr: "Parlez ou visez",
  de: "Sprich oder ziele",
};

/* La scocca e un render vero (public/telefono-cornice.png), non un
   rettangolo disegnato in CSS: e' la stessa cornice usata sul sito
   Valdiriom, ripulita dal bagliore ciano/oro di quel marchio e resa
   trasparente fuori dalla sagoma, cosi l'alone dell'app le passa
   dietro invece di essere coperto da un rettangolo nero.

   Le misure sotto sono il foro dello schermo dentro quel PNG: vanno
   lasciate come sono, sono state ricavate dall'immagine e non
   ritoccabili a occhio. */
const PHONE_ASPECT = "714 / 1264";
const SCREEN = {
  left: "15.546%",
  top: "6.487%",
  width: "71.429%",
  height: "86.63%",
  radius: "8.2% / 4.7%",
} as const;

export function PhoneMock({
  app,
  language,
  dimmed = false,
}: {
  app: AppEntry;
  language: Language;
  dimmed?: boolean;
}) {
  const choices = SCREEN_CHOICES[app.id] ?? SCREEN_CHOICES.kado;
  const question = (SCREEN_QUESTION[app.id] ?? SCREEN_QUESTION.kado)[language];

  return (
    <div className="relative h-full w-full select-none" style={{ aspectRatio: PHONE_ASPECT }}>
      {/* Alone della tinta di categoria dietro la scocca. Sta qui e non
          nella cornice perche la cornice e neutra apposta: l'immagine e
          la stessa per tutte e tre le app, il colore lo mette l'app. */}
      {!dimmed && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[-14%] -z-10 rounded-full"
          style={{
            background: `radial-gradient(closest-side, ${app.core}4D, ${app.glow}1A 55%, transparent)`,
            filter: "blur(30px)",
          }}
        />
      )}

      {/* Schermo: collocato con le percentuali esatte del foro nella
          cornice, non a occhio -- se ballano di mezzo punto si vede
          subito una fessura nera lungo un bordo. */}
      <div
        className="absolute flex flex-col overflow-hidden"
        style={{
          left: SCREEN.left,
          top: SCREEN.top,
          width: SCREEN.width,
          height: SCREEN.height,
          borderRadius: SCREEN.radius,
          backgroundColor: "#0A070C",
        }}
      >
        {/* Alone di marca dentro lo schermo: la tinta di categoria che
            fa riconoscere l'app prima ancora di leggerne il nome. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-[18%] h-[55%]"
          style={{
            background: `radial-gradient(60% 100% at 50% 0%, ${app.core}55, ${app.glow}18 55%, transparent 100%)`,
          }}
        />

        {/* Contenuto distribuito, non impilato in alto con un vuoto in
            mezzo: lo schermo di un telefono vero non lascia mai un buco
            fra il contenuto e la barra delle azioni. Niente isola
            dinamica disegnata qui: la porta gia la cornice vera. */}
        <div className="relative z-10 flex flex-1 flex-col justify-between gap-[3%] px-[8%] pb-[8%] pt-[9%]">
          {/* Barra alta: nome + stato */}
          <div className="flex items-center justify-between">
            <span
              className="font-display text-[9px] font-black uppercase tracking-[0.14em] sm:text-[11px]"
              style={{ color: app.core }}
            >
              {app.name}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: app.core }} />
              <span className="h-1 w-1 rounded-full bg-white/25" />
              <span className="h-1 w-1 rounded-full bg-white/25" />
            </span>
          </div>

          {/* La domanda del primo passo */}
          <p className="font-display text-[12px] font-black leading-tight text-white sm:text-[15px]">
            {question}
          </p>

          {/* Le quattro scelte, con la prima gia selezionata: uno stato
              acceso ma sobrio (velo di tinta + bordo), non un blocco
              pieno che coprirebbe l'etichetta. */}
          <div className="grid grid-cols-2 gap-[4%]">
            {choices.map((choice, i) => {
              const Icon = choice.icon;
              const selected = i === 0;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center gap-[6%] rounded-[14%] py-[9%]"
                  style={
                    selected
                      ? {
                          background: `linear-gradient(150deg, ${app.core}30, ${app.glow}12), #17131B`,
                          boxShadow: `inset 0 0 0 1px ${app.core}99`,
                        }
                      : { backgroundColor: "#15121A", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }
                  }
                >
                  <Icon
                    className="h-[9px] w-[9px] sm:h-3 sm:w-3"
                    style={{ color: selected ? app.core : "rgba(255,255,255,0.45)" }}
                    strokeWidth={2.4}
                  />
                  <span
                    className="text-[6.5px] font-semibold leading-none sm:text-[8px]"
                    style={{ color: selected ? "#FFFFFF" : "rgba(255,255,255,0.45)" }}
                  >
                    {choice.label[language]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* L'esito, non solo la domanda. Uno schermo che mostra solo il
              questionario racconta la fatica; questa striscia mostra
              quello che si ottiene -- tre risultati veri con il prezzo --
              cioe la ragione per cui uno aprirebbe l'app. */}
          <div className="mt-[1%] flex flex-col gap-[3%]">
            <span
              className="text-[6px] font-bold uppercase sm:text-[8px]"
              style={{ letterSpacing: "0.18em", color: `${app.core}` }}
            >
              {RESULT_LABEL[language]}
            </span>
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="flex items-center gap-[4%] rounded-[10%/22%] p-[3%]"
                style={{
                  backgroundColor: "#15121A",
                  boxShadow: row === 0 ? `inset 0 0 0 1px ${app.core}66` : "inset 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="h-[16px] w-[16px] shrink-0 rounded-[22%] sm:h-6 sm:w-6"
                  style={{
                    background: `linear-gradient(150deg, ${app.core}${row === 0 ? "AA" : "44"}, ${app.glow}${row === 0 ? "55" : "1A"})`,
                  }}
                />
                <div className="flex flex-1 flex-col gap-[3px]">
                  <div
                    className="h-[3px] rounded-full sm:h-[4px]"
                    style={{ width: `${78 - row * 12}%`, backgroundColor: "rgba(255,255,255,0.42)" }}
                  />
                  <div
                    className="h-[3px] rounded-full sm:h-[4px]"
                    style={{ width: `${52 - row * 8}%`, backgroundColor: "rgba(255,255,255,0.16)" }}
                  />
                </div>
                <span
                  className="shrink-0 rounded-full px-[5px] py-[2px] text-[5.5px] font-black sm:text-[7px]"
                  style={{
                    color: row === 0 ? "#0A070C" : "rgba(255,255,255,0.55)",
                    backgroundColor: row === 0 ? app.core : "rgba(255,255,255,0.08)",
                  }}
                >
                  {PRICES[row]}
                </span>
              </div>
            ))}
          </div>

          {/* Voce e fotocamera: i due ingressi che rendono queste app
              piu veloci di una ricerca scritta -- sono la cosa da far
              vedere, non da nascondere in un menu. */}
          <div className="flex items-center justify-center gap-[6%]">
            <div
              className="flex h-[15px] w-[15px] items-center justify-center rounded-full sm:h-5 sm:w-5"
              style={{
                background: `linear-gradient(150deg, ${app.core}, ${app.glow})`,
                boxShadow: `0 0 14px -2px ${app.core}`,
              }}
            >
              <Mic className="h-[7px] w-[7px] text-white sm:h-2.5 sm:w-2.5" strokeWidth={2.6} />
            </div>
            <div
              className="flex h-[15px] w-[15px] items-center justify-center rounded-full sm:h-5 sm:w-5"
              style={{ backgroundColor: "#1B1622", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)" }}
            >
              <Camera className="h-[7px] w-[7px] text-white/70 sm:h-2.5 sm:w-2.5" strokeWidth={2.4} />
            </div>
            <span className="text-[6px] font-medium text-white/40 sm:text-[8px]">
              {SCREEN_HINT[language]}
            </span>
          </div>

          {/* CTA dentro lo schermo: bianca, come quella del sito --
              stessa grammatica dell'azione in ogni contesto. */}
          <div
            className="flex items-center justify-center gap-[4%] rounded-full py-[4.5%]"
            style={{ backgroundColor: "#FFFFFF", boxShadow: `0 6px 20px -6px ${app.core}` }}
          >
            <Sparkles className="h-[7px] w-[7px] text-black sm:h-2.5 sm:w-2.5" strokeWidth={2.6} />
            <span className="text-[6.5px] font-black tracking-[0.1em] text-black sm:text-[8px]">
              {SCREEN_CTA[language]}
            </span>
          </div>
        </div>
      </div>

      {/* La scocca sopra lo schermo: il foro del PNG e trasparente,
          quindi il contenuto si vede attraverso e i bordi arrotondati
          sono quelli veri del render, non un border-radius che prova a
          somigliargli. */}
      <img
        src="/telefono-cornice.png"
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ filter: dimmed ? "brightness(0.62)" : undefined }}
      />
    </div>
  );
}
