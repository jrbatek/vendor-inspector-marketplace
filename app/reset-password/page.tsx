"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated. Redirecting to your workspace...");
    window.setTimeout(() => router.push("/client-dashboard"), 900);
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <p className="eyebrow">Account recovery</p>
        <h1>Create a new password</h1>
        <p className="intro">Choose a new password for your InspectSource account.</p>
        <form onSubmit={updatePassword}>
          <label>New password<input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <label>Confirm new password<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></label>
          <button type="submit" disabled={saving}>{saving ? "Updating..." : "Update password"}</button>
        </form>
        {message && <p className="notice">{message}</p>}
        <p className="muted"><Link href="/login">Back to login</Link></p>
      </section>
      <style jsx>{`.authPage{max-width:520px;margin:0 auto;padding:60px 18px}.authCard{background:#fff;border:1px solid #dbe3ee;border-radius:18px;padding:30px;box-shadow:0 14px 40px rgba(15,23,42,.08)}.eyebrow{margin:0 0 7px;font-size:.74rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569}.authCard h1{margin:0}.intro,.muted{color:#64748b}.authCard form{display:grid;gap:15px;margin-top:24px}.authCard label{display:grid;gap:6px;font-weight:800}.authCard input{padding:12px;border:1px solid #cbd5e1;border-radius:10px;font:inherit}.authCard button{padding:12px;border:0;border-radius:10px;background:#0f172a;color:white;font-weight:900;cursor:pointer}.authCard button:disabled{opacity:.65}.notice{padding:12px;border-radius:10px;background:#eff6ff}.muted{text-align:center}`}</style>
    </main>
  );
}
