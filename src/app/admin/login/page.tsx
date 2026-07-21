"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setError(error.message ?? "Sign-in failed.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-line bg-raised p-8"
      >
        <p className="sys-tag mb-2">Perimeter console</p>
        <h1 className="mb-8 text-xl font-medium text-snow">Sign in</h1>

        <label className="sys-tag mb-2 block">Email</label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field mb-4"
          autoComplete="email"
        />

        <label className="sys-tag mb-2 block">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field mb-6"
          autoComplete="current-password"
        />

        {error && (
          <p className="mb-4 text-xs text-[#e5484d]" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center">
          {busy ? "Verifying…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
