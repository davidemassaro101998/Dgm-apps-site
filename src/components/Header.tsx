import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, Mail } from "lucide-react";
import { useLanguage, LANGUAGES } from "../context/LanguageContext";
import { Logo } from "./ui/logo";
import { LegalModal } from "./ui/legal-modal";

/* Il sito e una schermata sola: non ci sono sezioni da raggiungere,
   quindi non c'e navigazione. Restano le due cose che servono davvero
   in testa alla pagina -- la lingua e i contatti/legale -- e nient'altro
   che rubi spazio al tamburo delle app. */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState<"privacy" | "terms" | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
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
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white"
            >
              <Globe className="h-3.5 w-3.5 text-white/60" />
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
                    className={`px-3 py-1.5 text-left text-xs font-medium transition-colors ${
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
            aria-label={menuOpen ? t.closeMenu : t.menuTitle}
            aria-expanded={menuOpen}
            aria-controls="site-info-panel"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="site-info-panel"
          data-overlay="true"
          role="dialog"
          aria-modal="true"
          className="pointer-events-auto absolute right-4 top-16 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-3 rounded-2xl border border-white/10 bg-[#0B0A0F]/95 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:right-6"
        >
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
            {t.footerContact}
          </span>
          <a
            href="mailto:info@dgmapps.it"
            className="inline-flex w-fit items-center gap-2 text-sm text-white/85 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4 text-white/50" />
            info@dgmapps.it
          </a>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setLegalOpen("privacy")}
              className="text-xs text-white/55 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              {t.privacyPolicy}
            </button>
            <button
              type="button"
              onClick={() => setLegalOpen("terms")}
              className="text-xs text-white/55 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              {t.termsOfService}
            </button>
          </div>
          <p className="text-[11px] leading-snug text-white/35">
            © {new Date().getFullYear()} {t.copyright}
          </p>
        </div>
      )}

      <LegalModal open={legalOpen} onClose={() => setLegalOpen(null)} />
    </header>
  );
}
