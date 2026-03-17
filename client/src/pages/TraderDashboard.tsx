import SiteLayout from "@/components/SiteLayout";
import { useEffect, useMemo, useState } from "react";

type TraderQuote = {
  product: "Diesel" | "Naphtha" | "Kerosene";
  brent: number;
  plats: number;
  spread: number;
  trend: "up" | "down";
  updatedAt: string;
};

type TraderBoardSnapshot = {
  updatedAt: string;
  tradersOnline: number;
  marketPulse: "Bullish" | "Bearish" | "Neutral";
  quotes: TraderQuote[];
};

const fallback: TraderBoardSnapshot = {
  updatedAt: new Date().toISOString(),
  tradersOnline: 21,
  marketPulse: "Neutral",
  quotes: [
    { product: "Diesel", brent: 88.4, plats: 93.1, spread: 4.7, trend: "up", updatedAt: new Date().toISOString() },
    { product: "Naphtha", brent: 81.7, plats: 85.9, spread: 4.2, trend: "up", updatedAt: new Date().toISOString() },
    { product: "Kerosene", brent: 86.2, plats: 90.4, spread: 4.2, trend: "up", updatedAt: new Date().toISOString() },
  ],
};

export default function TraderDashboard() {
  const [snapshot, setSnapshot] = useState<TraderBoardSnapshot>(fallback);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/trader-dashboard");
        if (!response.ok) {
          throw new Error("Unable to load trader dashboard");
        }
        const data = (await response.json()) as TraderBoardSnapshot;
        if (!cancelled) {
          setSnapshot(data);
        }
      } catch {
        // Keep fallback data
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const lastUpdate = useMemo(
    () => new Date(snapshot.updatedAt).toLocaleTimeString(),
    [snapshot.updatedAt],
  );

  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="text-primary font-tech text-xs tracking-[0.22em] uppercase mb-2">Live Trader Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-display text-white mb-3">Brent & Platts Live Pricing</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-200">
              <span className="rounded-full border border-white/15 px-3 py-1">Traders Online: {snapshot.tradersOnline}</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Market Pulse: {snapshot.marketPulse}</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Last Update: {lastUpdate}</span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {snapshot.quotes.map((quote) => (
              <article key={quote.product} className="rounded-2xl border border-white/15 bg-secondary/70 p-5">
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">{quote.product}</p>
                <p className="text-white text-3xl font-display mb-3">${quote.plats.toFixed(2)}</p>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>Brent: <span className="text-white">${quote.brent.toFixed(2)}</span></p>
                  <p>Platts: <span className="text-white">${quote.plats.toFixed(2)}</span></p>
                  <p>Spread: <span className="text-white">${quote.spread.toFixed(2)}</span></p>
                  <p>
                    Trend:{" "}
                    <span className={quote.trend === "up" ? "text-emerald-400" : "text-red-400"}>
                      {quote.trend === "up" ? "▲ Up" : "▼ Down"}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
