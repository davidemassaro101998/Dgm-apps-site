# Smart Quote Factory

Un percorso di al massimo sei domande da mettere nel sito di un'azienda
che vende su preventivo. Il visitatore clicca invece di scrivere, e
all'azienda arriva una richiesta già organizzata al posto di «buongiorno,
vorrei informazioni».

Le istruzioni complete stanno in `docs/MASTER.md`. Qui c'è solo come si usa.

## Generare una demo

```bash
node scripts/generate-demo.mjs clients/ferrall.json
```

Esce **un file solo** in `generated/<slug>/index.html`: si apre con un
doppio clic, si manda per email, non va pubblicato.

Il comando si rifiuta di generare se il JSON è incompleto, se le domande
sono più di sei, o se nella configurazione c'è un contatto reale
(WhatsApp, email, telefono). Un generatore che lascia passare queste
cose non sta controllando niente.

## Controllare prima di consegnare

```bash
node tests/qa.mjs
```

111 prove su tutte le demo presenti: nessun contatto reale, nessun invio,
nessuna chiamata di rete, il percorso avanti e indietro, la scheda che
riporta davvero le scelte fatte, quattro schermi da 360 a 1440, il
carattere raddoppiato, la tastiera, i contrasti calcolati, e che
**l'accento dipinto sia quello dell'azienda** e non il ripiego del motore.

Esce con 1 se qualcosa è rotto, così non si consegna a occhio.

## Come è fatto

```
engine/       il motore: styles.css + app.js. Uguale per tutti.
clients/      un JSON per azienda. È qui che si lavora.
generated/    le demo, un file ciascuna. Si rigenerano, non si toccano a mano.
scripts/      generate-demo.mjs: valida, incorpora, riferisce.
tests/        qa.mjs: le 111 prove.
docs/         MASTER.md (l'incarico) · CANDIDATI.md (chi è già stato fatto)
```

Il motore non ha **nessun colore scritto a mano**: tutto passa dalle
variabili che il file del cliente riempie. Il motore decide il ritmo,
l'azienda decide l'aspetto.

## Due cose che non si fanno

**Non si contatta nessuno.** Le demo si preparano e si lasciano a Davide.
L'email si scrive come bozza, non si manda.

**Non si usa il logo dell'azienda.** Colori, caratteri e ritmo sì: sono
quello che fa sembrare il blocco parte del sito. Il marchio no, e
l'avviso «concept dimostrativo indipendente, non ufficiale» sta dentro
il blocco, non solo nella pagina di prova — perché nel sito del cliente
si incolla solo il blocco.
