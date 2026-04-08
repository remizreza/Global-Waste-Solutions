import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { pageLinks } from "@/lib/siteContent";
import { useEffect } from "react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;
    fetch("/api/admin/session", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache", Pragma: "no-cache" },
    })
      .then((response) => {
        if (cancelled) return;
        if (response.ok) {
          setLocation(pageLinks.adminDashboard);
          return;
        }
        localStorage.removeItem("admin_token");
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setLocation]);

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
        <div className="container mx-auto max-w-xl rounded-[28px] border border-emerald-950/35 bg-[linear-gradient(160deg,rgba(8,15,30,0.96),rgba(10,28,22,0.9)_60%,rgba(14,45,0,0.72))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.38)]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-primary font-tech text-xs tracking-[0.22em] uppercase mb-3">Admin Access</p>
              <h1 className="text-3xl font-display text-white mb-2">Admin Login</h1>
              <p className="text-sm text-gray-300">Secure pricing workbench for REDOXY trading and negotiation analysis.</p>
            </div>
            <div className="rounded-full border border-emerald-900/35 bg-[linear-gradient(145deg,rgba(6,16,28,0.72),rgba(10,34,16,0.4))] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-300">
              Secure Desk
            </div>
          </div>

          {checkingSession ? (
            <div className="rounded-2xl border border-emerald-950/35 bg-[linear-gradient(145deg,rgba(5,10,20,0.66),rgba(10,28,18,0.4))] p-6 text-sm text-slate-300">
              Checking admin session...
            </div>
          ) : (
            <>
              <form className="space-y-4" onSubmit={onSubmit}>
                <label className="grid gap-2 text-sm text-slate-200">
                  Username
                  <input className="w-full rounded-xl border border-emerald-950/35 bg-[rgba(5,10,20,0.28)] px-4 py-3 text-white outline-none transition-colors focus:border-primary/40" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin username" required />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Password
                  <input className="w-full rounded-xl border border-emerald-950/35 bg-[rgba(5,10,20,0.28)] px-4 py-3 text-white outline-none transition-colors focus:border-primary/40" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required />
                </label>
                {error ? <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
                <button disabled={loading} className="w-full rounded-xl bg-primary px-4 py-3 text-black font-tech uppercase tracking-[0.16em] transition-opacity disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? "Signing in..." : "Open Admin Dashboard"}
                </button>
                <p className="text-xs text-gray-400">
                  Trader dashboard only?{" "}
                  <Link href={pageLinks.login} className="text-primary hover:underline">Open trader login</Link>.
                </p>
              </form>
            </>
          )}
        </div>
      </section>
  );
}
