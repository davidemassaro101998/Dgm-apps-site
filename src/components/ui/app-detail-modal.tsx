import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../context/LanguageContext";

export interface AppDetail {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  storeHref?: string;
  linkState: "ready" | "coming-soon" | "not-linked-yet";
}

interface AppDetailModalProps {
  app: AppDetail | null;
  onClose: () => void;
}

export function AppDetailModal({ app, onClose }: AppDetailModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!app) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [app, onClose]);

  return createPortal(
    <AnimatePresence>
      {app && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={app.title}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-900 shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t.modalClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              ✕
            </button>

            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
              <img src={app.imageUrl} alt={app.title} className="absolute inset-0 h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
              <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
                {app.badge}
              </span>
            </div>

            <div className="flex flex-col gap-4 px-6 pb-6 pt-2 text-center sm:px-8 sm:pb-8">
              <h3 className="font-display text-3xl font-bold text-mist-50 sm:text-4xl">{app.title}</h3>
              <p className="text-base leading-relaxed text-mist-200">{app.subtitle}</p>

              <a
                href={app.linkState === "ready" ? app.storeHref : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={app.linkState !== "ready"}
                className={cn(
                  "mt-2 inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold transition-transform",
                  app.linkState === "ready"
                    ? "bg-aurora text-ink-950 shadow-lg shadow-violet-500/30 hover:scale-105"
                    : "cursor-not-allowed border border-white/15 bg-white/5 text-mist-400"
                )}
                onClick={(e) => {
                  if (app.linkState !== "ready") e.preventDefault();
                }}
              >
                {app.linkState === "ready"
                  ? t.modalOpenStore
                  : app.linkState === "coming-soon"
                    ? t.modalComingSoon
                    : t.modalNotLinkedYet}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
