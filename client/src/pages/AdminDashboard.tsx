import SiteLayout from "@/components/SiteLayout";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";

const traderQuoteSchema = z.object({
  product: z.enum(["Diesel", "Naphtha", "Kerosene"]),
  brent: z.number(),
  plats: z.number(),
  spread: z.number(),
  trend: z.enum(["up", "down"]),
  updatedAt: z.string(),
  unit: z.enum(["USD/bbl", "USD/mt"]),
  source: z.string(),
});

const traderBoardSnapshotSchema = z.object({
  updatedAt: z.string(),
  tradersOnline: z.number(),
  marketPulse: z.enum(["Bullish", "Bearish", "Neutral"]),
  quotes: z.array(traderQuoteSchema),
});

type TraderBoardSnapshot = z.infer<typeof traderBoardSnapshotSchema>;

type Point = {
  time: string;
  Diesel?: number;
  Naphtha?: number;
  Kerosene?: number;
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [snapshot, setSnapshot] = useState<TraderBoardSnapshot | null>(null);
  const [history, setHistory] = useState<Point[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/admin/login");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const session = await fetch("/api/admin/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!session.ok) {
          localStorage.removeItem("admin_token");
          setLocation("/admin/login");
          return;
        }

        const response = await fetch("/api/trader-dashboard");
        if (!response.ok) return;
        const json = await response.json();
        const data = traderBoardSnapshotSchema.parse(json);
        if (cancelled) return;

        setSnapshot(data);
        const row: Point = { time: new Date(data.updatedAt).toLocaleTimeString() };
        for (const quote of data.quotes) {
          row[quote.product] = quote.plats;
        }
        setHistory((prev) => [...prev.slice(-35), row]);
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setLocation]);

  const cards = snapshot?.quotes ?? [];
  const updated = useMemo(() => (snapshot ? new Date(snapshot.updatedAt).toLocaleString() : "--"), [snapshot]);

  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl space-y-6">
          <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="text-primary text-xs font-tech uppercase tracking-[0.2em] mb-2">Admin Dashboard</p>
            <h1 className="text-3xl font-display text-white">Full Real-time Feed</h1>
            <p className="text-gray-300 text-sm mt-2">Updated: {updated}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {cards.map((quote) => (
              <article key={quote.product} className="rounded-2xl border border-white/15 bg-secondary/70 p-5">
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">{quote.product}</p>
                <p className="text-white text-2xl font-display">Platts ${quote.plats.toFixed(2)}</p>
                <p className="text-sm text-gray-300">Brent ${quote.brent.toFixed(2)} • Spread ${quote.spread.toFixed(2)}</p>
                <p className="text-sm text-gray-400">Unit: {quote.unit} • Source: {quote.source}</p>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-white/15 bg-card/60 p-5">
            <h2 className="text-xl text-white font-display mb-4">Platts Trend (Last 36 updates)</h2>
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
      </section>
    </SiteLayout>
  );
}
