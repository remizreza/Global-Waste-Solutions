import SiteLayout from "@/components/SiteLayout";
import { useEffect, useMemo, useState } from "react";

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

const fallback: TraderBoardSnapshot = {
  updatedAt: new Date().toISOString(),
  tradersOnline: 21,
  marketPulse: "Neutral",
  quotes: [
    { product: "Diesel", brent: 88.4, plats: 93.1, spread: 4.7, trend: "up", updatedAt: new Date().toISOString(), unit: "USD/bbl", source: "fallback" },
    { product: "Naphtha", brent: 81.7, plats: 85.9, spread: 4.2, trend: "up", updatedAt: new Date().toISOString(), unit: "USD/bbl", source: "fallback" },
    { product: "Kerosene", brent: 86.2, plats: 90.4, spread: 4.2, trend: "up", updatedAt: new Date().toISOString(), unit: "USD/bbl", source: "fallback" },
  ],
};

export default function TraderDashboard() {
  const [snapshot, setSnapshot] = useState<TraderBoardSnapshot>(fallback);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/trader-dashboard");
        if (!response.ok) throw new Error("Unable to load");
        const data = (await response.json()) as TraderBoardSnapshot;
        if (!cancelled) setSnapshot(data);
      } catch {
        // fallback retained
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const updated = useMemo(() => new Date(snapshot.updatedAt).toLocaleTimeString(), [snapshot.updatedAt]);

  return (
    <SiteLayout>
      <section className="min-h-screen pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="text-primary font-tech text-xs tracking-[0.22em] uppercase mb-2">Public Live Price Board</p>
            <h1 className="text-3xl md:text-4xl font-display text-white mb-3">Live Brent / Platts Prices</h1>
            <p className="text-sm text-gray-300">Price unit: <span className="text-white font-medium">USD per barrel (USD/bbl)</span></p>
            <p className="text-sm text-gray-300 mt-1">Updated: {updated}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {snapshot.quotes.map((quote) => (
              <article key={quote.product} className="rounded-2xl border border-white/15 bg-secondary/70 p-5">
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">{quote.product}</p>
                <p className="text-white text-3xl font-display mb-1">${quote.plats.toFixed(2)}</p>
                <p className="text-sm text-gray-200">Unit: <span className="text-white font-medium">{quote.unit}</span></p>
                <p className="text-xs text-gray-400 mt-1">Source: {quote.source}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
