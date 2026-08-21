import { motion } from "framer-motion";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { Logo } from "./ui/logo";

interface FooterProps {
  onNavigateSection?: (sectionIndex: number) => void;
}

export function Footer({ onNavigateSection }: FooterProps) {
  const { t } = useLanguage();

  const handleNav = (index: number) => {
    if (onNavigateSection) {
      onNavigateSection(index);
    } else {
      const ids = ["top", "chi-siamo", "catalogo", "contatti"];
      document.getElementById(ids[index])?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="contatti" className="relative z-10 flex h-dvh w-full flex-col justify-center overflow-hidden border-t border-white/10 px-6 pt-16 pb-6 text-mist-300">
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
                <a href="#" className="text-mist-300 transition-colors hover:text-white">
                  {t.privacyPolicy}
                </a>
              </li>
              <li>
                <a href="#" className="text-mist-300 transition-colors hover:text-white">
                  {t.termsOfService}
                </a>
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
            <div className="flex items-center gap-3 pt-1">
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-full border border-white/10 bg-white/5 p-2 text-mist-300 transition-colors hover:border-white/25 hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="rounded-full border border-white/10 bg-white/5 p-2 text-mist-300 transition-colors hover:border-white/25 hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Bottom Copyright Line */}
        <div className="text-center text-xs text-mist-400">
          © {new Date().getFullYear()} {t.copyright}
        </div>
      </motion.div>
    </footer>
  );
}
