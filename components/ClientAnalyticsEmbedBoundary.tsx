"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * The Client Demo is one continuous page. A failure in the embedded Analytics
 * panel must not unmount Inspections in Progress or the rest of the workspace.
 * This boundary catches React render/lifecycle failures; browser event errors
 * are still handled by their originating controls.
 */
export default class ClientAnalyticsEmbedBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    // Visible only in this synthetic demo's local browser. No telemetry,
    // network request, account data, or production analytics is involved.
    const diagnostic = [
      "Embedded Client Analytics render error",
      "Type: " + (this.state.error.name || "Error"),
      "Message: " + (this.state.error.message || "Unavailable"),
      this.state.error.stack || "Stack trace unavailable",
    ].join("\n").slice(0, 4000);

    return <section className="analyticsRecovery" role="alert" aria-labelledby="embedded-analytics-recovery-title">
      <h2 id="embedded-analytics-recovery-title">Analytics view could not load</h2>
      <p>The fictional Analytics section encountered a display error. Inspections in Progress,
        Billing, Contracts and Profile are still available on this page without login.</p>
      <div className="actions">
        <button type="button" onClick={() => this.setState({ error: null })}>Try analytics again</button>
        <a href="#inspections-in-progress">Return to Inspections in Progress</a>
        <a href="/demo/client-analytics">Open dedicated Analytics demo</a>
      </div>
      <details>
        <summary>Technical details for troubleshooting</summary>
        <pre>{diagnostic}</pre>
        <p>These diagnostics remain in the browser; nothing is automatically submitted.</p>
      </details>
      <style jsx>{`
        .analyticsRecovery{margin:12px 0;padding:22px;border-radius:14px;border:2px solid #b45309;background:#fffbeb;color:#78350f}
        .analyticsRecovery h2{margin:0 0 10px;color:#78350f}
        .analyticsRecovery p{max-width:72ch;line-height:1.5}
        .actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:16px 0}
        .actions button,.actions a{display:inline-flex;align-items:center;min-height:44px;border:2px solid #92400e;border-radius:9px;padding:9px 12px;background:#fff;color:#78350f;font:inherit;font-weight:800;text-decoration:none;cursor:pointer}
        .actions button:hover,.actions a:hover{background:#fef3c7}
        .actions button:focus-visible,.actions a:focus-visible,summary:focus-visible{outline:3px solid #b45309;outline-offset:3px}
        details{margin-top:14px;border-top:1px solid #f59e0b;padding-top:12px}
        summary{cursor:pointer;font-weight:800}
        pre{overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-size:.78rem;max-height:240px;padding:12px;background:#fff;border:1px solid #fcd34d;border-radius:8px;color:#451a03}
        @media(max-width:620px){.actions{display:grid}.actions button,.actions a{justify-content:center}}
      `}</style>
    </section>;
  }
}
