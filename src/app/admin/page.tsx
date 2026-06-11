"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((data) => setNeedsSetup(data.needsSetup))
      .catch(() => setNeedsSetup(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password || loading) return;

    setLoading(true);
    setError("");

    const endpoint = needsSetup ? "/api/admin/setup" : "/api/admin/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (needsSetup) {
        const loginRes = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password }),
        });
        if (!loginRes.ok) {
          setError("Account created but login failed. Try logging in.");
          setNeedsSetup(false);
          return;
        }
      }

      router.push("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (needsSetup === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse w-8 h-8 rounded-full bg-[#EDE5DC]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#8B5E3C] mb-4">
            <span className="text-xl text-white">&#128274;</span>
          </div>
          <h1 className="text-xl font-bold text-[#4A3425]">
            {needsSetup ? "Create Admin Account" : "Admin Login"}
          </h1>
          <p className="text-sm text-[#8B7355] mt-1">
            {needsSetup
              ? "Set up your first admin account"
              : "Sign in to manage orders"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-elevated p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="section-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="section-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              minLength={6}
              required
            />
            {needsSetup && (
              <p className="text-xs text-[#8B7355] mt-1">Minimum 6 characters</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? "Please wait..."
              : needsSetup
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
