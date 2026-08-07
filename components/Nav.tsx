import Link from "next/link";

export default function Nav() {
  return (
    <header className="nav">
      <Link href="/" className="brand">InspectSource</Link>
      <nav>
        <Link href="/project-coordinator">AI Project Coordinator</Link>
        <Link href="/find-inspectors">Find Inspectors</Link>
        <Link href="/inspectors">Browse Qualifications</Link>
        <Link href="/client-dashboard">Client Dashboard</Link>
        <Link href="/dashboard">Inspector Profile</Link>
        <Link href="/inspector-inquiries">Inspector Requests</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>
    </header>
  );
}
