/* ============================================================
   SMART QUOTE — il motore, parte logica.

   Un solo file per tutte le aziende. Quello che cambia da un
   cliente all'altro sta in SQ_CONFIG (il JSON), mai qui.

   Cosa fa: porta il visitatore attraverso al massimo sei
   domande e gli mostra la richiesta già scritta, come la
   riceverebbe l'azienda. Nella dimostrazione non parte niente:
   nessun invio, nessun dato salvato, nessuna chiamata di rete.
   ============================================================ */

(function () {
  "use strict";

  var cfg = window.SQ_CONFIG;
  var radice = document.getElementById("smart-quote");
  if (!cfg || !radice) return;

  var domande = cfg.questions || [];
  var risposte = {};        // id domanda → id opzione
  var passo = 0;            // 0..domande.length, l'ultimo è il risultato

  /* ---------- attrezzi ---------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function opzioneScelta(d) {
    var id = risposte[d.id];
    if (!id) return null;
    for (var i = 0; i < d.options.length; i++) if (d.options[i].id === id) return d.options[i];
    return null;
  }

  /* Il punteggio serve solo a far vedere all'azienda come
     potrebbe ordinare le richieste. Le regole vere le approva
     lei: qui sono una proposta, e la pagina lo dice. */
  function punteggio() {
    var regole = (cfg.leadScoring && cfg.leadScoring.rules) || [];
    var tot = 0;
    for (var i = 0; i < regole.length; i++) {
      var r = regole[i];
      if (risposte[r.question] === r.option) tot += Number(r.points) || 0;
    }
    return tot;
  }

  function fascia() {
    var p = punteggio();
    var bande = (cfg.leadScoring && cfg.leadScoring.bands) || [];
    for (var i = 0; i < bande.length; i++) if (p >= bande[i].min) return bande[i];
    return bande[bande.length - 1] || { label: "Da valutare" };
  }

  /* L'avviso sta dentro il blocco, non nella pagina attorno: nel sito
     del cliente si incolla solo questo, e la cornice di prova sparisce. */
  function avviso() {
    return '<small class="sq__demo">' + esc(cfg.client.demoDisclaimer) + '</small>';
  }

  /* ---------- le schermate ---------- */

  function vistaDomanda(d, n) {
    var scelta = risposte[d.id];
    return '' +
      '<div class="sq__top">' +
        '<p class="sq__eyebrow">' + esc(cfg.intro.eyebrow) + '</p>' +
        '<span class="sq__count">Domanda ' + (n + 1) + ' di ' + domande.length + '</span>' +
      '</div>' +
      '<div class="sq__bar"><i style="width:' + Math.round((n / domande.length) * 100) + '%"></i></div>' +
      '<h2 class="sq__q" id="sq-q">' + esc(d.title) + '</h2>' +
      (d.hint ? '<p class="sq__hint">' + esc(d.hint) + '</p>' : '') +
      '<div class="sq__opts" role="group" aria-labelledby="sq-q">' +
        d.options.map(function (o) {
          return '<button type="button" class="sq__opt" data-opt="' + esc(o.id) + '"' +
            ' aria-pressed="' + (scelta === o.id ? "true" : "false") + '">' +
            '<span class="sq__tick" aria-hidden="true"></span>' +
            '<span><b>' + esc(o.label) + '</b>' +
            (o.note ? '<span>' + esc(o.note) + '</span>' : '') + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<div class="sq__nav">' +
        (n > 0 ? '<button type="button" class="sq__btn sq__btn--back" data-go="indietro">Indietro</button>' : '') +
        '<button type="button" class="sq__btn sq__btn--go" data-go="avanti"' + (scelta ? '' : ' disabled') + '>' +
          (n === domande.length - 1 ? 'Vedi la richiesta' : 'Avanti') +
        '</button>' +
      '</div>' +
      avviso();
  }

  function vistaRisultato() {
    var f = fascia();
    return '' +
      '<div class="sq__done">' +
        '<div class="sq__top">' +
          '<p class="sq__eyebrow">' + esc(cfg.intro.eyebrow) + '</p>' +
          '<span class="sq__count">Completato</span>' +
        '</div>' +
        '<div class="sq__bar"><i style="width:100%"></i></div>' +
        '<h2 class="sq__q">' + esc(cfg.result.title) + '</h2>' +
        '<p class="sq__hint">' + esc(cfg.result.subtitle) + '</p>' +

        '<div class="sq__card">' +
          '<h3>Nuova richiesta dal sito</h3>' +
          '<dl class="sq__rows">' +
            domande.map(function (d) {
              var o = opzioneScelta(d);
              if (!o) return '';
              return '<div class="sq__row"><dt>' + esc(d.summaryLabel || d.title) + '</dt>' +
                     '<dd>' + esc(o.label) + '</dd></div>';
            }).join('') +
          '</dl>' +
          (cfg.leadScoring && cfg.leadScoring.enabledInDemo
            ? '<p class="sq__prio"><i aria-hidden="true"></i>' +
              '<span><b>' + esc(f.label) + '</b> — ' + esc(f.note || '') + '</span></p>'
            : '') +
        '</div>' +

        (cfg.leadScoring && cfg.leadScoring.enabledInDemo
          ? '<p class="sq__note">' + esc(cfg.leadScoring.disclaimer) + '</p>' : '') +

        '<div class="sq__nav">' +
          '<button type="button" class="sq__restart" data-go="ricomincia">Ricomincia</button>' +
        '</div>' +
        avviso() +
      '</div>';
  }

  function disegna(muoviIlFuoco) {
    radice.innerHTML = passo < domande.length ? vistaDomanda(domande[passo], passo) : vistaRisultato();
    /* Chi naviga da tastiera o con lo screen reader deve sapere che la
       schermata è cambiata: il fuoco va sulla nuova domanda, non resta
       su un bottone che non esiste più. */
    if (muoviIlFuoco) {
      var titolo = radice.querySelector('.sq__q');
      if (titolo) { titolo.setAttribute('tabindex', '-1'); titolo.focus({ preventScroll: true }); }
    }
  }

  /* ---------- i comandi ---------- */

  radice.addEventListener('click', function (e) {
    var opt = e.target.closest('[data-opt]');
    if (opt) {
      risposte[domande[passo].id] = opt.dataset.opt;
      disegna(false);
      return;
    }
    var go = e.target.closest('[data-go]');
    if (!go) return;
    if (go.dataset.go === 'avanti' && risposte[domande[passo].id]) { passo++; disegna(true); }
    if (go.dataset.go === 'indietro' && passo > 0) { passo--; disegna(true); }
    if (go.dataset.go === 'ricomincia') { risposte = {}; passo = 0; disegna(true); }
  });

  /* Le frecce scorrono le opzioni, come in un gruppo di scelte vero. */
  radice.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var opts = Array.prototype.slice.call(radice.querySelectorAll('[data-opt]'));
    var i = opts.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    opts[(i + (e.key === 'ArrowDown' ? 1 : opts.length - 1)) % opts.length].focus();
  });

  disegna(false);
})();
