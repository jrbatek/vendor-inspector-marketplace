import Link from "next/link";

export default function Nav() {
  return (
    <header className="nav">
      <Link href="/inspectors" className="brand">InspectSource</Link>
      <nav>
        <Link href="/inspectors">Inspectors</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>
    </header>
  );
}
