"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoCandidate } from "@/lib/clientDemoCandidates";

function CandidateCard({ candidate }: { candidate: DemoCandidate }) {
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "error">("idle");

  async function downloadCv() {
    setDownloadState("loading");
    try {
      const { createDemoCandidatePdf } = await import("@/lib/clientDemoCandidatePdf");
      const bytes = await createDemoCandidatePdf(candidate);
      const url = URL.createObjectURL(new Blob([Uint8Array.from(bytes).buffer], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `InspectSource-${candidate.id}-demo-CV.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setDownloadState("idle");
    } catch {
      setDownloadState("error");
    }
  }

  return (
    <article className="candidate" aria-label={`Inspector ${candidate.id}`}>
      <p className="identity">Inspector {candidate.id}</p>
      <h4>{candidate.title}</h4>
      <p className="location">{candidate.location} · {candidate.yearsExperience} years of experience</p>
      <ul className="credentials" aria-label="Credentials">
        {candidate.credentials.map(credential => <li key={credential}>{credential}</li>)}
      </ul>
      <dl>
        <dt>Fictional source</dt><dd>{candidate.source}</dd>
        <dt>Availability</dt><dd>{candidate.availability}</dd>
        <dt>Shifts</dt><dd>{candidate.shifts}</dd>
        <dt>Day rate</dt><dd>USD {candidate.dayRateUsd.toLocaleString("en-US")}/day</dd>
      </dl>
      <details>
        <summary aria-label={`View CV for Inspector ${candidate.id}`}>View CV</summary>
        <div className="cv">
          <h5>Relevant experience</h5>
          <p>{candidate.summary}</p>
          <h5>Assignment history</h5>
          <ul>{candidate.workHistory.map(assignment => <li key={assignment}>{assignment}</li>)}</ul>
          <button type="button" disabled={downloadState === "loading"} onClick={downloadCv}>
            {downloadState === "loading" ? "Preparing PDF…" : "Download CV (PDF)"}
          </button>
          {downloadState === "error" && <p role="alert">The PDF could not be prepared. Try the download again.</p>}
        </div>
      </details>
      <style jsx>{`
        .candidate {border:1px solid #cbd5e1;border-radius:12px;padding:16px;min-width:0;background:white;color:#152d46}
        .identity {margin:0 0 3px;color:#0f6970;font-size:.83rem;font-weight:700}
        h4 {margin:0;font-size:1.06rem}
        .location {margin:4px 0 10px;color:#475569;line-height:1.4}
        .credentials {display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px;padding:0;list-style:none}
        .credentials li {padding:3px 8px;border:1px solid #cbd5e1;border-radius:5px;background:#f8fafc;font-size:.82rem}
        dl {display:grid;grid-template-columns:auto 1fr;gap:5px 14px;margin:0;font-size:.92rem;line-height:1.45}
        dt {font-weight:700} dd {margin:0;overflow-wrap:anywhere}
        details {margin-top:12px;border-top:1px solid #dbe3eb}
        summary {padding:12px 0;color:#105c62;font-weight:700;cursor:pointer}
        summary:hover {text-decoration:underline}
        summary:focus-visible,button:focus-visible {outline:3px solid #0d9488;outline-offset:2px}
        .cv {padding:2px 0 4px}.cv h5 {font-size:.94rem;margin:0 0 5px}
        .cv p,.cv ul {margin:0 0 14px;color:#334155;line-height:1.5}.cv ul {padding-left:1.3rem}.cv li+li {margin-top:5px}
        button {cursor:pointer;min-height:44px;padding:8px 14px;border:1px solid #0f766e;border-radius:8px;color:#115e59;background:#fff;font:inherit;font-weight:700}
        button:hover {background:#f0fdfa} button:disabled {color:#475569;cursor:progress}
      `}</style>
    </article>
  );
}

export default function ClientDemoCandidateResults({ candidates, resultId = "demo-shortlist", announceCount = true }: { candidates: DemoCandidate[]; resultId?: string; announceCount?: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = resultId === "demo-shortlist" ? "candidate-cvs-title" : `${resultId}-title`;
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start" });
  }, [candidates]);

  const count = candidates.length;
  return (
    <section id={resultId} aria-labelledby={headingId}>
      <h3 id={headingId} tabIndex={-1} ref={heading}>Candidate CVs</h3>
      <p className="naturalPreview" role={announceCount ? "status" : undefined}>
        {count > 0
          ? `${count} available demo ${count === 1 ? "candidate" : "candidates"}. Review the fictional CVs and sample rates below.`
          : "No available candidates found in the demo roster for these requirements. Try a different qualification, location, or date."}
      </p>
      <div className="cards">{candidates.map(candidate => <CandidateCard key={candidate.id} candidate={candidate}/>)}</div>
      <style jsx>{`
        section {margin:16px 0 4px;border-top:2px solid #0f766e;padding-top:14px}
        h3 {font-size:1.25rem;margin:0;scroll-margin-top:24px;color:#14283d}
        h3:focus-visible {outline:2px solid #0f766e;outline-offset:3px}
        .naturalPreview {margin:6px 0 14px;color:#475569;line-height:1.45}
        .cards {display:grid;gap:12px}
      `}</style>
    </section>
  );
}
