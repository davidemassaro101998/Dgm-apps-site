// Analytics & error monitoring bootstrap. Both are entirely inert until
// the corresponding env var is actually set at build time (VITE_GA_
// MEASUREMENT_ID / VITE_SENTRY_DSN) -- nothing loads, nothing is sent.
// Loaded via CDN script tags rather than npm packages so wiring this up
// doesn't require any bundler changes: paste real IDs into the deploy
// environment and it goes live with zero further code changes.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    Sentry?: {
      init: (options: Record<string, unknown>) => void;
      captureException: (error: unknown, context?: Record<string, unknown>) => void;
    };
  }
}

export function initMonitoring(): void {
  if (typeof window === "undefined") return;

  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
  const gaId = env.VITE_GA_MEASUREMENT_ID;
  if (gaId) {
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId);
  }

  const sentryDsn = env.VITE_SENTRY_DSN;
  if (sentryDsn) {
    const sentryScript = document.createElement("script");
    sentryScript.src = "https://browser.sentry-cdn.com/8.9.2/bundle.min.js";
    sentryScript.crossOrigin = "anonymous";
    sentryScript.onload = () => {
      window.Sentry?.init({ dsn: sentryDsn, tracesSampleRate: 0.1 });
    };
    document.head.appendChild(sentryScript);
  }
}

// Central place to report a caught error -- always logs to the console,
// and additionally forwards to Sentry when it's configured and loaded.
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  console.error(error, context);
  try {
    window.Sentry?.captureException(error, { extra: context });
  } catch (e) {
    // ignore -- never let monitoring itself break the app
  }
}
