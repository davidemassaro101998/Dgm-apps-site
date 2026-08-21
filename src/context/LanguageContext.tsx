import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "it" | "en" | "es" | "fr" | "de";

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "it", label: "IT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
];

export interface Translations {
  // Header
  aboutUs: string;
  catalog: string;
  contact: string;
  allApps: string;
  menuTitle: string;
  closeMenu: string;

  // Hero (scroll-scrubbed)
  heroCta: string;
  heroScrubTaglineLine1: string;
  heroScrubTaglineLine2: string;
  heroScrubAboutLine1: string;
  heroScrubAboutLine2: string;
  heroScrubAboutLine3: string;
  heroScrubAboutLine4: string;
  heroScrubCatalogHeading: string;

  // App status labels (used in the Header's "All Apps" menu)
  statusLive: string;
  statusBeta: string;
  statusPresto: string;

  // Legal modal close button
  modalClose: string;

  // Footer
  footerDesc: string;
  footerSite: string;
  footerLegal: string;
  footerContact: string;
  privacyPolicy: string;
  termsOfService: string;
  copyright: string;

  // Legal modal
  legalPrivacyTitle: string;
  legalPrivacyBody: string;
  legalTermsTitle: string;
  legalTermsBody: string;
  legalLastUpdated: string;
}

const translations: Record<Language, Translations> = {
  it: {
    aboutUs: "Chi siamo",
    catalog: "Catalogo",
    contact: "Contatti",
    allApps: "Tutte le App",
    menuTitle: "Menu",
    closeMenu: "Chiudi menu",

    heroCta: "Prova le app",
    heroScrubTaglineLine1: "Facciamo app.",
    heroScrubTaglineLine2: "Ma sono utili.",
    heroScrubAboutLine1: "Due persone.",
    heroScrubAboutLine2: "Nessuna scusa.",
    heroScrubAboutLine3: "Solo quello che serve davvero.",
    heroScrubAboutLine4: "Fatto bene. Punto.",
    heroScrubCatalogHeading: "Scopri il catalogo",

    statusLive: "Disponibile",
    statusBeta: "Beta",
    statusPresto: "Presto disponibile",

    modalClose: "Chiudi",

    footerDesc: "App utili e semplici per la vita di tutti i giorni.",
    footerSite: "Sito",
    footerLegal: "Legale",
    footerContact: "Contatti",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Termini di Servizio",
    copyright: "DGM APPS. Tutte le app sono acquistabili o scaricabili direttamente dai rispettivi store.",

    legalPrivacyTitle: "Privacy Policy",
    legalPrivacyBody:
      "Questo sito ha funzione di vetrina: presenta le app della famiglia DGM Apps e permette di raggiungere i rispettivi store, dove ogni app gestisce autonomamente i propri dati.\n\nDati raccolti: il sito stesso non richiede registrazione e non raccoglie dati personali per funzionare. La lingua selezionata viene salvata solo nel tuo browser (localStorage), per ricordare la tua preferenza alla prossima visita — non viene mai inviata a noi o a terzi.\n\nSe ci scrivi via email, useremo il tuo indirizzo solo per risponderti.\n\nPer la privacy delle singole app (Kado AI, Bricolo AI, Forma AI, ExitKit), fai riferimento alla privacy policy pubblicata all'interno di ciascuna app.",
    legalTermsTitle: "Termini di Servizio",
    legalTermsBody:
      "Questo sito è una vetrina informativa della famiglia di app DGM Apps. Non vende né elabora pagamenti direttamente: ogni app è acquistabile o scaricabile dal proprio store ufficiale, dove si applicano i relativi termini.\n\nI contenuti (testi, loghi, immagini) sono di proprietà di DGM Apps, salvo diversamente indicato. Il sito viene fornito così com'è, senza garanzie di disponibilità continua.\n\nPer domande su termini specifici di una singola app, consulta i termini pubblicati all'interno dell'app stessa o contattaci.",
    legalLastUpdated: "Ultimo aggiornamento: agosto 2026",
  },
  en: {
    aboutUs: "About Us",
    catalog: "Catalog",
    contact: "Contact",
    allApps: "All Apps",
    menuTitle: "Menu",
    closeMenu: "Close menu",

    heroCta: "Try the apps",
    heroScrubTaglineLine1: "We build apps.",
    heroScrubTaglineLine2: "Actually useful ones.",
    heroScrubAboutLine1: "Two people.",
    heroScrubAboutLine2: "No excuses.",
    heroScrubAboutLine3: "Only what truly matters.",
    heroScrubAboutLine4: "Done right. Period.",
    heroScrubCatalogHeading: "Discover the catalog",

    statusLive: "Available",
    statusBeta: "Beta",
    statusPresto: "Coming Soon",

    modalClose: "Close",

    footerDesc: "Useful and simple apps for everyday life.",
    footerSite: "Site",
    footerLegal: "Legal",
    footerContact: "Contact",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    copyright: "DGM APPS. All apps are purchasable or downloadable directly from their respective stores.",

    legalPrivacyTitle: "Privacy Policy",
    legalPrivacyBody:
      "This site is a showcase: it presents the DGM Apps family and links out to each app's store, where every app manages its own data independently.\n\nData collected: the site itself doesn't require an account and doesn't collect personal data to work. Your language choice is saved only in your browser (localStorage) to remember your preference on your next visit — it's never sent to us or to anyone else.\n\nIf you email us, we'll only use your address to reply.\n\nFor the privacy practices of individual apps (Kado AI, Bricolo AI, Forma AI, ExitKit), refer to the privacy policy published inside each app.",
    legalTermsTitle: "Terms of Service",
    legalTermsBody:
      "This site is an informational showcase for the DGM Apps family. It doesn't sell anything or process payments directly: every app is purchasable or downloadable from its own official store, where that store's terms apply.\n\nContent (text, logos, images) belongs to DGM Apps unless stated otherwise. The site is provided as-is, without a guarantee of continuous availability.\n\nFor questions about a specific app's terms, check the terms published inside that app, or contact us.",
    legalLastUpdated: "Last updated: August 2026",
  },
  es: {
    aboutUs: "Sobre Nosotros",
    catalog: "Catálogo",
    contact: "Contacto",
    allApps: "Todas las Apps",
    menuTitle: "Menú",
    closeMenu: "Cerrar menú",

    heroCta: "Prueba las apps",
    heroScrubTaglineLine1: "Hacemos apps.",
    heroScrubTaglineLine2: "Pero útiles de verdad.",
    heroScrubAboutLine1: "Dos personas.",
    heroScrubAboutLine2: "Ninguna excusa.",
    heroScrubAboutLine3: "Solo lo que de verdad sirve.",
    heroScrubAboutLine4: "Bien hecho. Punto.",
    heroScrubCatalogHeading: "Descubre el catálogo",

    statusLive: "Disponible",
    statusBeta: "Beta",
    statusPresto: "Próximamente",

    modalClose: "Cerrar",

    footerDesc: "Apps útiles y simples para el día a día.",
    footerSite: "Sitio",
    footerLegal: "Legal",
    footerContact: "Contacto",
    privacyPolicy: "Política de Privacidad",
    termsOfService: "Términos de Servicio",
    copyright: "DGM APPS. Todas las apps se pueden comprar o descargar directamente desde sus respectivas tiendas.",

    legalPrivacyTitle: "Política de Privacidad",
    legalPrivacyBody:
      "Este sitio es un escaparate: presenta la familia de apps DGM Apps y enlaza con la tienda de cada una, donde cada app gestiona sus propios datos de forma independiente.\n\nDatos recopilados: el sitio no requiere registro ni recopila datos personales para funcionar. El idioma elegido se guarda solo en tu navegador (localStorage) para recordar tu preferencia en la próxima visita, nunca se nos envía ni se comparte con terceros.\n\nSi nos escribes por correo, solo usaremos tu dirección para responderte.\n\nPara la privacidad de cada app (Kado AI, Bricolo AI, Forma AI, ExitKit), consulta la política de privacidad publicada dentro de cada aplicación.",
    legalTermsTitle: "Términos de Servicio",
    legalTermsBody:
      "Este sitio es un escaparate informativo de la familia DGM Apps. No vende ni procesa pagos directamente: cada app se compra o descarga desde su tienda oficial, donde se aplican sus propios términos.\n\nLos contenidos (textos, logotipos, imágenes) pertenecen a DGM Apps salvo que se indique lo contrario. El sitio se ofrece tal cual, sin garantía de disponibilidad continua.\n\nPara preguntas sobre los términos de una app concreta, consulta los términos publicados dentro de esa app o contáctanos.",
    legalLastUpdated: "Última actualización: agosto de 2026",
  },
  fr: {
    aboutUs: "À Propos",
    catalog: "Catalogue",
    contact: "Contact",
    allApps: "Toutes les Apps",
    menuTitle: "Menu",
    closeMenu: "Fermer le menu",

    heroCta: "Essayer les apps",
    heroScrubTaglineLine1: "On fait des apps.",
    heroScrubTaglineLine2: "Mais vraiment utiles.",
    heroScrubAboutLine1: "Deux personnes.",
    heroScrubAboutLine2: "Aucune excuse.",
    heroScrubAboutLine3: "Seulement ce qui compte vraiment.",
    heroScrubAboutLine4: "Bien fait. Point final.",
    heroScrubCatalogHeading: "Découvre le catalogue",

    statusLive: "Disponible",
    statusBeta: "Bêta",
    statusPresto: "Bientôt disponible",

    modalClose: "Fermer",

    footerDesc: "Des applications utiles et simples pour le quotidien.",
    footerSite: "Site",
    footerLegal: "Mentions légales",
    footerContact: "Contact",
    privacyPolicy: "Politique de Confidentialité",
    termsOfService: "Conditions d'Utilisation",
    copyright: "DGM APPS. Toutes les apps sont achetables ou téléchargeables directement depuis leur store respectif.",

    legalPrivacyTitle: "Politique de Confidentialité",
    legalPrivacyBody:
      "Ce site est une vitrine : il présente la famille d'applications DGM Apps et renvoie vers la boutique de chacune, où chaque application gère ses propres données de façon indépendante.\n\nDonnées collectées : le site ne nécessite aucune inscription et ne collecte aucune donnée personnelle pour fonctionner. La langue choisie est enregistrée uniquement dans votre navigateur (localStorage) afin de mémoriser votre préférence lors de votre prochaine visite — elle ne nous est jamais transmise ni partagée avec des tiers.\n\nSi vous nous écrivez par e-mail, votre adresse ne sera utilisée que pour vous répondre.\n\nPour la confidentialité de chaque application (Kado AI, Bricolo AI, Forma AI, ExitKit), consultez la politique de confidentialité publiée dans l'application concernée.",
    legalTermsTitle: "Conditions d'Utilisation",
    legalTermsBody:
      "Ce site est une vitrine informative de la famille DGM Apps. Il ne vend rien et ne traite aucun paiement directement : chaque application s'achète ou se télécharge depuis sa boutique officielle, où s'appliquent les conditions de cette boutique.\n\nLes contenus (textes, logos, images) appartiennent à DGM Apps, sauf mention contraire. Le site est fourni tel quel, sans garantie de disponibilité continue.\n\nPour toute question sur les conditions d'une application précise, consultez les conditions publiées dans l'application ou contactez-nous.",
    legalLastUpdated: "Dernière mise à jour : août 2026",
  },
  de: {
    aboutUs: "Über Uns",
    catalog: "Katalog",
    contact: "Kontakt",
    allApps: "Alle Apps",
    menuTitle: "Menü",
    closeMenu: "Menü schließen",

    heroCta: "Apps ausprobieren",
    heroScrubTaglineLine1: "Wir bauen Apps.",
    heroScrubTaglineLine2: "Aber wirklich nützliche.",
    heroScrubAboutLine1: "Zwei Menschen.",
    heroScrubAboutLine2: "Keine Ausreden.",
    heroScrubAboutLine3: "Nur das, was wirklich zählt.",
    heroScrubAboutLine4: "Gut gemacht. Punkt.",
    heroScrubCatalogHeading: "Entdecke den Katalog",

    statusLive: "Verfügbar",
    statusBeta: "Beta",
    statusPresto: "Demnächst verfügbar",

    modalClose: "Schließen",

    footerDesc: "Nützliche und einfache Apps für den Alltag.",
    footerSite: "Website",
    footerLegal: "Rechtliches",
    footerContact: "Kontakt",
    privacyPolicy: "Datenschutzerklärung",
    termsOfService: "Nutzungsbedingungen",
    copyright: "DGM APPS. Alle Apps sind direkt über den jeweiligen Store käuflich oder herunterladbar.",

    legalPrivacyTitle: "Datenschutzerklärung",
    legalPrivacyBody:
      "Diese Website ist ein Schaufenster: Sie stellt die DGM-Apps-Familie vor und verlinkt zum jeweiligen Store, wo jede App ihre eigenen Daten unabhängig verwaltet.\n\nErhobene Daten: Die Website selbst erfordert kein Konto und erhebt keine personenbezogenen Daten, um zu funktionieren. Die gewählte Sprache wird nur in deinem Browser (localStorage) gespeichert, um deine Präferenz beim nächsten Besuch zu merken — sie wird nie an uns oder Dritte übermittelt.\n\nWenn du uns per E-Mail schreibst, verwenden wir deine Adresse nur, um dir zu antworten.\n\nFür die Datenschutzpraktiken der einzelnen Apps (Kado AI, Bricolo AI, Forma AI, ExitKit) gilt die Datenschutzerklärung, die in der jeweiligen App veröffentlicht ist.",
    legalTermsTitle: "Nutzungsbedingungen",
    legalTermsBody:
      "Diese Website ist ein informatives Schaufenster der DGM-Apps-Familie. Sie verkauft nichts und verarbeitet keine Zahlungen direkt: Jede App wird über ihren offiziellen Store gekauft oder heruntergeladen, wo die dortigen Bedingungen gelten.\n\nInhalte (Texte, Logos, Bilder) gehören DGM Apps, sofern nicht anders angegeben. Die Website wird ohne Gewähr für durchgehende Verfügbarkeit bereitgestellt.\n\nBei Fragen zu den Bedingungen einer bestimmten App prüfe die in der App veröffentlichten Bedingungen oder kontaktiere uns.",
    legalLastUpdated: "Letzte Aktualisierung: August 2026",
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
    if (saved === "it" || saved === "en" || saved === "es" || saved === "fr" || saved === "de") return saved;
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
