import SiteLayout from "@/components/SiteLayout";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const payload = (await response.json()) as {
        token?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Invalid admin username or password");
      }

      if (!payload.token) {
        throw new Error("Admin login did not return a session token");
      }

      localStorage.setItem("admin_token", payload.token);
      setLocation("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-xl rounded-2xl border border-white/15 bg-card/60 p-8">
          <p className="text-primary font-tech text-xs tracking-[0.22em] uppercase mb-3">Admin Access</p>
          <h1 className="text-3xl font-display text-white mb-4">Admin Login</h1>
          <p className="text-xs text-gray-400 mb-4">
            Sign in to the hosted backend control center for advanced actions, runtime checks, and market-feed operations.
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Accepted fallback credentials in this build are <span className="text-white">Remiz</span> / <span className="text-white">Remiz123312</span>. Legacy deployments may still accept <span className="text-white">admin</span> / <span className="text-white">ChangeMe123!</span>.
          </p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <input className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin username" required />
            <input className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
            {error ? <p className="text-red-400 text-sm">{error}</p> : null}
            <button disabled={loading} className="w-full rounded-lg bg-primary px-4 py-3 text-black font-tech uppercase tracking-[0.16em]">
              {loading ? "Signing in..." : "Open Admin Dashboard"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
