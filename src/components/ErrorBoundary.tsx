// Safety net against a total crash. Without this, any unhandled JS error
// anywhere in the tree takes down the whole landing page behind a blank
// white screen instead of a graceful, on-brand recovery message.

import React from "react";
import { reportError } from "../lib/monitoring";

interface ErrorBoundaryState {
  hasError: boolean;
}

// This boundary wraps the whole <App/> (see main.tsx), so it renders outside
// LanguageProvider and can't call useLanguage() -- falling back to a direct
// navigator.language check instead, same "it" vs everything-else split the
// provider itself uses as its default.
function isItalianBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.language?.toLowerCase().startsWith("it") ?? false;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, { componentStack: info.componentStack, app: "DGM Apps site" });
  }

  render() {
    if (this.state.hasError) {
      const isIt = isItalianBrowser();
      return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-ink-950 px-8 text-center font-body text-mist-50">
          <h2 className="font-display text-xl font-bold">
            {isIt ? "Qualcosa è andato storto" : "Something went wrong"}
          </h2>
          <p className="max-w-xs text-sm text-mist-400">
            {isIt ? "Riprova a ricaricare la pagina." : "Try reloading the page."}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-2 cursor-pointer rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform active:scale-95"
          >
            {isIt ? "Ricarica" : "Reload"}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
