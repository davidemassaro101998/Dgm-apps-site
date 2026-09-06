# Sorgenti delle app che non hanno ancora un repo loro

Qui dentro sta il **sorgente eseguibile** delle app della famiglia DGM che
oggi vivono come artifact e non hanno un repository proprio. Non e' una
copia di comodo: e' l'unico posto dove quel codice sopravvive allo
spegnimento del contenitore, e la regola vale quanto per il resto — cio'
che non e' committato non e' mai esistito.

## calibro/

`Calibro AI`, la quarta app del catalogo. Un file solo, senza dipendenze
da compilare: si apre in un browser e funziona.

- **artifact** (l'unica versione che gira su un indirizzo):
  `https://claude.ai/code/artifact/e0f343ae-8d76-4160-b1da-661adc0b317b`
- **come si prova in locale:** `cd calibro && python3 -m http.server 4304`
- **come si aggiorna l'artifact:** si ripubblica **passando quell'url**,
  mai senza — altrimenti nasce una seconda copia e nessuno sa piu' quale
  sia quella buona.
- **le schermate del sito** (`public/screens/calibro-*.webp`) si
  rifanno da qui: si serve l'app in locale e si cattura a 390x844,
  fattore 2, in italiano e in inglese.

Quando Calibro avra' un repository e un indirizzo pubblico suoi, questa
cartella sparisce e la scheda in `src/data/apps.ts` passa da `presto` a
`live`.
