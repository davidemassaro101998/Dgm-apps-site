import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Globe, Mail, ArrowUpRight, Lock } from "lucide-react";
import { useLanguage, LANGUAGES } from "../context/LanguageContext";
import { apps } from "../data/apps";
import { Logo } from "./ui/logo";
import { LegalModal } from "./ui/legal-modal";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Il sito e una schermata sola: non ci sono sezioni da raggiungere,
   quindi il menu non e navigazione -- e l'elenco delle app piu i
   contatti. Su telefono e un pannello a tutta altezza che scorre per
   conto suo: sceglierne una porta il tamburo su quell'app e ne apre la
   scheda, cosi il menu fa qualcosa invece di essere una lista morta. */
export function Header({ onSelectApp }: { onSelectApp?: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState<"privacy" | "terms" | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!langMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langMenuOpen]);

  /* Con il pannello aperto la pagina sotto non deve muoversi. La pagina
     e alta esattamente quanto la finestra e non scorre, ma su iOS il
     trascinamento la fa comunque rimbalzare sotto il pannello: e' la
     cosa che fa sembrare rotto un menu a telefono. */
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    // Il pannello prende il fuoco all'apertura: chi naviga da tastiera
    // continua da qui, non dall'inizio della pagina.
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handlePick = (id: string) => {
    setMenuOpen(false);
    onSelectApp?.(id);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[60]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="pointer-events-auto">
          <Logo />
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langMenuOpen}
              aria-controls="lang-switcher-listbox"
              className="tocco-44 relative flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white"
            >
              <Globe className="h-3.5 w-3.5 text-white/75" />
              {LANGUAGES.find((l) => l.code === language)?.label}
            </button>
            {langMenuOpen && (
              <div
                id="lang-switcher-listbox"
                role="listbox"
                className="absolute right-0 top-[calc(100%+8px)] z-20 flex min-w-[7rem] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0B0A0F]/95 py-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    role="option"
                    aria-selected={language === l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                      language === l.code
                        ? "bg-white/10 text-white"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="tocco-44 relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
            aria-label={menuOpen ? t.closeMenu : t.menuTitle}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t.closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="pointer-events-auto fixed inset-0 z-[59] cursor-default bg-black/60 backdrop-blur-sm"
            />

            {/* Da telefono e un pannello pieno che parte da sotto; da
                schermo largo e una scheda ancorata in alto a destra. Un
                solo elemento, due forme, cosi non ci sono due menu da
                tenere allineati. */}
            <motion.div
              id="site-menu"
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={t.menuTitle}
              data-overlay="true"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.36, ease: EASE }}
              className="pointer-events-auto fixed inset-x-0 bottom-0 z-[61] flex max-h-[86dvh] flex-col overflow-y-auto overscroll-contain rounded-t-3xl border-t border-white/10 bg-[#0B0A0F]/97 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-30px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl outline-none sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-16 sm:max-h-[80dvh] sm:w-[22rem] sm:rounded-2xl sm:border sm:pb-5"
            >
              {/* Maniglia: dice che il pannello si trascina/chiude, e da
                  qualcosa da toccare in cima senza colpire una voce. */}
              <div className="sticky top-0 z-10 flex justify-center bg-[#0B0A0F]/97 pb-2 pt-3 sm:hidden">
                <span aria-hidden className="h-1.5 w-10 rounded-full bg-white/20" />
              </div>

              <div className="flex flex-col gap-5 px-5 pt-2 sm:px-5 sm:pt-5">
                <div className="flex flex-col gap-2.5">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">
                    {t.allApps}
                  </span>

                  <ul className="flex flex-col gap-2">
                    {apps.map((app) => {
                      const openable = app.status !== "presto";
                      return (
                        <li key={app.id}>
                          <button
                            type="button"
                            onClick={() => handlePick(app.id)}
                            /* Riga alta 60px: sopra il minimo tattile, e
                               con tre voci sole non serve comprimerle. */
                            className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
                          >
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                              style={{
                                background: `linear-gradient(150deg, ${app.core}33, ${app.glow}14)`,
                                boxShadow: `inset 0 0 0 1px ${app.core}59`,
                              }}
                            >
                              <img src={app.iconUrl} alt="" aria-hidden className="h-6 w-6" />
                            </span>

                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="font-display text-sm font-bold text-white">
                                {app.name}
                              </span>
                              <span className="truncate text-xs text-white/70">
                                {app.tagline[language]}
                              </span>
                            </span>

                            {openable ? (
                              <ArrowUpRight className="h-4 w-4 shrink-0 text-white/65" strokeWidth={2.4} />
                            ) : (
                              <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/6 px-2 py-1 text-[10px] font-semibold text-white/65">
                                <Lock className="h-3 w-3" strokeWidth={2.4} />
                                {t.statusPresto}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">
                    {t.footerContact}
                  </span>
                  <a
                    href="mailto:info@dgmapps.it"
                    className="inline-flex w-fit items-center gap-2 py-1 text-sm text-white transition-colors hover:text-white"
                  >
                    <Mail className="h-4 w-4 text-white/70" />
                    info@dgmapps.it
                  </a>
                  <div className="flex flex-wrap gap-x-5">
                    <button
                      type="button"
                      onClick={() => setLegalOpen("privacy")}
                      className="py-1.5 text-xs text-white/75 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
                    >
                      {t.privacyPolicy}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLegalOpen("terms")}
                      className="py-1.5 text-xs text-white/75 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
                    >
                      {t.termsOfService}
                    </button>
                  </div>
                  <p className="text-[11px] leading-snug text-white/35">
                    © {new Date().getFullYear()} {t.copyright}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LegalModal open={legalOpen} onClose={() => setLegalOpen(null)} />
    </header>
  );
}
