import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { pageLinks } from "@/lib/siteContent";

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
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = (await response.json()) as { error?: string; token?: string };
      if (!response.ok || !data.token) {
        throw new Error(data.error ?? "Invalid admin username or password");
      }

      localStorage.setItem("admin_token", data.token);
      setLocation(pageLinks.adminDashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
      <section className="min-h-screen bg-background px-6 pb-16 pt-20 text-foreground">
        <div className="container mx-auto max-w-xl rounded-2xl border border-white/15 bg-card/60 p-8">
          <p className="text-primary font-tech text-xs tracking-[0.22em] uppercase mb-3">Admin Access</p>
          <h1 className="text-3xl font-display text-white mb-2">Admin Login</h1>
          <p className="text-sm text-gray-300 mb-6">Use the same configured admin credentials here to open the admin dashboard.</p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <input className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin username" required />
            <input className="w-full rounded-lg border border-white/15 bg-black/20 px-4 py-3 text-white" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
            {error ? <p className="text-red-400 text-sm">{error}</p> : null}
            <button disabled={loading} className="w-full rounded-lg bg-primary px-4 py-3 text-black font-tech uppercase tracking-[0.16em]">
              {loading ? "Signing in..." : "Open Admin Dashboard"}
            </button>
            <p className="text-xs text-gray-400">
              Trader dashboard only?{' '}
              <Link href={pageLinks.login} className="text-primary hover:underline">Open trader login</Link>
              .
            </p>
          </form>
        </div>
      </section>
  );
}
