import { useCallback, useMemo } from "react";
import { MotionConfig } from "framer-motion";
import { Header } from "./components/Header";
import { HeroScrub, type HeroScrubIcon } from "./components/ui/hero-scrub";
import { Footer } from "./components/Footer";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { apps } from "./data/apps";
import { photoUrl, getStatusLabel } from "./lib/appPhoto";

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

  const heroIcons: HeroScrubIcon[] = useMemo(
    () =>
      apps.map((app) => {
        const pos = HERO_ICON_POSITIONS[app.id] ?? { leftPct: 50, topPct: 0 };
        return {
          id: app.id,
          name: app.name[language],
          statusLabel: getStatusLabel(app.status, t),
          statusTone: app.status,
          iconUrl: photoUrl(app),
          href: app.href,
          leftPct: pos.leftPct,
          topPct: pos.topPct,
        };
      }),
    [language, t]
  );

  const goToSection = useCallback((index: number) => {
    const id = SECTION_IDS[index];
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-ink-950 font-body">
      <Header onNavigateSection={goToSection} />

      <HeroScrub
        framesBaseUrl="/videos/hero-frames"
        frameCount={188}
        taglineLine1={t.heroScrubTaglineLine1}
        taglineLine2={t.heroScrubTaglineLine2}
        ctaLabel={t.heroCta}
        aboutLine1={t.heroScrubAboutLine1}
        aboutLine2={t.heroScrubAboutLine2}
        aboutLine3={t.heroScrubAboutLine3}
        aboutLine4={t.heroScrubAboutLine4}
        catalogHeading={t.heroScrubCatalogHeading}
        videoUnavailableLabel={t.heroScrubVideoUnavailable}
        icons={heroIcons}
      />

      <Footer onNavigateSection={goToSection} />
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
