import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

/* Il marchio e la famiglia: tre anelli, uno per app, nelle tinte di
   categoria vere (rosa-oro Kado, ambra Bricolo, verde Forma). Si
   sovrappongono appena, e dove si toccano la luce sale -- tre prodotti
   distinti che condividono lo stesso modo di funzionare. Nessun colore
   inventato per il logo: se una tinta cambia nel catalogo, cambia qui. */
const RINGS = [
  { cx: 17, stroke: "#F14B81" },
  { cx: 24, stroke: "#FF8A1F" },
  { cx: 31, stroke: "#15CC60" },
];

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]", className)}>
      <svg width="28" height="28" viewBox="0 0 48 48" className="shrink-0" aria-hidden>
        <defs>
          <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="14" fill="url(#logoGlow)" opacity="0.5" />
        {RINGS.map((ring) => (
          <circle
            key={ring.cx}
            cx={ring.cx}
            cy="24"
            r="10"
            fill="none"
            stroke={ring.stroke}
            strokeWidth="2.5"
            opacity="0.92"
          />
        ))}
      </svg>
      {!iconOnly && (
        <span className="font-display text-sm font-bold tracking-tight text-mist-50">
          DGM APPS
        </span>
      )}
    </span>
  );
}
