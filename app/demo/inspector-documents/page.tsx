"use client";

import { useState } from "react";

type DemoDocument = {
  id: string;
  name: string;
  issuer: string;
  status: "Verified" | "Expiring soon" | "Current";
  expires: string;
  format: "PDF" | "Image";
  preview: string;
};

const DOCUMENTS: DemoDocument[] = [
  { id: "api-570", name: "API 570 Piping Inspector", issuer: "API", status: "Verified", expires: "May 2028", format: "PDF", preview: "Synthetic API 570 certificate preview" },
  { id: "aws-cwi", name: "AWS Certified Welding Inspector", issuer: "AWS", status: "Expiring soon", expires: "January 2027", format: "Image", preview: "Synthetic AWS CWI certificate image preview" },
  { id: "asnt-ii", name: "UT Level II", issuer: "ASNT employer-based program", status: "Current", expires: "September 2027", format: "PDF", preview: "Synthetic UT Level II qualification preview" },
];

export default function InspectorQualificationDocumentsDemo() {
  const [selected, setSelected] = useState<DemoDocument | null>(null);
  const [shareTarget, setShareTarget] = useState<DemoDocument | null>(null);
  const [notice, setNotice] = useState("");

  function requestShare(audience: "client" | "agency") {
    if (!shareTarget) return;
    setNotice(`Demo only: ${shareTarget.name} would be shared with the authorized ${audience} after permission and assignment/relationship checks.`);
    setShareTarget(null);
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">InspectorHub · Demo Mode</p>
        <h1>Qualification Documents</h1>
        <p>View qualification evidence and preview permission-gated sharing. All records below are synthetic; no production certificates or personal data are used.</p>
      </header>

      {notice && <p className="notice" role="status">{notice}</p>}

      <section className="card" aria-labelledby="documents-heading">
        <div className="sectionHead">
          <div><p className="eyebrow">Document center</p><h2 id="documents-heading">Certificates & qualification evidence</h2></div>
          <span className="badge">3 synthetic documents</span>
        </div>
        <div className="documents">
          {DOCUMENTS.map((document) => (
            <article className="document" key={document.id}>
              <div>
                <strong>{document.name}</strong>
                <span>{document.issuer} · {document.format} · Expires {document.expires}</span>
              </div>
              <span className={`status ${document.status === "Expiring soon" ? "warning" : "ok"}`}>{document.status}</span>
              <div className="actions">
                <button type="button" onClick={() => setSelected(document)} aria-haspopup="dialog">View certificate</button>
                <button type="button" className="secondary" onClick={() => setShareTarget(document)} aria-haspopup="dialog">Share securely</button>
              </div>
            </article>
          ))}
        </div>
        <p className="privacy"><strong>Privacy rule:</strong> live documents must be scoped to the authenticated inspector and may only be shared with an authorized client or agency. This demo does not perform a production share.</p>
      </section>

      {selected && <div className="backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-title">
          <div className="sectionHead"><div><p className="eyebrow">{selected.format} preview</p><h2 id="certificate-title">{selected.name}</h2></div><button type="button" className="close" onClick={() => setSelected(null)} aria-label="Close certificate preview">Close</button></div>
          <div className="preview" aria-label={selected.preview}>
            <span>INSPECTSOURCE SYNTHETIC DEMO</span>
            <strong>{selected.name}</strong>
            <p>{selected.issuer}</p>
            <p>Certificate evidence preview · not a real credential</p>
          </div>
        </section>
      </div>}

      {shareTarget && <div className="backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShareTarget(null); }}>
        <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <div className="sectionHead"><div><p className="eyebrow">Permission-gated share</p><h2 id="share-title">Share {shareTarget.name}</h2></div><button type="button" className="close" onClick={() => setShareTarget(null)} aria-label="Close secure share dialog">Close</button></div>
          <p>Choose an authorized relationship. A production implementation must verify inspector ownership, recipient authorization, and the applicable client/agency relationship before granting document access.</p>
          <div className="shareActions">
            <button type="button" onClick={() => requestShare("client")}>Preview share with authorized client</button>
            <button type="button" onClick={() => requestShare("agency")}>Preview share with authorized agency</button>
          </div>
          <p className="privacy">No public link is created and no document is uploaded or persisted by this synthetic demo.</p>
        </section>
      </div>}

      <style jsx>{`
        .page{max-width:1100px;margin:auto;padding:28px 18px 70px;color:#163331}.hero,.card{background:#fff;border:1px solid #d8e6e3;border-radius:18px;padding:24px}.hero{margin-bottom:18px}.hero h1,.card h2{margin:4px 0 8px}.eyebrow{margin:0;text-transform:uppercase;letter-spacing:.08em;font-size:.76rem;font-weight:800;color:#14766d}.sectionHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.badge,.status{border-radius:999px;padding:6px 10px;font-size:.78rem;font-weight:800}.badge{background:#e8f5f2;color:#12665f}.documents{display:grid;gap:12px;margin-top:18px}.document{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:14px;border:1px solid #dce8e6;border-radius:14px;padding:16px}.document strong,.document span{display:block}.document div>span{margin-top:5px;color:#607572;font-size:.9rem}.status.ok{background:#e6f6ed;color:#17663a}.status.warning{background:#fff3d6;color:#7a5200}.actions,.shareActions{display:flex;gap:8px;flex-wrap:wrap}button{border:1px solid #0d6f67;border-radius:10px;background:#0d6f67;color:#fff;padding:9px 12px;font-weight:800;cursor:pointer}button:hover{background:#095a54}button:focus-visible{outline:3px solid #72c8bf;outline-offset:2px}.secondary,.close{background:#fff;color:#0d6f67}.secondary:hover,.close:hover{background:#e8f5f2}.privacy,.notice{margin-top:18px;padding:12px 14px;border-radius:12px;background:#f3f8f7;color:#365754}.notice{border:1px solid #b9ddd7}.backdrop{position:fixed;inset:0;background:rgba(8,34,31,.58);display:grid;place-items:center;padding:20px;z-index:50}.dialog{width:min(680px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.25)}.preview{min-height:300px;margin-top:18px;border:2px solid #bfd8d4;border-radius:14px;padding:30px;display:grid;place-content:center;text-align:center;background:#f8fbfa}.preview span{font-size:.72rem;letter-spacing:.12em;color:#718985}.preview strong{font-size:1.35rem;margin-top:18px}.shareActions{margin-top:18px}@media(max-width:760px){.document{grid-template-columns:1fr}.sectionHead{align-items:flex-start}.actions{width:100%}.actions button{flex:1}}
      `}</style>
    </main>
  );
}
