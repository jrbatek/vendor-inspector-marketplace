"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

type AccountRole = "client" | "inspector";

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("rate limit") || normalized.includes("email rate")) {
    return "Too many authentication emails have been requested. Please wait a little while and try again. Your information has not been lost.";
  }
  if (normalized.includes("already registered") || normalized.includes("user already")) {
    return "An account already exists for this email. Use Log in or Forgot password instead.";
  }
  return message;
}

export default function RegisterPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("client");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, full_name: name, role } },
    });

    setSaving(false);

    if (error) {
      setMessage(friendlyAuthError(error.message));
      return;
    }

    setMessage(
      "Account created. If email confirmation is enabled, confirm your email before logging in.",
    );

    if (data.session) {
      router.push(role === "inspector" ? "/dashboard" : "/client-dashboard");
    }
  }

  return (
    <section className="panel authPanel">
      <p className="eyebrow">Join InspectSource</p>
      <h1>Create an account</h1>
      <p className="muted">Choose the path that matches how you will use the platform.</p>

      <form onSubmit={register}>
        <div className="roleChoice">
          <label className={role === "client" ? "roleCard selected" : "roleCard"}>
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === "client"}
              onChange={() => setRole("client")}
            />
            <span><strong>Client</strong><small>Find inspectors and manage inspection programs.</small></span>
          </label>

          <label className={role === "inspector" ? "roleCard selected" : "roleCard"}>
            <input
              type="radio"
              name="role"
              value="inspector"
              checked={role === "inspector"}
              onChange={() => setRole("inspector")}
            />
            <span><strong>Inspector</strong><small>Create a profile, receive opportunities, and manage assignments.</small></span>
          </label>
        </div>

        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></label>
        <button type="submit" disabled={saving}>{saving ? "Creating account..." : "Create account"}</button>
      </form>

      {message && <p className="notice">{message}</p>}
      <p className="muted">Already have an account? <Link href="/login">Log in</Link></p>
    </section>
  );
}
