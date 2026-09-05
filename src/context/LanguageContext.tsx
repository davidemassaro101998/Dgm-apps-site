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
  // SEO: <title> and meta description, kept in sync with the visible
  // language so search engines and shared-link previews stop always
  // showing Italian regardless of what the visitor actually reads.
  metaTitle: string;
  metaDescription: string;

  // Header
  aboutUs: string;
  catalog: string;
  contact: string;
  allApps: string;
  menuTitle: string;
  closeMenu: string;

  // Hero (tamburo delle app)
  /** La riga che vale per tutte e tre: l'AI capisce, Amazon consegna. */
  familyThesis: string;
  discover: string;
  useItNow: string;
  appInInglese: string;
  howItWorks: string;
  specsLabel: string;
  prevApp: string;
  nextApp: string;
  backToCatalog: string;

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
    metaTitle: "DGM Apps",
    metaDescription: "App utili e semplici pensate per farti risparmiare tempo: Kado AI, Bricolo AI, Forma AI.",
    aboutUs: "Chi siamo",
    catalog: "Catalogo",
    contact: "Contatti",
    allApps: "Tutte le App",
    menuTitle: "Menu",
    closeMenu: "Chiudi menu",

    familyThesis: "L'AI capisce · Tu trovi su Amazon",
    discover: "Scopri",
    useItNow: "Usala ora",
    appInInglese: "L'app è in italiano.",
    howItWorks: "Come funziona",
    specsLabel: "Dati",
    prevApp: "App precedente",
    nextApp: "App successiva",
    backToCatalog: "Torna al catalogo",

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
      "Questo sito ha funzione di vetrina: presenta le app della famiglia DGM Apps e permette di raggiungere i rispettivi store, dove ogni app gestisce autonomamente i propri dati.\n\nDati raccolti: il sito stesso non richiede registrazione e non raccoglie dati personali per funzionare. La lingua selezionata viene salvata solo nel tuo browser (localStorage), per ricordare la tua preferenza alla prossima visita — non viene mai inviata a noi o a terzi. Se in futuro attiveremo strumenti di analisi del traffico, questa policy verrà aggiornata di conseguenza.\n\nSe ci scrivi via email, useremo il tuo indirizzo solo per risponderti.\n\nDiritti per residenti in California (CCPA/CPRA): hai diritto a sapere quali dati raccogliamo su di te, a richiederne la cancellazione e a opporti alla loro vendita o condivisione — cosa che in ogni caso non facciamo. Scrivici per esercitare questi diritti.\n\nDiritti per residenti in Brasile (LGPD): puoi richiedere l'accesso, la correzione o la cancellazione dei tuoi dati personali contattandoci all'indirizzo email indicato sopra.\n\nPer la privacy delle singole app (Kado AI, Bricolo AI, Forma AI, ExitKit), fai riferimento alla privacy policy pubblicata all'interno di ciascuna app.",
    legalTermsTitle: "Termini di Servizio",
    legalTermsBody:
      "Questo sito è una vetrina informativa della famiglia di app DGM Apps. Non vende né elabora pagamenti direttamente: ogni app è acquistabile o scaricabile dal proprio store ufficiale, dove si applicano i relativi termini.\n\nI contenuti (testi, loghi, immagini) sono di proprietà di DGM Apps, salvo diversamente indicato. Il sito viene fornito così com'è, senza garanzie di disponibilità continua.\n\nPer domande su termini specifici di una singola app, consulta i termini pubblicati all'interno dell'app stessa o contattaci.",
    legalLastUpdated: "Ultimo aggiornamento: agosto 2026",
  },
  en: {
    metaTitle: "DGM Apps",
    metaDescription: "Useful, simple apps built to save you time: Kado AI, Bricolo AI, Forma AI.",
    aboutUs: "About Us",
    catalog: "Catalog",
    contact: "Contact",
    allApps: "All Apps",
    menuTitle: "Menu",
    closeMenu: "Close menu",

    familyThesis: "AI understands · You find it on Amazon",
    discover: "Discover",
    useItNow: "Use it now",
    appInInglese: "The app is in English.",
    howItWorks: "How it works",
    specsLabel: "Specs",
    prevApp: "Previous app",
    nextApp: "Next app",
    backToCatalog: "Back to catalogue",

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
      "This site is a showcase: it presents the DGM Apps family and links out to each app's store, where every app manages its own data independently.\n\nData collected: the site itself doesn't require an account and doesn't collect personal data to work. Your language choice is saved only in your browser (localStorage) to remember your preference on your next visit — it's never sent to us or to anyone else. If we enable traffic-analytics tools in the future, this policy will be updated accordingly.\n\nIf you email us, we'll only use your address to reply.\n\nRights for California residents (CCPA/CPRA): you have the right to know what data we collect about you, to request its deletion, and to opt out of its sale or sharing — which we don't do in any case. Contact us to exercise these rights.\n\nRights for Brazilian residents (LGPD): you may request access, correction, or deletion of your personal data by contacting us at the email address above.\n\nFor the privacy practices of individual apps (Kado AI, Bricolo AI, Forma AI, ExitKit), refer to the privacy policy published inside each app.",
    legalTermsTitle: "Terms of Service",
    legalTermsBody:
      "This site is an informational showcase for the DGM Apps family. It doesn't sell anything or process payments directly: every app is purchasable or downloadable from its own official store, where that store's terms apply.\n\nContent (text, logos, images) belongs to DGM Apps unless stated otherwise. The site is provided as-is, without a guarantee of continuous availability.\n\nFor questions about a specific app's terms, check the terms published inside that app, or contact us.",
    legalLastUpdated: "Last updated: August 2026",
  },
  es: {
    metaTitle: "DGM Apps",
    metaDescription: "Apps útiles y simples pensadas para ahorrarte tiempo: Kado AI, Bricolo AI, Forma AI.",
    aboutUs: "Sobre Nosotros",
    catalog: "Catálogo",
    contact: "Contacto",
    allApps: "Todas las Apps",
    menuTitle: "Menú",
    closeMenu: "Cerrar menú",

    familyThesis: "La IA entiende · Tú lo encuentras en Amazon",
    discover: "Descubrir",
    useItNow: "Úsala ya",
    appInInglese: "La app está en inglés.",
    howItWorks: "Cómo funciona",
    specsLabel: "Datos",
    prevApp: "App anterior",
    nextApp: "App siguiente",
    backToCatalog: "Volver al catálogo",

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
      "Este sitio es un escaparate: presenta la familia de apps DGM Apps y enlaza con la tienda de cada una, donde cada app gestiona sus propios datos de forma independiente.\n\nDatos recopilados: el sitio no requiere registro ni recopila datos personales para funcionar. El idioma elegido se guarda solo en tu navegador (localStorage) para recordar tu preferencia en la próxima visita, nunca se nos envía ni se comparte con terceros. Si en el futuro activamos herramientas de análisis de tráfico, esta política se actualizará en consecuencia.\n\nSi nos escribes por correo, solo usaremos tu dirección para responderte.\n\nDerechos para residentes en California (CCPA/CPRA): tienes derecho a saber qué datos recopilamos sobre ti, a solicitar su eliminación y a oponerte a su venta o compartición — algo que en cualquier caso no hacemos. Escríbenos para ejercer estos derechos.\n\nDerechos para residentes en Brasil (LGPD): puedes solicitar el acceso, la corrección o la eliminación de tus datos personales contactándonos en la dirección de correo indicada arriba.\n\nPara la privacidad de cada app (Kado AI, Bricolo AI, Forma AI, ExitKit), consulta la política de privacidad publicada dentro de cada aplicación.",
    legalTermsTitle: "Términos de Servicio",
    legalTermsBody:
      "Este sitio es un escaparate informativo de la familia DGM Apps. No vende ni procesa pagos directamente: cada app se compra o descarga desde su tienda oficial, donde se aplican sus propios términos.\n\nLos contenidos (textos, logotipos, imágenes) pertenecen a DGM Apps salvo que se indique lo contrario. El sitio se ofrece tal cual, sin garantía de disponibilidad continua.\n\nPara preguntas sobre los términos de una app concreta, consulta los términos publicados dentro de esa app o contáctanos.",
    legalLastUpdated: "Última actualización: agosto de 2026",
  },
  fr: {
    metaTitle: "DGM Apps",
    metaDescription: "Des applications utiles et simples pensées pour vous faire gagner du temps : Kado AI, Bricolo AI, Forma AI.",
    aboutUs: "À Propos",
    catalog: "Catalogue",
    contact: "Contact",
    allApps: "Toutes les Apps",
    menuTitle: "Menu",
    closeMenu: "Fermer le menu",

    familyThesis: "L'IA comprend · Vous trouvez sur Amazon",
    discover: "Découvrir",
    useItNow: "L'utiliser",
    appInInglese: "L'application est en anglais.",
    howItWorks: "Comment ça marche",
    specsLabel: "Données",
    prevApp: "App précédente",
    nextApp: "App suivante",
    backToCatalog: "Retour au catalogue",

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
      "Ce site est une vitrine : il présente la famille d'applications DGM Apps et renvoie vers la boutique de chacune, où chaque application gère ses propres données de façon indépendante.\n\nDonnées collectées : le site ne nécessite aucune inscription et ne collecte aucune donnée personnelle pour fonctionner. La langue choisie est enregistrée uniquement dans votre navigateur (localStorage) afin de mémoriser votre préférence lors de votre prochaine visite — elle ne nous est jamais transmise ni partagée avec des tiers. Si nous activons à l'avenir des outils d'analyse de trafic, cette politique sera mise à jour en conséquence.\n\nSi vous nous écrivez par e-mail, votre adresse ne sera utilisée que pour vous répondre.\n\nDroits pour les résidents de Californie (CCPA/CPRA) : vous avez le droit de savoir quelles données nous collectons sur vous, d'en demander la suppression et de vous opposer à leur vente ou partage — ce que nous ne faisons de toute façon pas. Contactez-nous pour exercer ces droits.\n\nDroits pour les résidents du Brésil (LGPD) : vous pouvez demander l'accès, la correction ou la suppression de vos données personnelles en nous contactant à l'adresse e-mail ci-dessus.\n\nPour la confidentialité de chaque application (Kado AI, Bricolo AI, Forma AI, ExitKit), consultez la politique de confidentialité publiée dans l'application concernée.",
    legalTermsTitle: "Conditions d'Utilisation",
    legalTermsBody:
      "Ce site est une vitrine informative de la famille DGM Apps. Il ne vend rien et ne traite aucun paiement directement : chaque application s'achète ou se télécharge depuis sa boutique officielle, où s'appliquent les conditions de cette boutique.\n\nLes contenus (textes, logos, images) appartiennent à DGM Apps, sauf mention contraire. Le site est fourni tel quel, sans garantie de disponibilité continue.\n\nPour toute question sur les conditions d'une application précise, consultez les conditions publiées dans l'application ou contactez-nous.",
    legalLastUpdated: "Dernière mise à jour : août 2026",
  },
  de: {
    metaTitle: "DGM Apps",
    metaDescription: "Nützliche, einfache Apps, die dir Zeit sparen: Kado AI, Bricolo AI, Forma AI.",
    aboutUs: "Über Uns",
    catalog: "Katalog",
    contact: "Kontakt",
    allApps: "Alle Apps",
    menuTitle: "Menü",
    closeMenu: "Menü schließen",

    familyThesis: "Die KI versteht · Du findest es bei Amazon",
    discover: "Entdecken",
    useItNow: "Jetzt nutzen",
    appInInglese: "Die App ist auf Englisch.",
    howItWorks: "So funktioniert's",
    specsLabel: "Daten",
    prevApp: "Vorherige App",
    nextApp: "Nächste App",
    backToCatalog: "Zurück zum Katalog",

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
      "Diese Website ist ein Schaufenster: Sie stellt die DGM-Apps-Familie vor und verlinkt zum jeweiligen Store, wo jede App ihre eigenen Daten unabhängig verwaltet.\n\nErhobene Daten: Die Website selbst erfordert kein Konto und erhebt keine personenbezogenen Daten, um zu funktionieren. Die gewählte Sprache wird nur in deinem Browser (localStorage) gespeichert, um deine Präferenz beim nächsten Besuch zu merken — sie wird nie an uns oder Dritte übermittelt. Sollten wir künftig Analysetools einsetzen, wird diese Erklärung entsprechend aktualisiert.\n\nWenn du uns per E-Mail schreibst, verwenden wir deine Adresse nur, um dir zu antworten.\n\nRechte für Einwohner Kaliforniens (CCPA/CPRA): Du hast das Recht zu erfahren, welche Daten wir über dich erheben, ihre Löschung zu verlangen und ihrem Verkauf oder ihrer Weitergabe zu widersprechen — was wir ohnehin nicht tun. Kontaktiere uns, um diese Rechte auszuüben.\n\nRechte für Einwohner Brasiliens (LGPD): Du kannst Zugriff, Berichtigung oder Löschung deiner personenbezogenen Daten verlangen, indem du uns über die oben genannte E-Mail-Adresse kontaktierst.\n\nFür die Datenschutzpraktiken der einzelnen Apps (Kado AI, Bricolo AI, Forma AI, ExitKit) gilt die Datenschutzerklärung, die in der jeweiligen App veröffentlicht ist.",
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

const SUPPORTED_LANGUAGES: Language[] = ["it", "en", "es", "fr", "de"];

function detectBrowserLanguage(): Language {
  try {
    const nav = navigator.language || (navigator.languages && navigator.languages[0]) || "";
    const short = nav.toLowerCase().slice(0, 2) as Language;
    if (SUPPORTED_LANGUAGES.includes(short)) return short;
  } catch (e) {
    // ignore
  }
  return "en";
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("dgm_lang");
    if (saved === "it" || saved === "en" || saved === "es" || saved === "fr" || saved === "de") return saved;
    // First-time visitor: match their browser language instead of always
    // defaulting to Italian, which was silently showing the whole site in
    // Italian to every non-Italian first-time visitor regardless of where
    // they're from.
    return detectBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("dgm_lang", lang);
  };

  // Keep <html lang>, <title> and the meta description in sync with the
  // selected language -- these were previously hardcoded to Italian in
  // index.html and never updated, which told search engines and screen
  // readers the page was Italian even while it rendered in another
  // language entirely.
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translations[language].metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", translations[language].metaDescription);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", translations[language].metaTitle);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", translations[language].metaDescription);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", translations[language].metaTitle);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", translations[language].metaDescription);
  }, [language]);

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
