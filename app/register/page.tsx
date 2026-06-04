"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

export default function RegisterPage() {
  const supabase = supabaseBrowser();
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");

  async function register(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    setMessage(error ? error.message : "Account created. If email confirmation is enabled, check your email. Then log in.");
  }

  return (
    <section className="panel">
      <h1>Register</h1>
      <p className="muted">Create an inspector account. You will build your profile after logging in.</p>
      <form onSubmit={register}>
        <label>Name<input value={name} onChange={(e)=>setName(e.target.value)} required /></label>
        <label>Email<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6} /></label>
        <button type="submit">Create account</button>
      </form>
      {message && <p className="notice">{message}</p>}
      <p className="muted">Already have an account? <Link href="/login">Log in</Link></p>
    </section>
  );
}
