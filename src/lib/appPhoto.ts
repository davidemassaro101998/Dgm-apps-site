import type { AppEntry } from "../data/apps";
import type { Language, Translations } from "../context/LanguageContext";

const accentHex = { violet: "#8B5CF6", cyan: "#22D3EE", amber: "#FBBF24" } as const;

function placeholderPhoto(accent: AppEntry["accent"]) {
  const hex = accentHex[accent];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${hex}" stop-opacity="0.35"/><stop offset="100%" stop-color="#0B0B12"/></linearGradient></defs><rect width="300" height="400" fill="url(#g)"/><circle cx="150" cy="200" r="46" fill="none" stroke="${hex}" stroke-width="2" opacity="0.6"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function photoUrl(app: AppEntry) {
  return app.image ?? placeholderPhoto(app.accent);
}

export function getStatusLabel(status: AppEntry["status"], t: Translations): string {
  switch (status) {
    case "live":
      return t.statusLive;
    case "beta":
      return t.statusBeta;
    case "presto":
      return t.statusPresto;
  }
}
