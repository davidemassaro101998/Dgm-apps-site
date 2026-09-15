/* QA obbligatorio del documento, sezione 13. Si misura, non si deduce.
   Esce con 1 se qualcosa è rotto: così non si consegna una demo a occhio. */
import { createRequire } from "node:module";
const { chromium } = createRequire("/opt/node22/lib/node_modules/")("playwright");
import { readdirSync } from "node:fs";

const QUI = process.cwd();
const esiti = [];
const dice = (c, a, t, d = "") => esiti.push({ s: c ? "ok" : "ko", a, t, d });
const SCHERMI = [["360×800", 360, 800], ["390×844", 390, 844], ["768×1024", 768, 1024], ["1440×900", 1440, 900]];

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

/* Con quindici demo la batteria intera passa i due minuti. Un argomento
   sulla riga di comando ne prova una sola: serve mentre si lavora su
   quella, non al posto del giro completo prima del commit. */
const chiesti = process.argv.slice(2);
const daProvare = readdirSync("generated").filter((s) => !chiesti.length || chiesti.includes(s));
if (!daProvare.length) { console.error("nessuna demo con quel nome"); process.exit(1); }

for (const slug of daProvare) {
  const url = "file://" + QUI + "/generated/" + slug + "/index.html";

  /* --- 1. niente contatti reali, niente invii, niente rete --- */
  {
    const ctx = await b.newContext();
    const p = await ctx.newPage();
    const fuori = [], errori = [];
    p.on("pageerror", (e) => errori.push(e.message));
    p.on("request", (r) => {
      const u = r.url();
      if (!u.startsWith("file://") && !u.startsWith("data:") && !/fonts\.(googleapis|gstatic)/.test(u)) fuori.push(u);
    });
    await p.goto(url);
    await p.waitForTimeout(600);
    const t = await p.evaluate(() => document.body.innerHTML);
    const senzaColori = t.replace(/#[0-9a-f]{3,8}/gi, "");
    dice(!/wa\.me|api\.whatsapp/i.test(t), slug, "nessun link WhatsApp");
    dice(!/[\w.+-]+@[\w-]+\.(it|com|net|eu)/i.test(t), slug, "nessuna email");
    dice(!/(?:\+39)?[\s.-]?0\d{1,3}[\s.-]?\d{5,8}\b/.test(senzaColori), slug, "nessun numero di telefono");
    dice((await p.locator("form").count()) === 0, slug, "nessun modulo che possa inviare");
    dice(fuori.length === 0, slug, "nessuna chiamata di rete oltre al carattere", fuori.slice(0, 2).join(" "));
    dice(errori.length === 0, slug, "nessun errore JavaScript", errori.join(" | ").slice(0, 100));
    dice(/concept dimostrativo/i.test(t), slug, "avviso di concept presente");
    dice((await p.locator(".sq__demo").count()) > 0, slug,
      "l'avviso sta DENTRO il blocco, non solo nella pagina di prova");

    /* La prova che mancava, e che ha fatto passare tre demo tutte rosse:
       il colore dipinto dev'essere quello del file del cliente, non il
       ripiego del motore. Se questa non c'è, il prodotto può smettere di
       fare l'unica cosa che vende senza che nessuno se ne accorga. */
    const tema = await p.evaluate(() => {
      const hex = (c) => "#" + c.match(/\d+/g).slice(0, 3)
        .map((n) => (+n).toString(16).padStart(2, "0")).join("");
      return {
        atteso: window.SQ_CONFIG.theme.accent.toLowerCase(),
        dipinto: hex(getComputedStyle(document.querySelector(".sq__eyebrow")).color)
      };
    });
    dice(tema.dipinto === tema.atteso, slug,
      `l'accento dipinto è quello dell'azienda (${tema.atteso})`,
      tema.dipinto !== tema.atteso ? `dipinge ${tema.dipinto}` : "");
    await ctx.close();
  }

  /* --- 2. il percorso intero, come lo farebbe una persona --- */
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    const errori = [];
    p.on("pageerror", (e) => errori.push(e.message));
    await p.goto(url);
    await p.waitForTimeout(400);

    dice(await p.locator('[data-go="avanti"]').isDisabled(), slug, "senza risposta non si va avanti");

    const nDom = await p.evaluate(() => window.SQ_CONFIG.questions.length);
    const scelte = [];
    for (let i = 0; i < nDom; i++) {
      const conta = await p.locator(".sq__count").innerText();
      dice(conta.includes(`${i + 1} di ${nDom}`), slug, `il contatore dice ${i + 1} di ${nDom}`, conta);
      const n = await p.locator("[data-opt]").count();
      const k = i % n;
      scelte.push((await p.locator("[data-opt]").nth(k).innerText()).split("\n")[0].trim());
      await p.locator("[data-opt]").nth(k).click();
      await p.waitForTimeout(90);
      await p.locator('[data-go="avanti"]').click();
      await p.waitForTimeout(150);
    }

    const card = await p.locator(".sq__card").innerText();
    const perse = scelte.filter((s) => !card.includes(s));
    dice(perse.length === 0, slug, "la scheda riporta esattamente le scelte fatte", perse.join(" · "));
    dice(/priorità|esplorativa/i.test(card), slug, "la priorità viene mostrata");
    dice(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(card), slug, "nessuna emoji nel riepilogo");

    await p.locator('[data-go="ricomincia"]').click();
    await p.waitForTimeout(220);
    const rimaste = await p.evaluate(() => document.querySelectorAll('[aria-pressed="true"]').length);
    dice(rimaste === 0, slug, "ricomincia cancella davvero le risposte", rimaste + " rimaste");

    await p.locator("[data-opt]").first().click();
    await p.waitForTimeout(80);
    await p.locator('[data-go="avanti"]').click();
    await p.waitForTimeout(130);
    await p.locator('[data-go="indietro"]').click();
    await p.waitForTimeout(170);
    dice((await p.locator("[data-opt]").first().getAttribute("aria-pressed")) === "true", slug, "indietro conserva la risposta");
    dice(errori.length === 0, slug, "nessun errore in tutto il giro", errori.join(" | ").slice(0, 100));
    await ctx.close();
  }

  /* --- 3. gli schermi, e lo zoom al 200% --- */
  for (const [nome, w, h] of SCHERMI) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.goto(url);
    await p.waitForTimeout(350);
    const ox = await p.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
    dice(ox <= 1, slug, `${nome}: niente scorrimento laterale`, ox ? ox + "px" : "");
    const piccoli = await p.evaluate(() =>
      [...document.querySelectorAll("button")].filter((b) => b.offsetParent)
        .map((b) => Math.round(b.getBoundingClientRect().height)).filter((x) => x > 0 && x < 44).length);
    dice(piccoli === 0, slug, `${nome}: nessun comando sotto i 44px`, piccoli + " piccoli");
    await ctx.close();
  }
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    await p.goto(url);
    /* Il requisito e' "testi leggibili al 200%", cioe' il CARATTERE raddoppiato.
       Scalare tutta la pagina con zoom fa uscire di lato qualunque cosa, anche
       una pagina perfetta: sarebbe una prova che fallisce sempre, quindi inutile. */
    await p.evaluate(() => { document.documentElement.style.fontSize = "32px"; });
    await p.waitForTimeout(300);
    const ox = await p.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
    dice(ox <= 2, slug, "carattere al 200%: niente scorrimento laterale", ox ? ox + "px" : "");
    const leggibile = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".sq__opt")).fontSize));
    dice(leggibile >= 16, slug, `carattere al 200%: le risposte restano a ${Math.round(leggibile)}px`);
    await ctx.close();
  }

  /* --- 4. tastiera, fuoco, contrasto --- */
  {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(url);
    await p.waitForTimeout(350);
    await p.keyboard.press("Tab");
    const primo = await p.evaluate(() => document.activeElement?.className || "");
    dice(/sq__opt/.test(primo), slug, "il primo Tab arriva sulle risposte", primo.slice(0, 30));
    await p.keyboard.press("Enter");
    await p.waitForTimeout(140);
    dice((await p.evaluate(() => document.querySelectorAll('[aria-pressed="true"]').length)) === 1,
      slug, "si risponde da tastiera con Invio");

    const c = await p.evaluate(() => {
      const lum = (col) => {
        const [r, g, bl] = col.match(/\d+/g).slice(0, 3).map(Number).map((v) => {
          v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
      };
      const rap = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
      const sf = getComputedStyle(document.querySelector(".sq")).backgroundColor;
      const q = document.querySelector(".sq__q");
      const hint = document.querySelector(".sq__hint") || document.querySelector(".sq__count");
      const go = document.querySelector(".sq__btn--go");
      return {
        titolo: +rap(getComputedStyle(q).color, sf).toFixed(2),
        muto: +rap(getComputedStyle(hint).color, sf).toFixed(2),
        bottone: +rap(getComputedStyle(go).color, getComputedStyle(go).backgroundColor).toFixed(2)
      };
    });
    dice(c.titolo >= 4.5, slug, `contrasto del titolo ${c.titolo}:1`, c.titolo < 4.5 ? "serve almeno 4.5" : "");
    dice(c.muto >= 4.5, slug, `contrasto del testo secondario ${c.muto}:1`, c.muto < 4.5 ? "serve almeno 4.5" : "");
    dice(c.bottone >= 4.5, slug, `contrasto del bottone ${c.bottone}:1`, c.bottone < 4.5 ? "serve almeno 4.5" : "");
    await ctx.close();
  }
}

await b.close();

let area = "";
for (const e of esiti) {
  if (e.a !== area) { area = e.a; console.log(`\n${area.toUpperCase()}`); }
  console.log(`  ${e.s === "ok" ? "ok  " : "KO  "}${e.t}${e.d ? "  — " + e.d : ""}`);
}
const ko = esiti.filter((e) => e.s === "ko");
console.log(ko.length ? `\n${ko.length} problemi su ${esiti.length} prove.` : `\nTutto a posto: ${esiti.length} prove, nessun problema.`);
process.exit(ko.length ? 1 : 0);
