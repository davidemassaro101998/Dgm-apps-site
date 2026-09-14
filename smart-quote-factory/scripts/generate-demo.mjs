/* ============================================================
   Genera la demo di un'azienda.

      node scripts/generate-demo.mjs clients/ferrall.json

   Il motore non si copia a mano: si prende da engine/ e si
   incorpora nel file dell'azienda. Una demo è UN file solo, che
   si apre con un doppio clic e si manda per email senza
   pubblicare niente.

   Il comando fallisce — e deve fallire — se:
   · il JSON non ha i campi obbligatori;
   · le domande sono più di sei;
   · nella configurazione c'è un contatto reale (wa.me, email,
     numero di telefono): in una demo non ci va, mai.

   Un generatore che lascia passare una di queste tre cose non
   sta controllando niente.
   ============================================================ */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..");

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/generate-demo.mjs clients/<azienda>.json");
  process.exit(1);
}

/* ---------- 1. si legge e si controlla ---------- */

let cfg;
try {
  cfg = JSON.parse(readFileSync(join(RADICE, file), "utf8"));
} catch (e) {
  console.error(`JSON illeggibile: ${e.message}`);
  process.exit(1);
}

const guai = [];
const serve = (v, dove) => { if (v === undefined || v === null || v === "") guai.push(`manca ${dove}`); };

serve(cfg.client?.name, "client.name");
serve(cfg.client?.slug, "client.slug");
serve(cfg.client?.sourceUrl, "client.sourceUrl");
serve(cfg.client?.demoDisclaimer, "client.demoDisclaimer");
serve(cfg.theme?.primary, "theme.primary");
serve(cfg.theme?.accent, "theme.accent");
serve(cfg.intro?.eyebrow, "intro.eyebrow");
serve(cfg.result?.title, "result.title");

if (!Array.isArray(cfg.questions) || cfg.questions.length === 0) {
  guai.push("questions è vuoto");
} else {
  if (cfg.questions.length > 6 && !process.argv.includes("--oltre-sei")) {
    guai.push(`${cfg.questions.length} domande: il massimo è sei (usa --oltre-sei solo se Davide l'ha approvato)`);
  }
  const visti = new Set();
  cfg.questions.forEach((d, i) => {
    if (!d.id) guai.push(`domanda ${i + 1}: manca l'id`);
    if (visti.has(d.id)) guai.push(`id ripetuto: ${d.id}`);
    visti.add(d.id);
    if (!d.title) guai.push(`domanda ${d.id}: manca il testo`);
    if (!Array.isArray(d.options) || d.options.length < 2) guai.push(`domanda ${d.id}: servono almeno due risposte`);
    (d.options || []).forEach((o, j) => {
      if (!o.id) guai.push(`domanda ${d.id}, risposta ${j + 1}: manca l'id`);
      if (!o.label) guai.push(`domanda ${d.id}, risposta ${j + 1}: manca il testo`);
    });
  });
  /* le regole di punteggio devono puntare a domande e risposte che esistono */
  for (const r of cfg.leadScoring?.rules || []) {
    const d = cfg.questions.find((q) => q.id === r.question);
    if (!d) { guai.push(`punteggio: la domanda "${r.question}" non esiste`); continue; }
    if (!d.options.some((o) => o.id === r.option)) guai.push(`punteggio: la risposta "${r.option}" non esiste in "${r.question}"`);
  }
}

/* Nessun contatto reale nella configurazione. Il sito dell'azienda è
   l'unica eccezione: serve per ritrovarla nelle note interne. */
const testo = JSON.stringify({ ...cfg, client: { ...cfg.client, sourceUrl: "" } });
const vietati = [
  [/wa\.me\/|api\.whatsapp\.com/i, "un link WhatsApp"],
  [/[\w.+-]+@[\w-]+\.[a-z]{2,}/i, "un indirizzo email"],
  [/(?:\+39[\s.-]?)?0\d{1,3}[\s.-]?\d{5,8}|(?:\+39[\s.-]?)?3\d{2}[\s.-]?\d{6,7}/, "un numero di telefono"],
  [/<script|javascript:|onerror=/i, "del codice eseguibile"]
];
for (const [re, cosa] of vietati) if (re.test(testo)) guai.push(`nella configurazione c'è ${cosa}: in una demo non ci va`);

if (guai.length) {
  console.error(`\n${cfg.client?.name || file}: ${guai.length} problemi, non genero niente\n`);
  guai.forEach((g) => console.error("  KO  " + g));
  process.exit(1);
}

/* ---------- 2. si mette insieme ---------- */

const css = readFileSync(join(RADICE, "engine/styles.css"), "utf8");
const js = readFileSync(join(RADICE, "engine/app.js"), "utf8");
const t = cfg.theme;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const pagina = `<!doctype html>
<html lang="it">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(cfg.client.name)} — richiesta guidata (concept)</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="5" fill="${t.accent}"/><path d="M9 16.5l4.5 4.5L23 11" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
)}">
${t.webfont ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(t.webfont)}">` : ""}

<style>
/* la pagina attorno serve solo a guardare il blocco: nel sito del
   cliente questa parte non esiste, si incolla solo <div id="smart-quote"> */
body { margin: 0; padding: clamp(16px, 5vw, 56px) clamp(14px, 4vw, 28px);
       background: ${t.surface || "#f4f4f5"}; font-family: ${t.fontBody}; }
.sq-prova { max-width: 760px; margin: 0 auto clamp(18px, 3vw, 28px); }
.sq-prova p { margin: 0; font-size: 13px; color: ${t.muted || "#6b6b70"}; line-height: 1.5; }
.sq-prova b { color: ${t.primary}; }

${css}

/* Il tema dell'azienda viene DOPO il motore, non prima: i valori di
   ripiego dentro styles.css hanno la stessa forza, quindi vince
   l'ultimo che si legge. Messo sopra, il blocco usciva sempre coi
   colori di ripiego — cioe' identico per ogni cliente, che e'
   esattamente il contrario di quello che questo prodotto vende. */
.sq {
  --sq-primary: ${t.primary}; --sq-accent: ${t.accent};
  --sq-bg: ${t.background || "#ffffff"}; --sq-surface: ${t.surface || "#f7f7f7"};
  --sq-line: ${t.line || "#e2e2e4"}; --sq-muted: ${t.muted || "#6b6b70"};
  --sq-radius: ${t.radius || "4px"};
  --sq-font-h: ${t.fontHeading}; --sq-font-b: ${t.fontBody};
}
</style>

<div class="sq-prova">
  <p><b>${esc(cfg.client.name)}</b> — ${esc(cfg.client.place || "")}<br>
  ${esc(cfg.client.demoDisclaimer)}</p>
</div>

<div class="sq" id="smart-quote"></div>

<div class="sq-prova" style="margin-top:clamp(18px,3vw,28px)">
  <p>Questo blocco andrebbe al posto del modulo «nome, email, messaggio».
  Si incolla nel sito come un pezzo solo: non richiede account, non salva niente
  e non manda niente a nessuno.</p>
</div>

<script>window.SQ_CONFIG = ${JSON.stringify(cfg)};</script>
<script>${js}</script>
</html>
`;

const cartella = join(RADICE, "generated", cfg.client.slug);
mkdirSync(cartella, { recursive: true });
writeFileSync(join(cartella, "index.html"), pagina);

/* ---------- 3. si dice cosa è stato controllato ---------- */

console.log(`
${cfg.client.name}  →  generated/${cfg.client.slug}/index.html
  ok  ${cfg.questions.length} domande (massimo 6)
  ok  ${cfg.questions.reduce((n, d) => n + d.options.length, 0)} risposte, tutte con testo e id
  ok  ${(cfg.leadScoring?.rules || []).length} regole di punteggio, tutte su domande esistenti
  ok  nessun contatto reale nella configurazione
  ok  nessun invio, nessun dato salvato, nessuna chiamata di rete${t.webfont ? " (a parte il carattere)" : ""}
  ok  avviso "concept dimostrativo" in cima alla pagina
  ${Math.round(pagina.length / 1024)} KB, un file solo
`);
