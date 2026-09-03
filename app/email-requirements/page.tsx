import ClientWorkspaceSidebar from "@/components/ClientWorkspaceSidebar";

const mailto = "mailto:inspectsource2026@gmail.com?subject=InspectSource%20-%20Inspection%20Request";

export default function EmailRequirementsPage() {
  return <main className="shell"><ClientWorkspaceSidebar/><section className="workspace">
    <section className="hero">
      <p className="eyebrow">Email Requirements</p>
      <h1>Send an inspection request by email</h1>
      <p>Use the guide below so InspectSource can turn your email into the same structured request used by the Natural Language and Structured Selection workflows.</p>
      <a className="emailButton" href={mailto}>Open Email</a>
    </section>

    <section className="grid">
      <article className="card sample">
        <p className="eyebrow">Copy-ready example</p>
        <h2>Sample request</h2>
        <pre>{`Location: Houston, Texas\nStart date: September 14, 2026\nDuration: 3 weeks\nInspection type: API 570 piping inspection\nRequired credentials: API 570, TWIC\nIndustry / equipment: Refinery turnaround / process piping\nMaximum day rate: USD 950\nTravel requirements: Local preferred\nAdditional notes: Day shift; client safety orientation required.`}</pre>
        <p className="hint">Subject: <strong>InspectSource - Inspection Request</strong></p>
      </article>

      <article className="card">
        <p className="eyebrow">If you write your own</p>
        <h2>Include these fields</h2>
        <ul>
          <li><strong>Location</strong> and <strong>start date</strong></li>
          <li>Expected duration or schedule</li>
          <li>Inspection activity, equipment, discipline, or scope</li>
          <li>Required certifications, codes, standards, site credentials, or languages</li>
          <li>Maximum day rate and currency, if applicable</li>
          <li>Travel, offshore, remote-review, or shift requirements</li>
          <li>Any supplier, project, safety, or access information that affects the assignment</li>
        </ul>
      </article>

      <article className="card">
        <p className="eyebrow">Attachments</p>
        <h2>What to attach</h2>
        <p>Attach the scope, ITP, drawings, specifications, or qualification requirements when they help define the assignment.</p>
        <ul>
          <li>Preferred file types: PDF, DOC/DOCX, XLS/XLSX, CSV, TXT, JPG, or PNG.</li>
          <li>Keep total attachments to <strong>20 MB or less</strong> per email.</li>
          <li>Use clear file names and avoid password-protected files where possible.</li>
          <li>Do not include sensitive personal information that is not needed to match or manage the inspection.</li>
        </ul>
      </article>
    </section>

    <section className="footerCallout">
      <div><strong>Ready?</strong><span> Your email client will open with the InspectSource subject already filled in.</span></div>
      <a className="emailButton" href={mailto}>Open Email</a>
    </section>
  </section><style jsx>{`.shell{max-width:1440px;margin:auto;padding:24px 18px 80px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px}.workspace{min-width:0}.hero,.card,.footerCallout{border:1px solid #dbe3ea;border-radius:18px;background:#fff}.hero{padding:30px;background:linear-gradient(135deg,#f8fbff,#f0fdfa);box-shadow:0 12px 34px rgba(15,23,42,.06)}.eyebrow{margin:0 0 6px;font-size:.76rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e}.hero h1{margin:0;font-size:2rem}.hero p{max-width:820px;color:#526174;line-height:1.65}.emailButton{display:inline-flex;align-items:center;justify-content:center;margin-top:8px;padding:11px 16px;border-radius:10px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800}.grid{display:grid;grid-template-columns:1.15fr 1fr 1fr;gap:16px;margin-top:18px}.card{padding:22px}.card h2{margin:0 0 12px}.card p,.card li{color:#526174;line-height:1.55}.card ul{padding-left:20px;margin:10px 0 0}.card li{margin-bottom:8px}.sample pre{margin:14px 0 10px;padding:16px;border-radius:12px;background:#0f172a;color:#e2e8f0;white-space:pre-wrap;font:500 .86rem/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}.hint{font-size:.9rem}.footerCallout{margin-top:18px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}.footerCallout .emailButton{margin-top:0;white-space:nowrap}@media(max-width:1050px){.grid{grid-template-columns:1fr}.shell{grid-template-columns:1fr}}@media(max-width:620px){.footerCallout{align-items:flex-start;flex-direction:column}}`}</style></main>;
}
