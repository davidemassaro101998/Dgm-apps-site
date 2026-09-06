import type { Language } from "../context/LanguageContext";

export type AppStatus = "live" | "beta" | "presto";

type L<T> = Record<Language, T>;

export interface AppSpec {
  label: L<string>;
  value: L<string>;
}

export interface AppEntry {
  id: string;
  name: string;
  /** Una riga, la promessa. Non uno slogan: cosa fa, detto in chiaro. */
  tagline: L<string>;
  /** La frase-tesi comune a tutta la famiglia, declinata sul dominio:
   *  l'AI capisce cosa ti serve, tu lo compri su Amazon. */
  thesis: L<string>;
  status: AppStatus;
  href: string;
  iconUrl: string;

  /* ---- Sistema cromatico -------------------------------------------
   * `core` e la tinta di categoria (congruenza colore-prodotto: il
   * cervello riconosce la categoria dal colore prima di leggere il
   * nome). `glow` e l'alone ambientale. Il colore dell'AZIONE non e
   * qui: la CTA e sempre bianca su fondo scuro, la massima salienza
   * per luminanza, uguale per tutte e tre -- cosi la tinta fa il
   * lavoro emotivo e il pulsante fa il lavoro di richiamo, senza che
   * i due si contendano l'attenzione. */
  core: string;
  glow: string;

  /** Cosa fa, in tre affermazioni concrete. Niente aggettivi. */
  features: L<string[]>;
  /** Il percorso reale dentro l'app, passo per passo. */
  steps: L<string[]>;
  /** Dati verificabili, non promesse. */
  specs: AppSpec[];
}

const SPEC_MARKETS: AppSpec = {
  label: { it: "Mercati", en: "Markets", es: "Mercados", fr: "Marchés", de: "Märkte" },
  value: {
    it: "18 store Amazon",
    en: "18 Amazon stores",
    es: "18 tiendas Amazon",
    fr: "18 boutiques Amazon",
    de: "18 Amazon-Stores",
  },
};

/* Le app oggi parlano due lingue, non cinque: servono 18 mercati Amazon
   ma l'interfaccia esiste solo in italiano e inglese. Scritto com'e --
   una scheda prodotto che gonfia un numero verificabile in dieci secondi
   e' il modo piu veloce per perdere la fiducia che deve costruire. */
const SPEC_LANGUAGES: AppSpec = {
  label: { it: "Lingue", en: "Languages", es: "Idiomas", fr: "Langues", de: "Sprachen" },
  value: { it: "IT · EN", en: "IT · EN", es: "IT · EN", fr: "IT · EN", de: "IT · EN" },
};

const SPEC_ACCOUNT: AppSpec = {
  label: { it: "Account", en: "Account", es: "Cuenta", fr: "Compte", de: "Konto" },
  value: {
    it: "Non serve",
    en: "Not required",
    es: "No hace falta",
    fr: "Pas nécessaire",
    de: "Nicht nötig",
  },
};

const SPEC_INPUT: AppSpec = {
  label: { it: "Ingressi", en: "Inputs", es: "Entradas", fr: "Entrées", de: "Eingaben" },
  value: {
    it: "Voce, foto, testo",
    en: "Voice, photo, text",
    es: "Voz, foto, texto",
    fr: "Voix, photo, texte",
    de: "Sprache, Foto, Text",
  },
};

/* Calibro non condivide le specifiche delle altre tre, e non deve.
   Parla CINQUE lingue (il selettore in alto ne mostra cinque e i testi
   ci sono tutti), e i mercati che raggiunge sono i cinque store dei
   suoi affiliati, non diciotto. Riusare le costanti di famiglia sarebbe
   stato piu' comodo e avrebbe scritto due numeri falsi in vetrina. */
const SPEC_MERCATI_CALIBRO: AppSpec = {
  label: { it: "Mercati", en: "Markets", es: "Mercados", fr: "Marchés", de: "Märkte" },
  value: {
    it: "5 store Amazon",
    en: "5 Amazon stores",
    es: "5 tiendas Amazon",
    fr: "5 boutiques Amazon",
    de: "5 Amazon-Stores",
  },
};

const SPEC_LINGUE_CALIBRO: AppSpec = {
  label: { it: "Lingue", en: "Languages", es: "Idiomas", fr: "Langues", de: "Sprachen" },
  value: {
    it: "IT · EN · DE · FR · ES",
    en: "IT · EN · DE · FR · ES",
    es: "IT · EN · DE · FR · ES",
    fr: "IT · EN · DE · FR · ES",
    de: "IT · EN · DE · FR · ES",
  },
};

/* Oggi l'app prende testo e voce. La foto dell'etichetta e' scritta nel
   suo codice come intenzione, non come funzione: finche' non c'e', qui
   non si annuncia. */
const SPEC_INGRESSI_CALIBRO: AppSpec = {
  label: { it: "Ingressi", en: "Inputs", es: "Entradas", fr: "Entrées", de: "Eingaben" },
  value: {
    it: "Voce, testo",
    en: "Voice, text",
    es: "Voz, texto",
    fr: "Voix, texte",
    de: "Sprache, Text",
  },
};

export const apps: AppEntry[] = [
  {
    id: "kado",
    name: "Kado AI",
    tagline: {
      it: "Il regalo giusto, trovato mentre ci pensi ancora.",
      en: "The right gift, found while you're still thinking about it.",
      es: "El regalo justo, encontrado mientras aún lo piensas.",
      fr: "Le bon cadeau, trouvé pendant que vous y pensez encore.",
      de: "Das richtige Geschenk, gefunden während du noch überlegst.",
    },
    thesis: {
      it: "Dici per chi è. L'AI capisce. Tu lo compri su Amazon.",
      en: "Say who it's for. The AI understands. You buy it on Amazon.",
      es: "Dices para quién es. La IA entiende. Tú lo compras en Amazon.",
      fr: "Vous dites pour qui. L'IA comprend. Vous l'achetez sur Amazon.",
      de: "Sag für wen. Die KI versteht. Du kaufst es bei Amazon.",
    },
    status: "live",
    href: "https://kado-app-production-d2c1.up.railway.app",
    iconUrl: "/icons/kado.svg",
    core: "#FF2E7E",
    glow: "#FFB347",
    features: {
      it: [
        "Parla, fotografa o scrivi: l'AI capisce chi è la persona.",
        "Tre idee vere, con prezzo e link diretto su Amazon.",
        "Nessun account, nessuna mail, nessuna attesa.",
      ],
      en: [
        "Speak, snap a photo or type: the AI understands the person.",
        "Three real ideas, with price and a direct Amazon link.",
        "No account, no email, no waiting.",
      ],
      es: [
        "Habla, haz una foto o escribe: la IA entiende a la persona.",
        "Tres ideas reales, con precio y enlace directo a Amazon.",
        "Sin cuenta, sin correo, sin esperas.",
      ],
      fr: [
        "Parlez, photographiez ou écrivez : l'IA comprend la personne.",
        "Trois idées réelles, avec prix et lien direct sur Amazon.",
        "Pas de compte, pas d'e-mail, pas d'attente.",
      ],
      de: [
        "Sprich, fotografiere oder tippe: die KI versteht die Person.",
        "Drei echte Ideen, mit Preis und direktem Amazon-Link.",
        "Kein Konto, keine E-Mail, kein Warten.",
      ],
    },
    steps: {
      it: ["Per chi è", "Che tipo è", "Quanto spendi", "I regali"],
      en: ["Who it's for", "What they're like", "Your budget", "The gifts"],
      es: ["Para quién", "Cómo es", "Cuánto gastas", "Los regalos"],
      fr: ["Pour qui", "Son style", "Votre budget", "Les cadeaux"],
      de: ["Für wen", "Welcher Typ", "Dein Budget", "Die Geschenke"],
    },
    specs: [SPEC_MARKETS, SPEC_INPUT, SPEC_LANGUAGES, SPEC_ACCOUNT],
  },
  {
    id: "bricolo",
    name: "Bricolo AI",
    tagline: {
      it: "L'attrezzo giusto, senza chiedere a nessuno.",
      en: "The right tool, without asking anyone.",
      es: "La herramienta justa, sin preguntar a nadie.",
      fr: "Le bon outil, sans demander à personne.",
      de: "Das richtige Werkzeug, ohne jemanden zu fragen.",
    },
    thesis: {
      it: "Mostri il problema. L'AI capisce. Tu lo risolvi con Amazon.",
      en: "Show the problem. The AI understands. You fix it with Amazon.",
      es: "Muestras el problema. La IA entiende. Lo resuelves con Amazon.",
      fr: "Vous montrez le problème. L'IA comprend. Vous le réglez avec Amazon.",
      de: "Zeig das Problem. Die KI versteht. Du löst es mit Amazon.",
    },
    status: "presto",
    href: "https://bricolo-app-production.up.railway.app",
    iconUrl: "/icons/bricolo.svg",
    core: "#FF8A1F",
    glow: "#FFC24D",
    features: {
      it: [
        "Fotografa il guasto o descrivilo: l'AI riconosce il lavoro.",
        "Ti dice l'attrezzo esatto, non una categoria generica.",
        "Casa, giardino, officina: tre mondi, una risposta sola.",
      ],
      en: [
        "Photograph the problem or describe it: the AI reads the job.",
        "It names the exact tool, not a generic category.",
        "Home, garden, workshop: three worlds, one answer.",
      ],
      es: [
        "Fotografía la avería o descríbela: la IA reconoce el trabajo.",
        "Te dice la herramienta exacta, no una categoría genérica.",
        "Casa, jardín, taller: tres mundos, una sola respuesta.",
      ],
      fr: [
        "Photographiez la panne ou décrivez-la : l'IA lit le travail.",
        "Elle nomme l'outil exact, pas une catégorie générique.",
        "Maison, jardin, atelier : trois mondes, une seule réponse.",
      ],
      de: [
        "Fotografiere den Schaden oder beschreibe ihn: die KI erkennt die Arbeit.",
        "Sie nennt das exakte Werkzeug, keine generische Kategorie.",
        "Haus, Garten, Werkstatt: drei Welten, eine Antwort.",
      ],
    },
    steps: {
      it: ["Che lavoro", "Dove", "Che livello", "Gli attrezzi"],
      en: ["The job", "Where", "Your level", "The tools"],
      es: ["Qué trabajo", "Dónde", "Qué nivel", "Las herramientas"],
      fr: ["Le travail", "Où", "Votre niveau", "Les outils"],
      de: ["Welche Arbeit", "Wo", "Dein Level", "Die Werkzeuge"],
    },
    specs: [SPEC_MARKETS, SPEC_INPUT, SPEC_LANGUAGES, SPEC_ACCOUNT],
  },
  {
    id: "forma",
    name: "Forma AI",
    tagline: {
      it: "L'attrezzatura giusta per l'obiettivo che hai davvero.",
      en: "The right gear for the goal you actually have.",
      es: "El equipo justo para el objetivo que tienes de verdad.",
      fr: "L'équipement adapté à l'objectif que vous avez vraiment.",
      de: "Die richtige Ausrüstung für dein tatsächliches Ziel.",
    },
    thesis: {
      it: "Dici il tuo obiettivo. L'AI capisce. Tu ti attrezzi su Amazon.",
      en: "State your goal. The AI understands. You gear up on Amazon.",
      es: "Dices tu objetivo. La IA entiende. Te equipas en Amazon.",
      fr: "Vous dites votre objectif. L'IA comprend. Vous vous équipez sur Amazon.",
      de: "Nenn dein Ziel. Die KI versteht. Du rüstest dich bei Amazon aus.",
    },
    status: "presto",
    href: "https://forma-app-production.up.railway.app",
    iconUrl: "/icons/forma.svg",
    core: "#38F27A",
    glow: "#A8FF60",
    features: {
      it: [
        "Obiettivo, spazio e livello: l'AI parte da dove sei davvero.",
        "Attrezzi che servono, non la lista completa del negozio.",
        "Allenamento e recupero trattati come la stessa cosa.",
      ],
      en: [
        "Goal, space and level: the AI starts from where you actually are.",
        "The gear you need, not the shop's whole catalogue.",
        "Training and recovery treated as one thing.",
      ],
      es: [
        "Objetivo, espacio y nivel: la IA parte de donde estás de verdad.",
        "El equipo que sirve, no el catálogo entero de la tienda.",
        "Entrenamiento y recuperación tratados como una sola cosa.",
      ],
      fr: [
        "Objectif, espace et niveau : l'IA part d'où vous êtes vraiment.",
        "Le matériel utile, pas tout le catalogue du magasin.",
        "Entraînement et récupération traités comme un seul sujet.",
      ],
      de: [
        "Ziel, Platz und Level: die KI startet da, wo du wirklich stehst.",
        "Die Ausrüstung, die zählt, nicht der ganze Ladenkatalog.",
        "Training und Erholung als eine Sache behandelt.",
      ],
    },
    steps: {
      it: ["L'obiettivo", "Lo spazio", "Il livello", "L'attrezzatura"],
      en: ["The goal", "The space", "The level", "The gear"],
      es: ["El objetivo", "El espacio", "El nivel", "El equipo"],
      fr: ["L'objectif", "L'espace", "Le niveau", "L'équipement"],
      de: ["Das Ziel", "Der Platz", "Das Level", "Die Ausrüstung"],
    },
    specs: [SPEC_MARKETS, SPEC_INPUT, SPEC_LANGUAGES, SPEC_ACCOUNT],
  },
  {
    /* La quarta della famiglia. Nasce dall'app «Calibro AI» gia
       costruita: testi, tesi e passi sono presi da li verbatim, non
       riscritti -- se il sito racconta una cosa e l'app ne fa un'altra,
       il primo a pagarlo e chi ci arriva.
       Sta ancora dietro al vetro: l'app esiste ma non ha un indirizzo
       pubblico, quindi `presto` e nessun collegamento. */
    id: "calibro",
    name: "Calibro AI",
    tagline: {
      it: "Il pezzo giusto per l'oggetto che hai già.",
      en: "The right part for the thing you already own.",
      es: "La pieza correcta para lo que ya tienes.",
      fr: "La bonne pièce pour ce que vous avez déjà.",
      de: "Das richtige Teil für das, was du schon hast.",
    },
    thesis: {
      it: "Dici cosa hai. L'AI capisce. Il codice esatto lo compri su Amazon.",
      en: "Say what you own. The AI understands. You buy the exact code on Amazon.",
      es: "Dices qué tienes. La IA entiende. Compras el código exacto en Amazon.",
      fr: "Vous dites ce que vous avez. L'IA comprend. Vous achetez le code exact sur Amazon.",
      de: "Sag, was du hast. Die KI versteht. Den genauen Code kaufst du bei Amazon.",
    },
    status: "presto",
    href: "",
    iconUrl: "/icons/calibro.svg",
    /* Cobalto: precisione, strumento di misura. Distinto dal magenta di
       Kado, dall'ambra di Bricolo e dal verde di Forma -- quattro tinte
       che non si confondono nemmeno di sfuggita. */
    core: "#3D7BFF",
    glow: "#7FB0FF",
    features: {
      it: [
        "Scrivi il modello o dettalo a voce, come ti viene.",
        "Il codice del ricambio esce da una tabella verificata, non indovinato.",
        "La campanella ti avvisa quando è ora di ricomprarlo.",
      ],
      en: [
        "Type the model or just say it out loud.",
        "The part code comes from a verified table, never guessed.",
        "The bell tells you when it's time to buy it again.",
      ],
      es: [
        "Escribe el modelo o dilo en voz alta.",
        "El código del recambio sale de una tabla verificada, no adivinado.",
        "La campana te avisa cuando toca recomprarlo.",
      ],
      fr: [
        "Tapez le modèle ou dites-le simplement à voix haute.",
        "Le code de la pièce vient d'une table vérifiée, jamais deviné.",
        "La cloche vous prévient quand il faut la racheter.",
      ],
      de: [
        "Modell eingeben oder einfach laut sagen.",
        "Der Teilecode kommt aus einer geprüften Tabelle, nie geraten.",
        "Die Glocke sagt dir, wann es Zeit zum Nachkaufen ist.",
      ],
    },
    steps: {
      it: ["L'oggetto", "Il modello", "Il pezzo", "Il promemoria"],
      en: ["The thing", "The model", "The part", "The reminder"],
      es: ["El objeto", "El modelo", "La pieza", "El recordatorio"],
      fr: ["L'objet", "Le modèle", "La pièce", "Le rappel"],
      de: ["Das Gerät", "Das Modell", "Das Teil", "Die Erinnerung"],
    },
    specs: [SPEC_MERCATI_CALIBRO, SPEC_INGRESSI_CALIBRO, SPEC_LINGUE_CALIBRO, SPEC_ACCOUNT],
  },
];
