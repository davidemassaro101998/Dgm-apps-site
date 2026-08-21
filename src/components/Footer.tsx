import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Logo } from "./ui/logo";
import { LegalModal } from "./ui/legal-modal";

interface FooterProps {
  onNavigateSection?: (sectionIndex: number) => void;
}

export function Footer({ onNavigateSection }: FooterProps) {
  const { t } = useLanguage();
  const [legalOpen, setLegalOpen] = useState<"privacy" | "terms" | null>(null);

  const handleNav = (index: number) => {
    if (onNavigateSection) {
      onNavigateSection(index);
    } else {
      const ids = ["top", "chi-siamo", "catalogo", "contatti"];
      document.getElementById(ids[index])?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="contatti" className="relative z-10 flex min-h-dvh w-full flex-col justify-center bg-black px-6 py-20 text-mist-300">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-6xl space-y-8"
      >
        {/* Top Section - Columns */}
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4 md:text-left">
          {/* Column 1: Brand & Bio */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <button type="button" onClick={() => handleNav(0)} className="text-left focus:outline-none">
              <Logo />
            </button>
            <p className="max-w-xs text-xs leading-relaxed text-mist-400">
              {t.footerDesc}
            </p>
          </div>

          {/* Column 2: Sito */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-mist-400">
              {t.footerSite}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav(1)}
                  className="text-mist-300 transition-colors hover:text-white"
                >
                  {t.aboutUs}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav(2)}
                  className="text-mist-300 transition-colors hover:text-white"
                >
                  {t.catalog}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legale */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-mist-400">
              {t.footerLegal}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setLegalOpen("privacy")}
                  className="text-mist-300 transition-colors hover:text-white"
                >
                  {t.privacyPolicy}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalOpen("terms")}
                  className="text-mist-300 transition-colors hover:text-white"
                >
                  {t.termsOfService}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contatti */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-mist-400">
              {t.footerContact}
            </h4>
            <a
              href="mailto:info@dgmapps.it"
              className="inline-flex items-center gap-1.5 text-xs text-mist-300 transition-colors hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 text-violet-400" />
              info@dgmapps.it
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Bottom Copyright Line */}
        <div className="text-center text-xs text-mist-400">
          © {new Date().getFullYear()} {t.copyright}
        </div>
      </motion.div>

      <LegalModal open={legalOpen} onClose={() => setLegalOpen(null)} />
    </footer>
  );
}
