import Link from "next/link";

export default function Nav() {
  return (
    <header className="nav">
      <Link href="/" className="brand">InspectSource</Link>
      <nav>
        <Link href="/find-inspectors">Find Inspectors</Link>
        <Link href="/inspectors">Directory</Link>
        <Link href="/client-dashboard">Client Dashboard</Link>
        <Link href="/dashboard">Inspector Dashboard</Link>
        <Link href="/inspector-inquiries">Inquiries</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>
    </header>
  );
}
