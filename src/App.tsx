import { useState, useEffect, useCallback, useMemo } from "react";
import { MotionConfig } from "framer-motion";
import { Header } from "./components/Header";
import { HeroScrub, type HeroScrubIcon } from "./components/ui/hero-scrub";
import { Footer } from "./components/Footer";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { apps } from "./data/apps";
import { photoUrl } from "./lib/appPhoto";

const SECTION_IDS = ["top", "chi-siamo", "catalogo", "contatti"];

// Left-to-right order and offsets match the video's own gift / wrench /
// dumbbell layout (measured directly off the settled frame), so the icon
// hand-off lands where each object actually floats -- the wrench (bricolo)
// sits noticeably lower/more central than the other two in the footage.
const HERO_ICON_POSITIONS: Record<string, { leftPct: number; topPct: number }> = {
  kado: { leftPct: 22, topPct: 0 },
  bricolo: { leftPct: 50, topPct: 14 },
  forma: { leftPct: 78, topPct: -4 },
};

function MainContent() {
  const { language, t } = useLanguage();
  const [activeSection, setActiveSection] = useState(0);

  const heroIcons: HeroScrubIcon[] = useMemo(
    () =>
      apps.map((app) => {
        const pos = HERO_ICON_POSITIONS[app.id] ?? { leftPct: 50, topPct: 0 };
        return {
          id: app.id,
          name: app.name[language],
          iconUrl: photoUrl(app),
          href: app.href,
          leftPct: pos.leftPct,
          topPct: pos.topPct,
        };
      }),
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

  const navItems = [
    { label: "Home", index: 0 },
    { label: t.aboutUs, index: 1 },
    { label: t.catalog, index: 2 },
    { label: t.contact, index: 3 },
  ];

  return (
    <div className="relative min-h-screen w-full bg-ink-950 font-body">
      <Header onNavigateSection={goToSection} />

      <HeroScrub
        videoSrc="/videos/hero-brand.mp4"
        taglineLine1={t.heroScrubTaglineLine1}
        taglineLine2={t.heroScrubTaglineLine2}
        ctaLabel={t.heroCta}
        aboutLine1={t.heroScrubAboutLine1}
        aboutLine2={t.heroScrubAboutLine2}
        aboutLine3={t.heroScrubAboutLine3}
        aboutLine4={t.heroScrubAboutLine4}
        icons={heroIcons}
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
