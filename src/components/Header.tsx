import { useState, useEffect } from "react";
import { Menu, X, Globe, ChevronRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { apps } from "../data/apps";
import { getStatusLabel } from "../lib/appPhoto";
import { Logo } from "./ui/logo";

interface HeaderProps {
  onSelectApp?: (appId: string) => void;
  onNavigateSection?: (sectionIndex: number) => void;
}

export function Header({ onSelectApp, onNavigateSection }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

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
      const ids = ["top", "chi-siamo", "catalogo", "contatti"];
      document.getElementById(ids[sectionIndex])?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAppClick = (appId: string) => {
    setMenuOpen(false);
    if (onSelectApp) {
      onSelectApp(appId);
    } else if (onNavigateSection) {
      onNavigateSection(2);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink-950/85 backdrop-blur-md">
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
          {/* Language Toggle Pill */}
          <div className="flex items-center rounded-full border border-white/15 bg-white/5 p-1 text-xs">
            <button
              onClick={() => setLanguage("it")}
              className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                language === "it"
                  ? "bg-violet-500/80 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              IT
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                language === "en"
                  ? "bg-violet-500/80 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          {/* Three-line Menu Trigger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-mist-200 hover:border-white/30 hover:bg-white/10 hover:text-white focus:outline-none transition-all"
            aria-label={menuOpen ? t.closeMenu : t.menuTitle}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Flyout / Overlay Drawer Menu */}
      {menuOpen && (
        <div
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
                  onClick={() => handleNavClick(3)}
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
                    className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-left transition-all hover:border-violet-400/50 hover:bg-violet-500/10"
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
          </div>
        </div>
      )}
    </header>
  );
}
