import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

export function Story() {
  const { t } = useLanguage();

  return (
    <section id="chi-siamo" className="relative z-10 flex min-h-dvh w-full items-center justify-center bg-ink-950 px-5 py-20 sm:px-8">
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div className="mb-3.5 flex items-center gap-3 sm:mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-wider text-violet-300 uppercase backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              {t.storyBadge}
            </span>
          </div>

          {/* Heading */}
          <h2 className="max-w-2xl font-display text-2xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl tracking-tight">
            {t.storyTitleLine1} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-white bg-clip-text text-transparent">
              {t.storyTitleLine2}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-3 max-w-2xl text-sm font-normal leading-relaxed text-zinc-300 sm:mt-5 sm:text-base md:text-lg">
            {t.storySubtitle}
          </p>
        </motion.div>

        {/* Principles grid */}
        <div className="mt-8 divide-y divide-zinc-800/80 border-t border-b border-zinc-800/80 sm:mt-14">
          {t.principles.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col gap-1.5 py-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-baseline sm:gap-10 sm:py-6 sm:px-4"
            >
              <div className="flex items-center gap-2.5 sm:gap-0">
                <span className="font-display text-xs font-bold tabular-nums text-violet-400 sm:text-base sm:hidden">
                  {p.n}
                </span>
                <h3 className="font-display text-base font-bold text-white sm:text-xl sm:w-36 sm:shrink-0">
                  <span className="hidden sm:inline font-display text-sm font-bold tabular-nums text-violet-400 mr-3">{p.n}</span>
                  {p.title}
                </h3>
              </div>
              <p className="text-xs font-normal leading-relaxed text-zinc-300 sm:text-sm md:text-base">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
