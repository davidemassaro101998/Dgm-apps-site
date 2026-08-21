import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

// Marchio: due anelli sovrapposti (viola + ciano) con un bagliore al centro
// dove si incontrano — la stessa idea dei due fari volumetrici della hero
// e del marchio "due persone" già usato in Chi Siamo, elevata a logo vero.
export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg width="28" height="28" viewBox="0 0 48 48" className="shrink-0" aria-hidden>
        <defs>
          <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="logoRingA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="logoRingB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="13" fill="url(#logoGlow)" opacity="0.55" />
        <circle cx="18" cy="24" r="12" fill="none" stroke="url(#logoRingA)" strokeWidth="2.75" />
        <circle cx="30" cy="24" r="12" fill="none" stroke="url(#logoRingB)" strokeWidth="2.75" />
      </svg>
      {!iconOnly && (
        <span className="font-display text-sm font-bold tracking-tight text-mist-50">
          DGM APPS
        </span>
      )}
    </span>
  );
}
