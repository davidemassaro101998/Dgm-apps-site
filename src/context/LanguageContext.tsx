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

    heroTagline: "¿Tienes un problema del día a día?",
    heroTitle: "DGM APPS",
    heroDescription: "Apps útiles y simples, pensadas para ahorrarte tiempo. Explora las soluciones aquí abajo.",
    heroCta: "Explorar soluciones",
    heroSecondaryCta: "Sobre Nosotros",

    storyBadge: "Sobre Nosotros",
    storyTitleLine1: "Dos personas.",
    storyTitleLine2: "Ninguna excusa.",
    storySubtitle: "Cada línea de código tiene un propósito claro: ahorrarte tiempo. Construimos, probamos y eliminamos lo superfluo, hasta que solo queda lo que realmente sirve.",
    principles: [
      {
        n: "01",
        title: "Útil",
        body: "Resuelve un problema real. Si no lo hace, no existe.",
      },
      {
        n: "02",
        title: "Simple",
        body: "Cero curva de aprendizaje. Cero tutoriales que leer.",
      },
      {
        n: "03",
        title: "Probada",
        body: "La usamos nosotros primero, cada día, antes de pedírtelo a ti.",
      },
    ],

    catalogBadge: "Catálogo de Soluciones DGM",
    catalogTitle: "El Catálogo de Soluciones",
    catalogSubtitle: "Explora nuestras apps, juega con el carrusel y selecciona una para abrirla.",
    statusLive: "Disponible",
    statusBeta: "Beta",
    statusPresto: "Próximamente",

    modalClose: "Cerrar",
    modalOpenStore: "Abrir en la tienda",
    modalComingSoon: "Próximamente",
    modalNotLinkedYet: "Enlace en camino",

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

    heroTagline: "Un problème du quotidien ?",
    heroTitle: "DGM APPS",
    heroDescription: "Des applications utiles et simples, pensées pour vous faire gagner du temps. Découvrez les solutions ci-dessous.",
    heroCta: "Découvrir les solutions",
    heroSecondaryCta: "À Propos",

    storyBadge: "À Propos",
    storyTitleLine1: "Deux personnes.",
    storyTitleLine2: "Aucune excuse.",
    storySubtitle: "Chaque ligne de code a un but précis : vous faire gagner du temps. Nous construisons, testons, éliminons le superflu — jusqu'à ne garder que l'essentiel.",
    principles: [
      {
        n: "01",
        title: "Utile",
        body: "Résout un vrai problème. Sinon, elle n'existe pas.",
      },
      {
        n: "02",
        title: "Simple",
        body: "Aucune courbe d'apprentissage. Aucun tutoriel à lire.",
      },
      {
        n: "03",
        title: "Testée",
        body: "Nous l'utilisons nous-mêmes en premier, chaque jour, avant de vous la proposer.",
      },
    ],

    catalogBadge: "Catalogue de Solutions DGM",
    catalogTitle: "Le Catalogue de Solutions",
    catalogSubtitle: "Parcourez nos apps, jouez avec le carrousel et sélectionnez une carte pour l'ouvrir.",
    statusLive: "Disponible",
    statusBeta: "Bêta",
    statusPresto: "Bientôt disponible",

    modalClose: "Fermer",
    modalOpenStore: "Ouvrir dans le store",
    modalComingSoon: "Bientôt disponible",
    modalNotLinkedYet: "Lien à venir",

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

    heroTagline: "Ein alltägliches Problem?",
    heroTitle: "DGM APPS",
    heroDescription: "Nützliche und einfache Apps, die dir Zeit sparen. Entdecke die Lösungen weiter unten.",
    heroCta: "Lösungen entdecken",
    heroSecondaryCta: "Über Uns",

    storyBadge: "Über Uns",
    storyTitleLine1: "Zwei Menschen.",
    storyTitleLine2: "Keine Ausreden.",
    storySubtitle: "Jede Zeile Code hat einen klaren Zweck: dir Zeit zu sparen. Wir bauen, testen und streichen alles Überflüssige — bis nur noch das Wesentliche bleibt.",
    principles: [
      {
        n: "01",
        title: "Nützlich",
        body: "Löst ein echtes Problem. Sonst gibt es sie nicht.",
      },
      {
        n: "02",
        title: "Einfach",
        body: "Keine Lernkurve. Keine Tutorials zum Durchlesen.",
      },
      {
        n: "03",
        title: "Getestet",
        body: "Wir nutzen sie selbst zuerst, jeden Tag, bevor wir sie dir anbieten.",
      },
    ],

    catalogBadge: "DGM Lösungskatalog",
    catalogTitle: "Der Lösungskatalog",
    catalogSubtitle: "Durchstöbere unsere Apps, spiel mit dem Karussell und wähle eine Karte zum Öffnen.",
    statusLive: "Verfügbar",
    statusBeta: "Beta",
    statusPresto: "Demnächst verfügbar",

    modalClose: "Schließen",
    modalOpenStore: "Im Store öffnen",
    modalComingSoon: "Demnächst verfügbar",
    modalNotLinkedYet: "Link folgt",

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
