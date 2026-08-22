import type { Language } from "../context/LanguageContext";

export type AppStatus = "live" | "beta" | "presto";

export interface AppEntry {
  id: string;
  name: Record<Language, string>;
  tagline: Record<Language, string>;
  status: AppStatus;
  accent: "violet" | "cyan" | "amber";
  href: string;
  image?: string;
}

export const apps: AppEntry[] = [
  {
    id: "kado",
    name: {
      it: "Kado AI",
      en: "Kado AI",
      es: "Kado AI",
      fr: "Kado AI",
      de: "Kado AI",
    },
    tagline: {
      it: "Il regalo perfetto in 3 tap. Parli o scegli, l'AI lo trova su Amazon.",
      en: "The perfect gift in 3 taps. Speak or pick, AI finds it on Amazon.",
      es: "El regalo perfecto en 3 toques. Habla o elige, la IA lo encuentra en Amazon.",
      fr: "Le cadeau parfait en 3 taps. Parlez ou choisissez, l'IA le trouve sur Amazon.",
      de: "Das perfekte Geschenk in 3 Taps. Sprich oder wähle, die KI findet es bei Amazon.",
    },
    status: "live",
    accent: "cyan",
    href: "https://kado-app-production-d2c1.up.railway.app",
    image: "/icons/kado.svg",
  },
  {
    id: "bricolo",
    name: {
      it: "Bricolo AI",
      en: "Bricolo AI",
      es: "Bricolo AI",
      fr: "Bricolo AI",
      de: "Bricolo AI",
    },
    tagline: {
      it: "L'attrezzo giusto per casa, giardino, bricolage e officina, trovato subito.",
      en: "The right tool for home, garden, DIY and the workshop, found instantly.",
      es: "La herramienta justa para casa, jardín, bricolaje y taller, encontrada al instante.",
      fr: "Le bon outil pour la maison, le jardin, le bricolage et l'atelier, trouvé instantanément.",
      de: "Das richtige Werkzeug für Haus, Garten, Heimwerken und Werkstatt, sofort gefunden.",
    },
    status: "presto",
    accent: "amber",
    href: "https://bricolo-app-production.up.railway.app",
    image: "/icons/bricolo.svg",
  },
  {
    id: "forma",
    name: {
      it: "Forma AI",
      en: "Forma AI",
      es: "Forma AI",
      fr: "Forma AI",
      de: "Forma AI",
    },
    tagline: {
      it: "Il prodotto giusto per allenarti o recuperare, scelto sul tuo obiettivo.",
      en: "The right product to train or recover, matched to your goal.",
      es: "El producto justo para entrenar o recuperarte, elegido según tu objetivo.",
      fr: "Le bon produit pour s'entraîner ou récupérer, choisi selon votre objectif.",
      de: "Das richtige Produkt zum Trainieren oder Erholen, passend zu deinem Ziel.",
    },
    status: "presto",
    accent: "violet",
    href: "https://forma-app-production.up.railway.app",
    image: "/icons/forma.svg",
  },
];
