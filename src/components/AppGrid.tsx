import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { apps, type AppEntry } from "../data/apps";
import { AppBentoGrid, type BentoAppItem } from "./ui/app-bento-grid";
import { AppIconExpand, type AppDetail } from "./ui/app-icon-expand";
import { photoUrl, getStatusLabel } from "../lib/appPhoto";
import { useLanguage } from "../context/LanguageContext";

interface AppGridProps {
  selectedAppIdFromHeader?: string | null;
  onClearSelectedApp?: () => void;
}

// One brand colour per app, reused from each app's own coral/orange/green
// palette so the catalog visually foreshadows what you get inside.
const ACCENTS: Record<string, string> = {
  kado: "#FF4D6D",
  bricolo: "#E8590C",
  forma: "#0EA968",
};

export function AppGrid({ selectedAppIdFromHeader, onClearSelectedApp }: AppGridProps) {
  const [expanded, setExpanded] = useState<AppDetail | null>(null);
  const { language, t } = useLanguage();

  const items: BentoAppItem[] = useMemo(() => {
    return apps.map((app) => ({
      id: app.id,
      title: app.name[language],
      subtitle: app.tagline[language],
      badge: getStatusLabel(app.status, t),
      imageUrl: photoUrl(app),
      accentFrom: ACCENTS[app.id] ?? "#FF4D6D",
      accentTo: ACCENTS[app.id] ?? "#FF4D6D",
    }));
  }, [language, t]);

  function openApp(id: string) {
    const app = apps.find((a: AppEntry) => a.id === id);
    if (!app) return;
    setExpanded({
      id: app.id,
      title: app.name[language],
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
        <AppBentoGrid items={items} onItemClick={openApp} comingSoonLabel={t.statusPresto} />
      </motion.div>

      <AppIconExpand app={expanded} onClose={() => setExpanded(null)} />
    </section>
  );
}
