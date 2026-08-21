import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { apps, type AppEntry } from "../data/apps";
import { CardCarousel, type CarouselAppItem } from "./ui/card-carousel";
import { AppDetailModal, type AppDetail } from "./ui/app-detail-modal";
import { photoUrl, getStatusLabel } from "../lib/appPhoto";
import { useLanguage } from "../context/LanguageContext";

interface AppGridProps {
  selectedAppIdFromHeader?: string | null;
  onClearSelectedApp?: () => void;
}

export function AppGrid({ selectedAppIdFromHeader, onClearSelectedApp }: AppGridProps) {
  const [selected, setSelected] = useState<AppDetail | null>(null);
  const { language, t } = useLanguage();

  const items: CarouselAppItem[] = useMemo(() => {
    return apps.map((app) => ({
      id: app.id,
      title: app.name[language],
      subtitle: app.tagline[language],
      badge: getStatusLabel(app.status, t),
      imageUrl: photoUrl(app),
      href: app.href,
    }));
  }, [language, t]);

  function openApp(id: string) {
    const app = apps.find((a: AppEntry) => a.id === id);
    if (!app) return;
    setSelected({
      id: app.id,
      title: app.name[language],
      subtitle: app.tagline[language],
      badge: getStatusLabel(app.status, t),
      imageUrl: photoUrl(app),
      storeHref: app.href,
      linkState: app.status === "presto" ? "coming-soon" : app.href === "#" ? "not-linked-yet" : "ready",
    });
  }

  // Handle external selection from Header
  useEffect(() => {
    if (selectedAppIdFromHeader) {
      openApp(selectedAppIdFromHeader);
      onClearSelectedApp?.();
    }
  }, [selectedAppIdFromHeader]);

  return (
    <section id="catalogo" className="relative z-10 flex min-h-dvh w-full flex-col justify-center px-4 py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-5xl text-center"
      >
        <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          {t.catalogTitle}
        </h2>
        <p className="mt-2 text-sm text-zinc-300 sm:text-base">
          {t.catalogSubtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-10 w-full max-w-5xl"
      >
        <CardCarousel items={items} onItemClick={openApp} autoplayDelay={4500} />
      </motion.div>

      <AppDetailModal app={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
