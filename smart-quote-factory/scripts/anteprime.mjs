/* ============================================================
   Le anteprime da far vedere a Davide.

      node scripts/anteprime.mjs            tutte
      node scripts/anteprime.mjs puntoinfissi pfportefinestre

   Per ogni azienda una scheda sola: la prima domanda sul
   telefono, la scheda che arriverebbe in azienda, e la stessa
   prima domanda sul computer. In piu' un confronto affiancato:
   serve a vedere in un colpo che i blocchi NON si somigliano —
   il giorno che tornano tutti uguali, il prodotto ha smesso di
   fare l'unica cosa che vende.

   Finisce in anteprime/, che viene committata: le immagini sono
   la cosa che si guarda in riunione, e un file nel contenitore
   temporaneo non esiste piu' il giorno dopo.
   ============================================================ */

import { createRequire } from "node:module";
import { readdirSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire("/opt/node22/lib/node_modules/")("playwright");

const RADICE = join(dirname(fileURLToPath(import.meta.url)), "..");
const GEN = join(RADICE, "generated");
const OUT = join(RADICE, "anteprime");
const TMP = join(OUT, ".pezzi");

const chiesti = process.argv.slice(2);
const slugs = readdirSync(GEN).filter((s) => !chiesti.length || chiesti.includes(s));
if (!slugs.length) { console.error("nessuna demo da fotografare"); process.exit(1); }

mkdirSync(TMP, { recursive: true });
const dati = (s) => JSON.parse(readFileSync(join(RADICE, "clients", s + ".json"), "utf8"));
/* Le immagini vanno incorporate: una pagina creata con setContent vive su
   about:blank, e da li' il browser i file locali non li carica. */
const dentro = (f) => "data:image/png;base64," + readFileSync(join(TMP, f)).toString("base64");

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

async function finoInFondo(p) {
  const n = await p.evaluate(() => window.SQ_CONFIG.questions.length);
  for (let i = 0; i < n; i++) {
    await p.locator("[data-opt]").first().click();
    await p.waitForTimeout(80);
    await p.locator('[data-go="avanti"]').click();
    await p.waitForTimeout(160);
  }
  await p.waitForTimeout(400);
}

for (const slug of slugs) {
  const url = "file://" + join(GEN, slug, "index.html");
  for (const [nome, w] of [["mobile", 390], ["desktop", 1280]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.goto(url);
    await p.waitForTimeout(700);
    await p.locator(".sq").screenshot({ path: join(TMP, `${slug}-${nome}-domanda.png`) });
    await finoInFondo(p);
    await p.locator(".sq").screenshot({ path: join(TMP, `${slug}-${nome}-scheda.png`) });
    await ctx.close();
  }
}

const STILE = `
  * { box-sizing: border-box; }
  body { margin:0; background:#111113; font:14px/1.5 system-ui,sans-serif; color:#e8e8ea; padding:26px; }
  h1 { font-size:20px; margin:0 0 2px; letter-spacing:-.01em; }
  .sotto { color:#9a9aa2; font-size:13px; margin:0 0 20px; }
  .pastiglie { display:flex; gap:7px; margin:0 0 20px; flex-wrap:wrap; }
  .pastiglia { display:flex; align-items:center; gap:7px; background:#1c1c20; border:1px solid #2c2c32;
               border-radius:999px; padding:5px 12px 5px 6px; font-size:12px; color:#c8c8d0; }
  .bollo { width:15px; height:15px; border-radius:50%; border:1px solid rgba(255,255,255,.22); }
  .riga { display:flex; gap:18px; align-items:flex-start; }
  figure { margin:0; }
  figcaption { font-size:11.5px; color:#8a8a92; text-transform:uppercase; letter-spacing:.09em;
               margin:0 0 8px; font-weight:600; }
  img { display:block; border-radius:7px; box-shadow:0 10px 30px rgba(0,0,0,.5); }
`;

async function foglio(html, largo, file) {
  const ctx = await b.newContext({ viewport: { width: largo, height: 400 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.setContent(`<!doctype html><meta charset="utf-8"><style>${STILE}</style>${html}`);
  await p.waitForLoadState("networkidle");
  await p.waitForTimeout(400);
  await p.screenshot({ path: join(OUT, file), fullPage: true });
  await ctx.close();
  console.log("  " + file);
}

for (const slug of slugs) {
  const c = dati(slug), t = c.theme;
  await foglio(`
    <h1>${c.client.name}</h1>
    <p class="sotto">${c.client.place || ""} &middot; ${c.client.sourceUrl.replace(/^https?:\/\//, "")}
       &middot; ${c.questions.length} domande</p>
    <div class="pastiglie">
      <span class="pastiglia"><i class="bollo" style="background:${t.primary}"></i>${t.primary}</span>
      <span class="pastiglia"><i class="bollo" style="background:${t.accent}"></i>${t.accent}</span>
      <span class="pastiglia">${(t.fontHeading || "").split(",")[0].replace(/['"]/g, "")}</span>
    </div>
    <div class="riga">
      <figure><figcaption>Telefono &mdash; prima domanda</figcaption>
        <img src="${dentro(slug + "-mobile-domanda.png")}" style="width:340px"></figure>
      <figure><figcaption>Telefono &mdash; la scheda che arriva in azienda</figcaption>
        <img src="${dentro(slug + "-mobile-scheda.png")}" style="width:340px"></figure>
      <figure><figcaption>Computer</figcaption>
        <img src="${dentro(slug + "-desktop-domanda.png")}" style="width:520px"></figure>
    </div>`, 1320, `ANTEPRIMA-${slug}.png`);
}

const affiancate = slugs.map((s) =>
  `<figure><figcaption>${dati(s).client.name}</figcaption>
     <img src="${dentro(s + "-mobile-domanda.png")}" style="width:340px"></figure>`).join("");
await foglio(`
  <style>figcaption { font-size:13px; text-transform:none; letter-spacing:0; color:#e8e8ea; }
         .riga { flex-wrap:wrap; }</style>
  <h1>Le ${slugs.length} a confronto</h1>
  <p class="sotto">Stesso motore, stesso impianto. Se si somigliassero, il prodotto non venderebbe niente.</p>
  <div class="riga">${affiancate}</div>`,
  Math.min(2200, 52 + slugs.length * 358), "ANTEPRIMA-confronto.png");

await b.close();
rmSync(TMP, { recursive: true, force: true });
