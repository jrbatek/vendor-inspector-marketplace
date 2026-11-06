"use client";

import { useEffect, useRef, useState } from "react";
import { INSPECTOR_QUALIFICATION_CATALOG, type QualificationCategory } from "@/lib/inspector-qualification-catalog";
import { DEMO_DOCUMENT_AS_OF, DEMO_FOCUS_AREAS, MAX_SAMPLE_FILE_BYTES, validateQualificationDraft, validateSampleFile, expiryStatus, recommendDemoQualifications, type DemoRegion } from "@/lib/demoQualificationWorkflow";

type DemoDocument = {
  id: string;
  name: string;
  issuer: string;
  status: "Verified" | "Expiring soon" | "Current" | "Pending verification";
  qualificationId: string;
  issued: string;
  expiresOn: string;
  verified: boolean;
  file?: File;
  expires: string;
  format: "PDF" | "Image";
  preview: string;
};

const DOCUMENTS: DemoDocument[] = [
  { qualificationId: "api-570", issued: "2025-05-01", expiresOn: "2028-05-01", verified: true, id: "api-570", name: "API 570 Piping Inspector", issuer: "API", status: "Verified", expires: "May 2028", format: "PDF", preview: "Synthetic API 570 certificate preview" },
  { qualificationId: "aws-cwi", issued: "2024-01-15", expiresOn: "2027-01-15", verified: true, id: "aws-cwi", name: "AWS Certified Welding Inspector", issuer: "AWS", status: "Expiring soon", expires: "January 2027", format: "Image", preview: "Synthetic AWS CWI certificate image preview" },
  { qualificationId: "asnt-nas410", issued: "2024-09-01", expiresOn: "2027-09-01", verified: true, id: "asnt-ii", name: "UT Level II", issuer: "ASNT employer-based program", status: "Current", expires: "September 2027", format: "PDF", preview: "Synthetic UT Level II qualification preview" },
];

export default function InspectorQualificationDocumentsDemo() {
  const [documents, setDocuments] = useState(DOCUMENTS);
  const [qualificationId, setQualificationId] = useState("api-510");
  const [issued, setIssued] = useState("");
  const [expires, setExpires] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [region, setRegion] = useState<DemoRegion>("US Gulf Coast");
  const [focus, setFocus] = useState<QualificationCategory>("Pressure equipment");
  const fileInput = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selected, setSelected] = useState<DemoDocument | null>(null);
  const [shareTarget, setShareTarget] = useState<DemoDocument | null>(null);
  const [notice, setNotice] = useState("");

  const recommendations = recommendDemoQualifications(region, focus, documents.map(document => ({ qualificationId: document.qualificationId, issued: document.issued, expires: document.expiresOn, verified: document.verified })));
  useEffect(() => {
    if (!selected?.file) { setPreviewUrl(""); return; }
    const url = URL.createObjectURL(selected.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selected]);

  async function addQualification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFormError("");
    const error = validateQualificationDraft({ qualificationId, issued, expires });
    if (error) { setFormError(error); return; }
    if (!file) { setFormError("Choose a sample certificate file."); return; }
    if (file.size > MAX_SAMPLE_FILE_BYTES) { setFormError("The sample file must be 5 MB or smaller."); return; }
    setSaving(true);
    try {
      const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
      const fileError = validateSampleFile(file, header);
      if (fileError) { setFormError(fileError); return; }
      const qualification = INSPECTOR_QUALIFICATION_CATALOG.find(item => item.id === qualificationId)!;
      const document: DemoDocument = { id: crypto.randomUUID(), qualificationId, issued, expiresOn: expires, verified: false,
        name: qualification.name, issuer: qualification.issuer, status: "Pending verification", expires,
        format: file.type === "application/pdf" ? "PDF" : "Image", preview: `Local sample: ${file.name}`, file };
      setDocuments(current => [...current, document]);
      setNotice("Sample added to this page only. Pending verification: file upload does not verify a qualification.");
      setIssued(""); setExpires(""); setFile(null);
      if (fileInput.current) fileInput.current.value = "";
    } catch { setFormError("Could not read this sample file. Choose it again and retry."); }
    finally { setSaving(false); }
  }

  const modalOpen = Boolean(selected || shareTarget);
  useEffect(() => {
    if (!modalOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,textarea,iframe,[tabindex="0"]') || []);
    controls()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSelected(null); setShareTarget(null); }
      if (event.key !== "Tab") return;
      const items = controls(), first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = overflow; previous?.focus(); };
  }, [modalOpen]);

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
        <p>View qualification evidence and preview permission-gated sharing. Built-in records are synthetic; no production certificates or personal data are used. Use sample files only. Added files remain in memory in this page and are cleared on refresh or when you leave; nothing is sent to a server.</p>
        <a href="/demo/inspector">Back to Inspector Demo</a>
      </header>

      {notice && <p className="notice" role="status">{notice}</p>}
      <section className="card addCard" aria-labelledby="add-qualification-title">
        <h2 id="add-qualification-title">Add Qualification &amp; Upload Documentation</h2>
        <p>Sample PDF or image · up to 5 MB · demo snapshot {DEMO_DOCUMENT_AS_OF}. Issue and expiry dates describe your evidence, not verification by InspectSource.</p>
        <form ref={formRef} onSubmit={addQualification}>
          <label>Qualification<select aria-label="Qualification" value={qualificationId} onChange={event => setQualificationId(event.target.value)}>{INSPECTOR_QUALIFICATION_CATALOG.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
          <div className="dateFields"><label>Issue date<input type="date" required max={DEMO_DOCUMENT_AS_OF} value={issued} onChange={event => setIssued(event.target.value)}/></label><label>Expiry date<input type="date" required value={expires} onChange={event => setExpires(event.target.value)}/></label></div>
          <label>Sample certificate file<input ref={fileInput} type="file" required accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={event => setFile(event.target.files?.[0] || null)}/></label>
          {formError && <p role="alert">{formError}</p>}
          <button type="submit" disabled={saving}>{saving ? "Checking sample…" : "Add sample qualification"}</button>
        </form>
      </section>

      <section className="card" aria-labelledby="documents-heading">
        <div className="sectionHead">
          <div><p className="eyebrow">Document center</p><h2 id="documents-heading">Certificates & qualification evidence</h2></div>
          <span className="badge">{documents.length} demo documents</span>
        </div>
        <div className="documents">
          {documents.map((document) => (
            <article className="document" key={document.id}>
              <div>
                <strong>{document.name}</strong>
                <span>{document.issuer} · {document.format} · Issued {document.issued} · Expires {document.expiresOn}</span>
              </div>
              <span className={`status ${document.status === "Pending verification" ? "pending" : document.status === "Expiring soon" ? "warning" : "ok"}`}>{document.status}</span>
              <span className="expiry">{expiryStatus(document.expiresOn)} as of {DEMO_DOCUMENT_AS_OF}</span>
              <div className="actions">
                <button type="button" onClick={() => setSelected(document)} aria-haspopup="dialog">View certificate</button>
                <button type="button" className="secondary" onClick={() => setShareTarget(document)} aria-haspopup="dialog">Share securely</button>
                {document.file && <button type="button" className="secondary" onClick={() => { setDocuments(current => current.filter(item => item.id !== document.id)); setNotice("Local sample removed from this page."); }}>Remove local sample</button>}
              </div>
            </article>
          ))}
        </div>
        <p className="privacy"><strong>Privacy rule:</strong> live documents must be scoped to the authenticated inspector and may only be shared with an authorized client or agency. This demo does not perform a production share.</p>
      </section>

      <section className="card recommendationCard" aria-labelledby="recommendations-title">
        <h2 id="recommendations-title">Recommended Additional Qualifications</h2>
        <p>Ranked by fictional regional request mentions and your chosen focus. These are learning leads, not eligibility findings, certification promises or projected earnings. Only current, verified synthetic evidence is excluded; pending uploads do not establish a held credential.</p>
        <div className="dateFields"><label>Demand region<select aria-label="Demand region" value={region} onChange={event => setRegion(event.target.value as DemoRegion)}><option>US Gulf Coast</option><option>UK North Sea</option></select></label><label>Profile focus<select aria-label="Profile focus" value={focus} onChange={event => setFocus(event.target.value as QualificationCategory)}>{DEMO_FOCUS_AREAS.map(value => <option key={value}>{value}</option>)}</select></label></div>
        <ol className="recommendations">{recommendations.map(item => <li key={item.id}><h3>{item.name}</h3><p>{item.requestMentions} sample requests mention this qualification · {item.focusMatch ? "Matches your chosen focus" : "Adjacent development area"}</p><p>Evidence to review: {item.evidenceHints.join("; ")}. Confirm current eligibility directly with the issuing body.</p><a href={item.requirementsUrl} target="_blank" rel="noreferrer">Official requirements · {item.issuer}</a><button type="button" className="secondary" onClick={() => { setQualificationId(item.id); formRef.current?.scrollIntoView({ block: "center" }); formRef.current?.querySelector("select")?.focus(); }}>Add evidence for {item.name}</button></li>)}</ol>
      </section>

      {selected && <div className="backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <section ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-title">
          <div className="sectionHead"><div><p className="eyebrow">{selected.format} preview</p><h2 id="certificate-title">{selected.name}</h2></div><button type="button" className="close" onClick={() => setSelected(null)} aria-label="Close certificate preview">Close</button></div>
          {selected.file && previewUrl ? <div className="localPreview">{selected.format === "Image" ? <img src={previewUrl} alt={`Local sample ${selected.name}`}/> : <iframe title="Local sample certificate PDF" src={previewUrl}/>}<a href={previewUrl} download={selected.file.name}>Download local sample</a><p>Pending verification · Issued {selected.issued} · Expires {selected.expiresOn}</p></div> : <div className="preview" aria-label={selected.preview}>
            <span>INSPECTSOURCE SYNTHETIC DEMO</span>
            <strong>{selected.name}</strong>
            <p>{selected.issuer}</p>
            <p>Certificate evidence preview · not a real credential</p>
          </div>}
        </section>
      </div>}

      {shareTarget && <div className="backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShareTarget(null); }}>
        <section ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <div className="sectionHead"><div><p className="eyebrow">Permission-gated share</p><h2 id="share-title">Share {shareTarget.name}</h2></div><button type="button" className="close" onClick={() => setShareTarget(null)} aria-label="Close secure share dialog">Close</button></div>
          <p>Choose an authorized relationship. A production implementation must verify inspector ownership, recipient authorization, and the applicable client/agency relationship before granting document access.</p>
          <div className="shareActions">
            <button type="button" onClick={() => requestShare("client")}>Preview share with authorized client</button>
            <button type="button" onClick={() => requestShare("agency")}>Preview share with authorized agency</button>
          </div>
          <p className="privacy">No public link is created and no document is uploaded or persisted by this synthetic demo. This button only previews the relationship checks; it does not share your local file.</p>
        </section>
      </div>}

      <style jsx>{`
        .page{max-width:1100px;margin:auto;padding:28px 18px 70px;color:#163331}.hero,.card{background:#fff;border:1px solid #d8e6e3;border-radius:18px;padding:24px}.hero{margin-bottom:18px}.hero h1,.card h2{margin:4px 0 8px}.eyebrow{margin:0;text-transform:uppercase;letter-spacing:.08em;font-size:.76rem;font-weight:800;color:#14766d}.sectionHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.badge,.status{border-radius:999px;padding:6px 10px;font-size:.78rem;font-weight:800}.badge{background:#e8f5f2;color:#12665f}.documents{display:grid;gap:12px;margin-top:18px}.document{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:14px;border:1px solid #dce8e6;border-radius:14px;padding:16px}.document strong,.document span{display:block}.document div>span{margin-top:5px;color:#607572;font-size:.9rem}.status.ok{background:#e6f6ed;color:#17663a}.status.warning{background:#fff3d6;color:#7a5200}.status.pending{background:#eff6ff;color:#1e40af}.actions,.shareActions{display:flex;gap:8px;flex-wrap:wrap}button{border:1px solid #0d6f67;border-radius:10px;background:#0d6f67;color:#fff;padding:9px 12px;font-weight:800;cursor:pointer}button:hover{background:#095a54}button:focus-visible{outline:3px solid #72c8bf;outline-offset:2px}.secondary,.close{background:#fff;color:#0d6f67}.secondary:hover,.close:hover{background:#e8f5f2}.privacy,.notice{margin-top:18px;padding:12px 14px;border-radius:12px;background:#f3f8f7;color:#365754}.notice{border:1px solid #b9ddd7}.backdrop{position:fixed;inset:0;background:rgba(8,34,31,.58);display:grid;place-items:center;padding:20px;z-index:50}.dialog{width:min(680px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.25)}.preview{min-height:300px;margin-top:18px;border:2px solid #bfd8d4;border-radius:14px;padding:30px;display:grid;place-content:center;text-align:center;background:#f8fbfa}.preview span{font-size:.72rem;letter-spacing:.12em;color:#718985}.preview strong{font-size:1.35rem;margin-top:18px}.shareActions{margin-top:18px}@media(max-width:760px){.document{grid-template-columns:1fr}.sectionHead{align-items:flex-start}.actions{width:100%}.actions button{flex:1}}
        .addCard,.recommendationCard{margin-bottom:18px}.dateFields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.addCard form{margin-top:16px}.expiry{color:#475569;font-size:.85rem}.recommendations{padding-left:24px}.recommendations li{padding:14px 0;border-top:1px solid #dce8e6}.recommendations p{line-height:1.6;color:#475569}.recommendations a,.localPreview a{color:#115e59;font-weight:800;text-decoration:underline;display:block;margin:12px 0}.recommendations button{display:block}.localPreview img{max-width:100%;max-height:60vh;object-fit:contain}.localPreview iframe{width:100%;height:55vh;border:1px solid #cbd5e1}input,select{color:#0f172a;background:#fff;border-color:#64748b}button:disabled{background:#e2e8f0;color:#475569;border-color:#94a3b8}.backdrop{z-index:200}@media(max-width:760px){.dateFields{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
