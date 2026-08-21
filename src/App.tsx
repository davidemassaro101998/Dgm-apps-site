import { useState, useRef } from "react";
import { MotionConfig, motion, useMotionValue } from "framer-motion";
import { Header } from "./components/Header";
import { SpotlightHero } from "./components/ui/spotlight-hero";
import { Story } from "./components/Story";
import { AppGrid } from "./components/AppGrid";
import { Footer } from "./components/Footer";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { useFullPageController, TOTAL_SECTIONS } from "./hooks/useFullPageController";

function MainContent() {
  const { t } = useLanguage();
  const [selectedAppIdFromHeader, setSelectedAppIdFromHeader] = useState<string | null>(null);

  const { activeSection, goToSection } = useFullPageController({
    totalSections: TOTAL_SECTIONS,
  });

  const heroRef = useRef<HTMLElement>(null);
  const heroProgress = useMotionValue(activeSection === 0 ? 0 : 1);

  const handleSelectApp = (appId: string) => {
    setSelectedAppIdFromHeader(appId);
    goToSection(2); // Go to Catalogo
  };

  const navItems = [
    { label: "Home", index: 0 },
    { label: t.aboutUs, index: 1 },
    { label: t.catalog, index: 2 },
    { label: t.contact, index: 3 },
  ];

  return (
    <div className="fixed inset-0 h-dvh w-full overflow-hidden bg-ink-950 font-body select-none">
      {/* Header stays pinned at top */}
      <Header
        onSelectApp={handleSelectApp}
        onNavigateSection={goToSection}
      />

      {/* Main Full-Page Sliding Viewport Track */}
      <motion.div
        className="h-full w-full will-change-transform"
        animate={{ y: `-${activeSection * 100}%` }}
        transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Section 0: Hero */}
        <div className="h-dvh w-full shrink-0">
          <SpotlightHero
            tagline={t.heroTagline}
            title={t.heroTitle}
            description={t.heroDescription}
            ctaText={t.heroCta}
            onCtaClick={() => goToSection(2)}
            secondaryCtaText={t.heroSecondaryCta}
            onSecondaryCtaClick={() => goToSection(1)}
            sectionRef={heroRef}
            progress={heroProgress}
          />
        </div>

        {/* Section 1: Chi Siamo / Story */}
        <div className="h-dvh w-full shrink-0">
          <Story />
        </div>

        {/* Section 2: Catalogo App */}
        <div className="h-dvh w-full shrink-0">
          <AppGrid
            selectedAppIdFromHeader={selectedAppIdFromHeader}
            onClearSelectedApp={() => setSelectedAppIdFromHeader(null)}
          />
        </div>

        {/* Section 3: Footer & Contatti */}
        <div className="h-dvh w-full shrink-0">
          <Footer onNavigateSection={goToSection} />
        </div>
      </motion.div>

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
