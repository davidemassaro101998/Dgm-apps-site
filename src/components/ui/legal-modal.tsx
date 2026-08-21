import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../context/LanguageContext";

interface LegalModalProps {
  open: "privacy" | "terms" | null;
  onClose: () => void;
}

export function LegalModal({ open, onClose }: LegalModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  const title = open === "privacy" ? t.legalPrivacyTitle : t.legalTermsTitle;
  const body = open === "privacy" ? t.legalPrivacyBody : t.legalTermsBody;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8"
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
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-900 shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t.modalClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              ✕
            </button>

            <div className="flex flex-col gap-4 overflow-y-auto px-6 py-8 sm:px-8">
              <h3 className="font-display text-2xl font-bold text-mist-50 sm:text-3xl">{title}</h3>
              <p className="text-xs uppercase tracking-[0.2em] text-mist-500">{t.legalLastUpdated}</p>
              <div className="space-y-4 text-sm leading-relaxed text-mist-200">
                {body.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
