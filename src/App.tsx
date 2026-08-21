import { useState, useEffect, useCallback, useMemo } from "react";
import { MotionConfig } from "framer-motion";
import { Header } from "./components/Header";
import { HeroScrub, type HeroScrubIcon } from "./components/ui/hero-scrub";
import { Story } from "./components/Story";
import { AppGrid } from "./components/AppGrid";
import { Footer } from "./components/Footer";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { apps } from "./data/apps";
import { photoUrl } from "./lib/appPhoto";

const SECTION_IDS = ["top", "chi-siamo", "catalogo", "contatti"];

// Left-to-right order matches the video's own gift / wrench / dumbbell
// layout, so the icon handoff lands roughly where each object floats.
const HERO_ICON_POSITIONS: Record<string, number> = {
  kado: 22,
  bricolo: 50,
  forma: 78,
};

function MainContent() {
  const { language, t } = useLanguage();
  const [selectedAppIdFromHeader, setSelectedAppIdFromHeader] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  const heroIcons: HeroScrubIcon[] = useMemo(
    () =>
      apps.map((app) => ({
        id: app.id,
        name: app.name[language],
        iconUrl: photoUrl(app),
        href: app.href,
        leftPct: HERO_ICON_POSITIONS[app.id] ?? 50,
      })),
    [language]
  );

  // Scrollspy for the side nav dots — tracks whichever section covers the viewport midpoint.
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const index = sections.indexOf(visible.target as HTMLElement);
          if (index !== -1) setActiveSection(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const goToSection = useCallback((index: number) => {
    const id = SECTION_IDS[index];
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSelectApp = (appId: string) => {
    setSelectedAppIdFromHeader(appId);
    goToSection(2); // Catalogo
  };

  const navItems = [
    { label: "Home", index: 0 },
    { label: t.aboutUs, index: 1 },
    { label: t.catalog, index: 2 },
    { label: t.contact, index: 3 },
  ];

  return (
    <div className="relative min-h-screen w-full bg-ink-950 font-body">
      <Header onSelectApp={handleSelectApp} onNavigateSection={goToSection} />

      <HeroScrub
        videoSrc="/videos/hero-brand.mp4"
        taglineLine1={t.heroScrubTaglineLine1}
        taglineLine2={t.heroScrubTaglineLine2}
        ctaLabel={t.heroCta}
        aboutLine1={t.heroScrubAboutLine1}
        aboutLine2={t.heroScrubAboutLine2}
        icons={heroIcons}
      />

      <Story />

      <AppGrid
        selectedAppIdFromHeader={selectedAppIdFromHeader}
        onClearSelectedApp={() => setSelectedAppIdFromHeader(null)}
      />

      <Footer onNavigateSection={goToSection} />

      {/* Right Side Section Navigation Indicator */}
      <nav
        aria-label="Section navigation"
        className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-full border border-white/10 bg-black/40 p-2 backdrop-blur-md md:flex"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.index;
          return (
            <button
              key={item.index}
              type="button"
              onClick={() => goToSection(item.index)}
              className="group relative flex h-6 w-6 items-center justify-center rounded-full focus:outline-none"
              aria-label={item.label}
              aria-current={isActive ? "true" : undefined}
            >
              {/* Dot */}
              <span
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "h-3.5 w-3.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                    : "h-2 w-2 bg-white/30 group-hover:scale-125 group-hover:bg-white/70"
                }`}
              />

              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute right-8 whitespace-nowrap rounded-md border border-white/10 bg-zinc-900/90 px-2 py-1 text-[11px] font-medium text-zinc-200 opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MotionConfig reducedMotion="user">
        <MainContent />
      </MotionConfig>
    </LanguageProvider>
  );
}
