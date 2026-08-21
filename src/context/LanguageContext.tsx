import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "it" | "en";

export interface Translations {
  // Header
  aboutUs: string;
  catalog: string;
  contact: string;
  allApps: string;
  menuTitle: string;
  closeMenu: string;
  
  // Hero
  heroTagline: string;
  heroTitle: string;
  heroDescription: string;
  heroCta: string;
  heroSecondaryCta: string;

  // Story
  storyBadge: string;
  storyTitleLine1: string;
  storyTitleLine2: string;
  storySubtitle: string;
  principles: {
    n: string;
    title: string;
    body: string;
  }[];

  // Catalog
  catalogBadge: string;
  catalogTitle: string;
  catalogSubtitle: string;
  statusLive: string;
  statusBeta: string;
  statusPresto: string;

  // Modal
  modalClose: string;
  modalOpenStore: string;
  modalComingSoon: string;
  modalNotLinkedYet: string;

  // Footer
  footerDesc: string;
  footerSite: string;
  footerLegal: string;
  footerContact: string;
  privacyPolicy: string;
  termsOfService: string;
  copyright: string;
}

const translations: Record<Language, Translations> = {
  it: {
    aboutUs: "Chi siamo",
    catalog: "Catalogo",
    contact: "Contatti",
    allApps: "Tutte le App",
    menuTitle: "Menu",
    closeMenu: "Chiudi menu",
    
    heroTagline: "Hai un problema di tutti i giorni?",
    heroTitle: "DGM APPS",
    heroDescription: "App utili e semplici, pensate per farti risparmiare tempo. Sfoglia le soluzioni qui sotto.",
    heroCta: "Scopri le soluzioni",
    heroSecondaryCta: "Chi siamo",

    storyBadge: "Chi siamo",
    storyTitleLine1: "Due persone.",
    storyTitleLine2: "Nessuna scusa.",
    storySubtitle: "Ogni riga di codice ha uno scopo preciso: farti risparmiare tempo. Costruiamo, testiamo, tagliamo tutto il superfluo — finché non resta solo quello che serve.",
    principles: [
      {
        n: "01",
        title: "Utile",
        body: "Risolve un problema reale. Se non lo fa, non esiste.",
      },
      {
        n: "02",
        title: "Semplice",
        body: "Zero curva di apprendimento. Zero tutorial da leggere.",
      },
      {
        n: "03",
        title: "Testata",
        body: "La usiamo noi per primi, ogni giorno, prima di chiederlo a te.",
      },
    ],

    catalogBadge: "Catalogo Soluzioni DGM",
    catalogTitle: "Il Catalogo delle Soluzioni",
    catalogSubtitle: "Sfoglia le nostre app, gioca con il carosello e seleziona una card per aprirla.",
    statusLive: "Disponibile",
    statusBeta: "Beta",
    statusPresto: "Presto disponibile",

    modalClose: "Chiudi",
    modalOpenStore: "Apri nello store",
    modalComingSoon: "Presto disponibile",
    modalNotLinkedYet: "Link in arrivo",

    footerDesc: "App utili e semplici per la vita di tutti i giorni.",
    footerSite: "Sito",
    footerLegal: "Legale",
    footerContact: "Contatti",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Termini di Servizio",
    copyright: "DGM APPS. Tutte le app sono acquistabili o scaricabili direttamente dai rispettivi store.",
  },
  en: {
    aboutUs: "About Us",
    catalog: "Catalog",
    contact: "Contact",
    allApps: "All Apps",
    menuTitle: "Menu",
    closeMenu: "Close menu",

    heroTagline: "Got an everyday problem?",
    heroTitle: "DGM APPS",
    heroDescription: "Useful and simple apps designed to save you time. Explore our solutions below.",
    heroCta: "Explore Solutions",
    heroSecondaryCta: "About Us",

    storyBadge: "About Us",
    storyTitleLine1: "Two people.",
    storyTitleLine2: "No excuses.",
    storySubtitle: "Every line of code serves a single purpose: saving you time. We build, test, and cut out the clutter—until only what truly matters remains.",
    principles: [
      {
        n: "01",
        title: "Useful",
        body: "Solves a real problem. If it doesn't, it shouldn't exist.",
      },
      {
        n: "02",
        title: "Simple",
        body: "Zero learning curve. No tedious tutorials to read.",
      },
      {
        n: "03",
        title: "Tested",
        body: "We use our own apps daily before ever offering them to you.",
      },
    ],

    catalogBadge: "DGM Solutions Catalog",
    catalogTitle: "Our Solutions Catalog",
    catalogSubtitle: "Browse our apps, swipe through the carousel, and select any card to view details.",
    statusLive: "Available",
    statusBeta: "Beta",
    statusPresto: "Coming Soon",

    modalClose: "Close",
    modalOpenStore: "Open in Store",
    modalComingSoon: "Coming Soon",
    modalNotLinkedYet: "Link Coming Soon",

    footerDesc: "Useful and simple apps for everyday life.",
    footerSite: "Site",
    footerLegal: "Legal",
    footerContact: "Contact",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    copyright: "DGM APPS. All apps are purchasable or downloadable directly from their respective stores.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("dgm_lang");
    if (saved === "it" || saved === "en") return saved;
    return "it";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("dgm_lang", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
