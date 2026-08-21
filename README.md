# DGM Apps — Sito Vetrina

Sito ufficiale della famiglia DGM Apps (React + Vite + Tailwind v4), con hero
a schermo intero, sezione "Chi siamo", carosello del catalogo app e footer —
navigazione a pagine intere (scroll/swipe), disponibile in 5 lingue
(IT/EN/ES/FR/DE, stesse lingue supportate dalle app della famiglia).

App attualmente in catalogo: **ExitKit**, **Kado AI**, **Bricolo AI**, **Forma AI**,
più due slot segnaposto ("Presto disponibile") per le prossime.

## Identità cromatica

Due accenti fissi del marchio DGM Apps, sempre gli stessi indipendentemente da
quante app si aggiungono in futuro:

- **Viola** `#8B5CF6` / `#A78BFA`
- **Ciano** `#22D3EE` / `#67E8F9`

(un terzo accento, ambra `#FBBF24`, è disponibile nel sistema per varietà tra
le card del carosello, ma non è un colore fisso del marchio).

Ogni app nel catalogo è rappresentata dalla propria icona (nessuna card con
sfondo attorno: l'icona stessa è il pulsante, come sulla schermata home di un
telefono) — non ha bisogno di un colore dedicato sul sito: il colore di ogni
app vive dentro l'app stessa.

## Lingue e testi legali

`src/context/LanguageContext.tsx` contiene tutte le traduzioni (IT/EN/ES/FR/DE)
e la lista lingue attive (`LANGUAGES`). Il footer include Privacy Policy e
Termini di Servizio come modali (`src/components/ui/legal-modal.tsx`), con
testo tradotto in tutte e 5 le lingue: sono testi informativi generici (il
sito non raccoglie dati personali né elabora pagamenti — ogni acquisto avviene
nello store dell'app). Da aggiornare se in futuro cambiano le pratiche reali
di raccolta dati.

## Sviluppo locale

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build di produzione in dist/
npm run preview  # serve la build di produzione
npm run lint     # tsc --noEmit
```

Nessuna chiave API richiesta per lo sviluppo/build di questo sito: le
dipendenze legate a Gemini/Express sono eredità del template di AI Studio ma
non sono usate da nessun componente.

## Aggiungere una nuova app al catalogo

Modifica `src/data/apps.ts`: aggiungi una nuova voce con `id`, `name`
(IT/EN), `tagline` (IT/EN), `status` (`"live"` | `"beta"` | `"presto"`),
`accent` (`"violet"` | `"cyan"` | `"amber"`) e, quando lo screenshot reale è
pronto, `image` (data URI o URL). Finché `image` non è impostato, la card
mostra un placeholder generato automaticamente nel colore dell'accent scelto.
