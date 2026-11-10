"use client";

type DemoAnalyticsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Isolate Client Analytics client exceptions without exposing live workspace/auth routes. */
export default function ClientAnalyticsError({ error, reset }: DemoAnalyticsErrorProps) {
  // This public route contains synthetic client fixtures only. Keep the exception
  // local and user-readable so a browser-specific failure can be diagnosed without
  // making an external telemetry request or redirecting to live authentication.
  const diagnostic = [
    `Error: ${error.name || "Error"}`,
    `Message: ${error.message || "No client-side message available"}`,
    error.digest ? `Digest: ${error.digest}` : "",
    error.stack ? `Stack: ${error.stack}` : "Stack trace unavailable in this browser",
  ].filter(Boolean).join("\n").slice(0, 6000);
  return <main className="analyticsRecovery" role="main">
    <section className="recoveryPanel" aria-labelledby="analytics-recovery-title">
      <p className="eyebrow">Client Demo · Synthetic data only</p>
      <h1 id="analytics-recovery-title">Analytics view could not load</h1>
      <p>Something interrupted this sample analytics view. It contains fictional inspections only. No live client account, inspection record or payment was changed.</p>
      <div className="recoveryActions">
        <button type="button" onClick={() => reset()}>Try analytics again</button>
        <a href="/demo/client-analytics">Reload analytics with all filters</a>
        <a href="/demo/client-inspections">Open in-progress inspections</a>
        <a href="/demo/client">Client Demo home</a>
      </div>
      <details className="diagnostics">
        <summary>Technical details for troubleshooting</summary>
        <p>These client-side diagnostics stay in this browser. No account data is accessed and no error information is submitted automatically. Select and copy the text when reporting this demo problem.</p>
        <pre>{diagnostic}</pre>
      </details>
      <p className="fine">This is a demo recovery view, not a request to log into the live client workspace.</p>
    </section>
    <style jsx>{`
      .analyticsRecovery{min-height:65vh;display:grid;place-items:center;padding:30px 18px;background:#f8fafc;color:#0f172a}
      .recoveryPanel{background:#fff;border:1px solid #cbd5e1;border-radius:14px;padding:28px;width:min(100%,710px);box-shadow:0 8px 30px rgba(15,23,42,.06)}
      .eyebrow{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:#115e59;margin:0}
      h1{font-size:clamp(1.5rem,3vw,2rem);margin:10px 0}
      p{line-height:1.6;color:#334155}
      .recoveryActions{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:18px 0}
      button,.recoveryActions a{padding:11px 14px;border-radius:9px;font-weight:800;text-decoration:none;cursor:pointer;display:inline-block}
      button{background:#0f766e;color:#fff;border:2px solid #0f766e}
      .recoveryActions a{background:#f0fdfa;color:#115e59;border:2px solid #0f766e}
      button:hover,.recoveryActions a:hover{background:#ccfbf1;color:#115e59}
      button:focus-visible,.recoveryActions a:focus-visible{outline:3px solid #0d9488;outline-offset:3px}
      .diagnostics{margin:16px 0;padding:12px;border:1px solid #94a3b8;border-radius:10px;background:#f8fafc}
      .diagnostics summary{cursor:pointer;color:#0f172a;font-weight:800;padding:4px}
      .diagnostics summary:focus-visible{outline:3px solid #0d9488;outline-offset:3px}
      .diagnostics p{font-size:.85rem;color:#334155}
      .diagnostics pre{max-height:240px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-size:.75rem;color:#0f172a;background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:12px}
      .fine{font-size:.8rem;color:#475569}
    `}</style>
  </main>;
}
