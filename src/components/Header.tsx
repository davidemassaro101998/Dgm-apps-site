import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, ChevronRight, Mail } from "lucide-react";
import { useLanguage, LANGUAGES } from "../context/LanguageContext";
import { apps } from "../data/apps";
import { getStatusLabel } from "../lib/appPhoto";
import { Logo } from "./ui/logo";
import { LegalModal } from "./ui/legal-modal";

interface HeaderProps {
  onNavigateSection?: (sectionIndex: number) => void;
}

export function Header({ onNavigateSection }: HeaderProps) {
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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [menuOpen]);

  const handleNavClick = (sectionIndex: number) => {
    setMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(sectionIndex);
    } else {
      const ids = ["top", "chi-siamo", "catalogo"];
      document.getElementById(ids[sectionIndex])?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // "Contatti" ora vive dentro questo stesso pannello (in fondo, sotto
  // le app), non su una sezione a se stante a fondo pagina -- scorre il
  // drawer fino a li invece di navigare la pagina, e non lo chiude.
  const handleContactClick = () => {
    document.getElementById("menu-contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAppClick = (appId: string) => {
    const app = apps.find((a) => a.id === appId);
    // "presto": the app is deployed and genuinely live, but not open to
    // visitors from the site yet -- don't let this menu in either, same
    // rule as the hero's own catalog tiles.
    if (!app || app.status === "presto") return;
    setMenuOpen(false);
    window.open(app.href, "_blank", "noopener,noreferrer");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleNavClick(0)}
          className="text-left focus:outline-none"
        >
          <Logo />
        </button>

        {/* Right Top Controls: Language Switcher + Three-line Menu Button */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langMenuOpen}
              aria-controls="lang-switcher-listbox"
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/30 hover:text-white"
            >
              <Globe className="h-3.5 w-3.5 text-violet-300" />
              {LANGUAGES.find((l) => l.code === language)?.label}
            </button>
            {langMenuOpen && (
              <div
                id="lang-switcher-listbox"
                role="listbox"
                className="absolute right-0 top-[calc(100%+8px)] z-20 flex min-w-[7rem] flex-col overflow-hidden rounded-xl border border-white/10 bg-ink-900/95 py-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
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
                        ? "bg-violet-500/20 text-violet-200"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Three-line Menu Trigger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-mist-200 hover:border-white/30 hover:bg-white/10 hover:text-white focus:outline-none transition-all"
            aria-label={menuOpen ? t.closeMenu : t.menuTitle}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Flyout / Overlay Drawer Menu */}
      {menuOpen && (
        <div
          id="mobile-nav-drawer"
          data-overlay="true"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 top-16 z-[100] h-[calc(100dvh-4rem)] overflow-y-auto no-scrollbar bg-ink-950 px-6 py-8 shadow-2xl transition-all duration-300"
        >
          <div className="mx-auto max-w-2xl flex flex-col gap-8 pb-16">
            {/* Main Navigation Links */}
            <div className="flex flex-col gap-3 border-b border-white/10 pb-6">
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                {t.menuTitle}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => handleNavClick(1)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left font-display text-sm font-semibold text-mist-100 transition-all hover:border-violet-400/40 hover:bg-white/[0.08]"
                >
                  <span>{t.aboutUs}</span>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </button>
                <button
                  onClick={() => handleNavClick(2)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left font-display text-sm font-semibold text-mist-100 transition-all hover:border-violet-400/40 hover:bg-white/[0.08]"
                >
                  <span>{t.catalog}</span>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </button>
                <button
                  onClick={handleContactClick}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left font-display text-sm font-semibold text-mist-100 transition-all hover:border-violet-400/40 hover:bg-white/[0.08]"
                >
                  <span>{t.contact}</span>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* All Available Apps List */}
            <div className="flex flex-col gap-3">
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                {t.allApps}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app.id)}
                    aria-disabled={app.status === "presto"}
                    className={`group flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                      app.status === "presto"
                        ? "cursor-default border-white/5 bg-white/[0.01] opacity-60"
                        : "border-white/10 bg-white/[0.02] hover:border-violet-400/50 hover:bg-violet-500/10"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-display text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                        {app.name[language]}
                      </span>
                      <span className="mt-0.5 text-xs text-zinc-400 line-clamp-1">
                        {app.tagline[language]}
                      </span>
                    </div>
                    <span className="ml-3 shrink-0 rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300">
                      {getStatusLabel(app.status, t)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Legal & Contact -- lived in a separate full-screen footer
                section before; folded in here so the page actually ends
                right after the app showcase instead of making visitors
                scroll through an empty extra screen to reach it. */}
            <div id="menu-contact" className="flex flex-col gap-3 border-t border-white/10 pt-6">
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                {t.footerContact}
              </span>
              <a
                href="mailto:info@dgmapps.it"
                className="inline-flex w-fit items-center gap-1.5 text-sm text-mist-300 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 text-violet-400" />
                info@dgmapps.it
              </a>
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLegalOpen("privacy")}
                  className="text-xs text-mist-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
                >
                  {t.privacyPolicy}
                </button>
                <button
                  type="button"
                  onClick={() => setLegalOpen("terms")}
                  className="text-xs text-mist-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
                >
                  {t.termsOfService}
                </button>
              </div>
              <div className="pt-2 text-xs text-mist-500">
                © {new Date().getFullYear()} {t.copyright}
              </div>
            </div>
          </div>
        </div>
      )}

      <LegalModal open={legalOpen} onClose={() => setLegalOpen(null)} />
    </header>
  );
}
