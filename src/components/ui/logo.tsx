import { cn } from "@/lib/utils";
import { apps } from "@/data/apps";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

/* Il marchio e' la famiglia: un anello per app, nelle tinte di categoria
   vere. Si sovrappongono appena, e dove si toccano la luce sale -- app
   distinte che condividono lo stesso modo di funzionare. Nessun colore
   inventato per il logo.

   Gli anelli NON sono scritti a mano: si contano dal catalogo. Con la
   quarta app il marchio era rimasto a tre, e un logo che dice tre mentre
   la vetrina ne mostra quattro e' la prima crepa che qualcuno nota.
   Aggiungendone una quinta, il marchio la prende da solo. */
const RAGGIO = 10;
const PASSO = 7;      // quanto si sovrappongono: meno del raggio, quindi si toccano
const CENTRO = 24;

const ANELLI = apps.map((app, i) => ({
  cx: CENTRO + (i - (apps.length - 1) / 2) * PASSO,
  stroke: app.core,
  id: app.id,
}));

/* Con quattro anelli la fila e' piu' larga di prima: la finestra del
   disegno si allarga quel tanto che serve, cosi' il marchio non viene
   tagliato ai lati ne' rimpicciolito. */
const MEZZA = ((apps.length - 1) / 2) * PASSO + RAGGIO + 2;
const VISTA = `${CENTRO - MEZZA} 8 ${MEZZA * 2} 32`;

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]", className)}>
      <svg
        height="28"
        viewBox={VISTA}
        className="shrink-0"
        style={{ width: `${(MEZZA * 2 * 28) / 32}px` }}
        aria-hidden
      >
        <defs>
          <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CENTRO} cy="24" r="14" fill="url(#logoGlow)" opacity="0.5" />
        {ANELLI.map((ring) => (
          <circle
            key={ring.id}
            cx={ring.cx}
            cy="24"
            r={RAGGIO}
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
