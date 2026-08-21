import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../context/LanguageContext";

export interface AppDetail {
  id: string;
  title: string;
  badge: string;
  imageUrl: string;
  storeHref?: string;
  linkState: "ready" | "coming-soon" | "not-linked-yet";
}

interface AppIconExpandProps {
  app: AppDetail | null;
  onClose: () => void;
}

export function AppIconExpand({ app, onClose }: AppIconExpandProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!app) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [app, onClose]);

  return createPortal(
    <AnimatePresence>
      {app && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={app.title}
          className="fixed inset-0 z-[110] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <button
            type="button"
            onClick={onClose}
            aria-label={t.modalClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            ✕
          </button>

          <div className="relative z-10 flex flex-col items-center gap-5">
            <motion.img
              layoutId={`app-icon-${app.id}`}
              src={app.imageUrl}
              alt={app.title}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="h-40 w-40 rounded-[22%] object-cover shadow-[0_30px_70px_-12px_rgba(0,0,0,0.75)] sm:h-48 sm:w-48"
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="flex flex-col items-center gap-1.5">
                <h3 className="font-display text-2xl font-bold text-mist-50 sm:text-3xl">{app.title}</h3>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-[11px] font-medium text-mist-300">
                  {app.badge}
                </span>
              </div>

              <a
                href={app.linkState === "ready" ? app.storeHref : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={app.linkState !== "ready"}
                className={cn(
                  "inline-flex min-w-[14rem] items-center justify-center rounded-full px-8 py-3 font-semibold transition-transform",
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
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
