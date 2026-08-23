import Link from "next/link";

export default function DemoLandingPage() {
  return (
    <main className="demoLanding">
      <section className="hero">
        <p className="eyebrow">InspectSource Demo</p>
        <h1>Choose the experience you want to explore</h1>
        <p>See InspectSource from either side of the marketplace. Demo data is synthetic and does not require a login.</p>
      </section>

      <section className="demoChoices">
        <Link href="/demo/client" className="demoCard clientCard">
          <span className="number">1</span>
          <p className="eyebrow">For inspection buyers</p>
          <h2>Client Demo</h2>
          <p>Request inspections, monitor work in progress, review reports, explore inspection history, analytics, benchmarking, and API data access.</p>
          <strong>Open Client Demo →</strong>
        </Link>

        <Link href="/demo/inspector" className="demoCard inspectorCard">
          <span className="number">2</span>
          <p className="eyebrow">For inspection professionals</p>
          <h2>Inspector Demo</h2>
          <p>Review opportunities, manage active assignments, maintain qualifications and availability, submit reports, and track assignment history and earnings.</p>
          <strong>Open Inspector Demo →</strong>
        </Link>
      </section>

      <style jsx>{`
        .demoLanding{max-width:1080px;margin:0 auto;padding:52px 18px 80px}.hero{text-align:center;max-width:760px;margin:0 auto 28px}.eyebrow{margin:0 0 7px;font-size:.75rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569}.hero h1{font-size:2.3rem;margin:0}.hero p{color:#64748b;line-height:1.6}.demoChoices{display:grid;grid-template-columns:1fr 1fr;gap:20px}.demoCard{position:relative;display:block;padding:30px;border-radius:20px;text-decoration:none;color:#0f172a;min-height:270px;border:1px solid #cbd5e1;box-shadow:0 14px 35px rgba(15,23,42,.08);transition:transform .15s ease,box-shadow .15s ease}.demoCard:hover{transform:translateY(-3px);box-shadow:0 18px 42px rgba(15,23,42,.13)}.clientCard{background:linear-gradient(145deg,#eff6ff,#ffffff)}.inspectorCard{background:linear-gradient(145deg,#ecfdf5,#ffffff)}.number{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#0f172a;color:white;font-weight:900}.demoCard h2{font-size:1.7rem;margin:14px 0 8px}.demoCard p:not(.eyebrow){color:#475569;line-height:1.6}.demoCard strong{position:absolute;bottom:28px;left:30px}@media(max-width:760px){.demoChoices{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
