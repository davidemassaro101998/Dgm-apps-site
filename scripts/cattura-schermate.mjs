/* Rigenera le schermate vere che stanno dentro i telefoni della hero.
   Da lanciare quando una delle tre app cambia aspetto, altrimenti il
   sito continua a mostrare un prodotto che non esiste piu.

   Prima: build e preview delle tre app sulle porte qui sotto
     (cd ../kado-app && npm run build && npx vite preview --port 4301)
   Poi:  node scripts/cattura-schermate.mjs
   Infine: converti i PNG in webp e cancella i PNG (a 780x1688 un PNG
     pesa ~140KB, lo stesso in webp qualita 82 ne pesa ~26). */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

/* Viewport di un telefono vero, non le dimensioni del foro nella
   cornice. Il foro e' 510x1095 (proporzione 0.466) e catturare a
   quella LARGHEZZA lascia grandi vuoti: le misure dell'app sono in px
   fissi, quindi a 510px il contenuto non cresce e galleggia. A 390x844
   (proporzione 0.462, differenza sotto l'1%) l'app si dispone come su
   un telefono e l'immagine viene poi scalata dentro il foro. */
const W = 390;
const H = 844;

const APPS = [
  { id: "kado", port: 4301, store: "kado_onboarding_seen" },
  { id: "bricolo", port: 4302, store: "bricolo_onboarding_seen" },
  { id: "forma", port: 4303, store: "forma_onboarding_seen" },
];
const LINGUE = [
  { code: "it", locale: "it-IT" },
  { code: "en", locale: "en-US" },
];

mkdirSync("public/screens", { recursive: true });
const b = await chromium.launch();

for (const app of APPS) {
  for (const lang of LINGUE) {
    const ctx = await b.newContext({
      viewport: { width: W, height: H },
      deviceScaleFactor: 2,
      locale: lang.locale,
    });
    const p = await ctx.newPage();
    await p.addInitScript((key) => {
      try {
        localStorage.setItem(key, "1");
        // Il banner "installa l'app" e' un invito rivolto a chi usa
        // l'app, non qualcosa da mostrare in vetrina.
        localStorage.setItem("pwa_dismissed", "true");
      } catch (e) {}
    }, app.store);
    await p.goto(`http://localhost:${app.port}`, { waitUntil: "networkidle" });
    // Lo splash dura qualche secondo: senza attesa si cattura quello.
    await p.waitForTimeout(3200);
    const out = `public/screens/${app.id}-${lang.code}.png`;
    await p.screenshot({ path: out });
    console.log("catturato", out);
    await ctx.close();
  }
}
await b.close();
