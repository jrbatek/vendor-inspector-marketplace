"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else router.push("/dashboard");
  }

  return (
    <section className="panel">
      <h1>Login</h1>
      <form onSubmit={login}>
        <label>Email<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></label>
        <button type="submit">Log in</button>
      </form>
      {message && <p className="notice">{message}</p>}
      <p className="muted">Need an account? <Link href="/register">Register</Link></p>
    </section>
  );
}
