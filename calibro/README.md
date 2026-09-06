# Calibro AI — prova

Quarta della famiglia DGM Apps. Non è ancora un'app col suo repository:
è un **prototipo in un file solo**, `calibro/index.html`, che si apre
facendo doppio clic — nessuna installazione, nessuna chiave.

## L'idea

Le altre tre rispondono a «cosa compro». Questa risponde a **«cosa serve
all'oggetto che ho già»**: scrivi `xp-2200` e ti dà `Epson 604 (ananas)`
e `604XL`, non «una cartuccia Epson».

La tesi, in una riga: **la compatibilità non si indovina.** L'AI serve a
capire cosa hai in mano (testo libero, voce, un giorno la foto
dell'etichetta); il codice del pezzo esce da una tabella verificata a
mano. Una sigla inventata fa comprare la cartuccia sbagliata, ed è peggio
di nessuna risposta.

## Cosa c'è dentro

- 29 modelli veri su 6 categorie: stampanti (HP 302 · 304 · 305 · 150A,
  Canon PG-545/CL-546, Epson 603 · 604, Brother LC421), aspirapolvere
  (Miele FJM · GN, Folletto FP200, Dyson), robot (Roomba, Roborock),
  caffè (De'Longhi DLSC002, AquaClean, Nespresso), acqua (Brita, BWT,
  Laica), bici (catene per numero di velocità, camere per misura).
- **La campanella**: salvi il pezzo e ti avvisa quando è ora di
  ricomprarlo. È il pezzo che Bricolo, Kado e Forma non hanno — lì
  l'utente sparisce dopo il primo click, qui torna da solo.
- 5 lingue, e la lingua cambia anche il negozio: DE → amazon.de con il
  tag tedesco.
- Schermo pieno senza scorrimento di pagina, come le altre della
  famiglia. Accento cobalto, distinto dall'ambra di Bricolo, dal magenta
  di Kado, dal lime di Forma.

## Cosa manca per farla vera

1. **Gemini** al posto della ricerca locale, per il parlato e la foto
   dell'etichetta. La parte che dice quale pezzo entra resta comunque la
   tabella: quella non va data a un modello linguistico.
2. **La tabella**, che è il vero lavoro e la vera barriera: si allarga a
   mano, categoria per categoria. È anche il motivo per cui non basta
   copiare l'app per copiare il prodotto.
3. I **tag di affiliazione** veri per ogni mercato (adesso sono
   segnaposto in cima al file, in `MERCATI`).
4. La struttura del repository come le altre app (Vite, Express, PWA,
   service worker).

Provato su iPhone 12 → 16 Pro Max: niente che sborda, nessuna pagina che
scorre, il promemoria sopravvive al riavvio, nessun errore.
