// Safety net against a total crash. Without this, any unhandled JS error
// anywhere in the tree takes down the whole landing page behind a blank
// white screen instead of a graceful, on-brand recovery message.

import React from "react";
import { reportError } from "../lib/monitoring";

interface ErrorBoundaryState {
  hasError: boolean;
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
      return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-ink-950 px-8 text-center font-body text-mist-50">
          <h2 className="font-display text-xl font-bold">Qualcosa è andato storto</h2>
          <p className="max-w-xs text-sm text-mist-400">
            Riprova a ricaricare la pagina.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-2 cursor-pointer rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition-transform active:scale-95"
          >
            Ricarica
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
