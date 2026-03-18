import SiteLayout from "@/components/SiteLayout";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TraderQuote = {
  product: "Diesel" | "Naphtha" | "Kerosene";
  brent: number;
  plats: number;
  spread: number;
  trend: "up" | "down";
  updatedAt: string;
  unit: "USD/bbl" | "USD/mt";
  source: string;
};

type TraderBoardSnapshot = {
  updatedAt: string;
  tradersOnline: number;
  marketPulse: "Bullish" | "Bearish" | "Neutral";
  quotes: TraderQuote[];
};

type AdminServiceStatus = {
  id: string;
  label: string;
  status: "healthy" | "degraded" | "offline";
  detail: string;
};

type AdminActionDefinition = {
  id: "sync-market-feeds" | "refresh-bulletin" | "issue-runtime-check";
  label: string;
  description: string;
  impact: string;
};

type AdminActionLog = {
  id: string;
  actionId: AdminActionDefinition["id"];
  label: string;
  status: "completed" | "queued";
  detail: string;
  createdAt: string;
};

type AdminControlCenterPayload = {
  session: {
    ok: true;
    user: string;
    expiresAt: string;
  };
  host: {
    appName: string;
    environment: string;
    uptimeSeconds: number;
    regionHint: string;
    apiBasePath: string;
  };
  services: AdminServiceStatus[];
  actions: AdminActionDefinition[];
  actionHistory: AdminActionLog[];
  latestSnapshot: TraderBoardSnapshot;
};

type Point = {
  time: string;
  Diesel?: number;
  Naphtha?: number;
  Kerosene?: number;
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [controlCenter, setControlCenter] = useState<AdminControlCenterPayload | null>(null);
  const [history, setHistory] = useState<Point[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [runningActionId, setRunningActionId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/admin/login");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/admin/control-center", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("admin_token");
          setLocation("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load hosted admin control center");
        }

        const data = (await response.json()) as AdminControlCenterPayload;
        if (cancelled) return;

        setError(null);
        setControlCenter(data);

        const row: Point = {
          time: new Date(data.latestSnapshot.updatedAt).toLocaleTimeString(),
        };
        for (const quote of data.latestSnapshot.quotes) {
          row[quote.product] = quote.plats;
        }
        setHistory((prev) => [...prev.slice(-35), row]);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to reach hosted admin control center",
          );
        }
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setLocation]);

  const runAction = async (actionId: AdminActionDefinition["id"]) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/admin/login");
      return;
    }

    setRunningActionId(actionId);
    setError(null);

    try {
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actionId }),
      });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        setLocation("/admin/login");
        return;
      }

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        controlCenter?: AdminControlCenterPayload;
      };

      if (!response.ok || !payload.ok || !payload.controlCenter) {
        throw new Error(payload.error ?? "Unable to run backend action");
      }

      setControlCenter(payload.controlCenter);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to run backend action",
      );
    } finally {
      setRunningActionId(null);
    }
  };

  const snapshot = controlCenter?.latestSnapshot;
  const cards = snapshot?.quotes ?? [];
  const updated = useMemo(
    () => (snapshot ? new Date(snapshot.updatedAt).toLocaleString() : "--"),
    [snapshot],
  );

  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-7xl space-y-6">
          <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="text-primary text-xs font-tech uppercase tracking-[0.2em] mb-2">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-display text-white">
              Hosted Backend Control Center
            </h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-300">
              <span className="rounded-full border border-white/10 px-3 py-1">
                Operator: {controlCenter?.session.user ?? "--"}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Environment: {controlCenter?.host.environment ?? "--"}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Uptime: {controlCenter?.host.uptimeSeconds ?? 0}s
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                Updated: {updated}
              </span>
            </div>
            {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-3">
                {cards.map((quote) => (
                  <article
                    key={quote.product}
                    className="rounded-2xl border border-white/15 bg-secondary/70 p-5"
                  >
                    <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">
                      {quote.product}
                    </p>
                    <p className="text-white text-2xl font-display">
                      Platts ${quote.plats.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      Brent ${quote.brent.toFixed(2)} • Spread ${quote.spread.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Unit: {quote.unit} • Source: {quote.source}
                    </p>
                  </article>
                ))}
              </div>

              <div className="rounded-2xl border border-white/15 bg-card/60 p-5">
                <h2 className="text-xl text-white font-display mb-4">
                  Backend Host Services
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {(controlCenter?.services ?? []).map((service) => (
                    <div
                      key={service.id}
                      className="rounded-xl border border-white/10 bg-black/10 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-white font-medium">{service.label}</p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-tech uppercase tracking-[0.12em] ${
                            service.status === "healthy"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : service.status === "degraded"
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-red-500/15 text-red-300"
                          }`}
                        >
                          {service.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-300">{service.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-card/60 p-5">
                <h2 className="text-xl text-white font-display mb-4">
                  Platts Trend (Last 36 updates)
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <XAxis dataKey="time" hide />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Line type="monotone" dataKey="Diesel" stroke="#f59e0b" dot={false} />
                      <Line type="monotone" dataKey="Naphtha" stroke="#22d3ee" dot={false} />
                      <Line type="monotone" dataKey="Kerosene" stroke="#a78bfa" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/15 bg-card/60 p-5">
                <h2 className="text-xl text-white font-display mb-4">
                  Host Runtime Overview
                </h2>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>App: <span className="text-white">{controlCenter?.host.appName ?? "--"}</span></p>
                  <p>Region: <span className="text-white">{controlCenter?.host.regionHint ?? "--"}</span></p>
                  <p>API Base: <span className="text-white">{controlCenter?.host.apiBasePath ?? "--"}</span></p>
                  <p>Session Expires: <span className="text-white">{controlCenter ? new Date(controlCenter.session.expiresAt).toLocaleString() : "--"}</span></p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-card/60 p-5">
                <h2 className="text-xl text-white font-display mb-4">
                  Backend Actions
                </h2>
                <div className="space-y-3">
                  {(controlCenter?.actions ?? []).map((action) => (
                    <div key={action.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                      <p className="text-white font-medium">{action.label}</p>
                      <p className="mt-1 text-sm text-gray-300">{action.description}</p>
                      <p className="mt-1 text-xs text-gray-400">Impact: {action.impact}</p>
                      <button
                        type="button"
                        onClick={() => runAction(action.id)}
                        disabled={runningActionId === action.id}
                        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-tech uppercase tracking-[0.14em] text-black disabled:opacity-60"
                      >
                        {runningActionId === action.id ? "Running..." : "Run Action"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-card/60 p-5">
                <h2 className="text-xl text-white font-display mb-4">
                  Recent Action Log
                </h2>
                <div className="space-y-3">
                  {(controlCenter?.actionHistory ?? []).length > 0 ? (
                    controlCenter?.actionHistory.map((item) => (
                      <div key={item.id} className="rounded-xl border border-white/10 bg-black/10 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-white font-medium">{item.label}</p>
                          <span className="text-xs uppercase tracking-[0.14em] text-emerald-300">
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-300">{item.detail}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">
                      No backend actions executed yet. Trigger one to validate the hosted control plane.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
