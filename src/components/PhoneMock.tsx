import type { AppEntry } from "../data/apps";
import type { Language } from "../context/LanguageContext";

/* La scocca e un render vero (public/telefono-cornice.webp), non un
   rettangolo disegnato in CSS: e' la stessa cornice usata sul sito
   Valdiriom, ripulita dal bagliore ciano/oro di quel marchio e resa
   trasparente fuori dalla sagoma, cosi l'alone dell'app le passa
   dietro invece di essere coperto da un rettangolo nero.

   Il render originale e un telefono visto leggermente di lato: il
   fianco sinistro era 1,6 volte il destro (42px contro 27), e dritto
   in vetrina leggeva storto. La scocca e stata resa simmetrica
   specchiando il lato buono, quindi le misure qui sotto sono cambiate
   insieme all'immagine -- sono ricavate dal PNG e non si ritoccano a
   occhio. */
const PHONE_ASPECT = "696 / 1264";
const SCREEN = {
  left: "13.218%",
  top: "6.487%",
  width: "73.563%",
  height: "88.291%",
  radius: "8.2% / 4.7%",
} as const;

/* Dentro lo schermo ci va la schermata VERA dell'app, catturata dalle
   app in esecuzione (script `cattura.mjs`), non una ricostruzione.
   Una miniatura ridisegnata a mano somiglia all'app finche' qualcuno
   non cambia l'app: da quel momento il sito mostra un prodotto che non
   esiste piu.

   Le app parlano due lingue, non cinque: chi legge il sito in italiano
   vede la schermata italiana, tutti gli altri quella inglese -- che e'
   esattamente quello che troveranno aprendola. */
function screenUrl(appId: string, language: Language): string {
  return `/screens/${appId}-${language === "it" ? "it" : "en"}.webp`;
}

export function PhoneMock({
  app,
  language,
  dimmed = false,
  /* Quando il telefono e' dietro al tamburo non si vede: opacita zero,
     scala 0,4, novecento pixel piu' in la. Chiedere la sua schermata
     costa comunque il download. Con quattro app erano 38 KB su 233 --
     un sesto della pagina -- per un'immagine che nessuno guarda. */
  visibile = true,
}: {
  app: AppEntry;
  language: Language;
  dimmed?: boolean;
  visibile?: boolean;
}) {
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
        className="absolute overflow-hidden"
        style={{
          left: SCREEN.left,
          top: SCREEN.top,
          width: SCREEN.width,
          height: SCREEN.height,
          borderRadius: SCREEN.radius,
          backgroundColor: "#0A070C",
        }}
      >
        {visibile ? (
        <img
          src={screenUrl(app.id, language)}
          alt={app.name}
          draggable={false}
          /* La cattura e' a 390x844 e il foro a 510x1095: proporzioni
             che differiscono sotto l'1%, quindi `cover` riempie senza
             che si veda alcun ritaglio. */
          className="h-full w-full object-cover"
          /* La centrale e' quella che si legge: parte per prima. Le due di
             fianco sono sfocate e al 42-48% di opacita, possono aspettare. */
          loading="eager"
          fetchPriority={dimmed ? "low" : "high"}
        />
        ) : null}
      </div>

      {/* La scocca sopra lo schermo: il foro del PNG e trasparente,
          quindi il contenuto si vede attraverso e i bordi arrotondati
          sono quelli veri del render, non un border-radius che prova a
          somigliargli. */}
      <img
        src="/telefono-cornice.webp"
        alt=""
        aria-hidden
        draggable={false}
        /* In webp, non in png: la stessa scocca pesava 214 KB ed era
           l'oggetto piu' pesante di tutto il sito -- piu' del doppio del
           JavaScript compresso. In webp qualita 92 sono 19 KB, con una
           differenza media di 1,56 su 255 sui pixel opachi (massima 11) e
           il canale di trasparenza identico: su fondo scuro non si vede.
           Su 3G lento erano quasi cinque secondi di sola cornice. */
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ filter: dimmed ? "brightness(0.62)" : undefined }}
      />
    </div>
  );
}
