import SiteLayout from "@/components/SiteLayout";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const traderQuoteSchema = z.object({
  product: z.enum(["Brent Crude", "WTI Crude", "Natural Gas", "Heating Oil", "Gasoline"]),
  price: z.number(),
  rawPrice: z.number(),
  rawUnit: z.enum(["USD/bbl", "USD/gal", "USD/MMBtu"]),
  trend: z.enum(["up", "down"]),
  updatedAt: z.string(),
  unit: z.enum(["USD/mt", "USD/mt eq"]),
  source: z.string(),
  note: z.string().optional(),
});

const traderBoardSnapshotSchema = z.object({
  updatedAt: z.string(),
  tradersOnline: z.number(),
  marketPulse: z.enum(["Bullish", "Bearish", "Neutral"]),
  quotes: z.array(traderQuoteSchema),
});

type TraderBoardSnapshot = z.infer<typeof traderBoardSnapshotSchema>;

const fallback: TraderBoardSnapshot = {
  updatedAt: new Date().toISOString(),
  tradersOnline: 21,
  marketPulse: "Neutral",
  quotes: [
    { product: "Brent Crude", price: 700, rawPrice: 95.5, rawUnit: "USD/bbl", trend: "up", updatedAt: new Date().toISOString(), unit: "USD/mt", source: "fallback" },
    { product: "WTI Crude", price: 675, rawPrice: 88.6, rawUnit: "USD/bbl", trend: "up", updatedAt: new Date().toISOString(), unit: "USD/mt", source: "fallback" },
    { product: "Natural Gas", price: 149, rawPrice: 2.867, rawUnit: "USD/MMBtu", trend: "up", updatedAt: new Date().toISOString(), unit: "USD/mt eq", source: "fallback", note: "LNG equivalent using 52 MMBtu/mt" },
    { product: "Heating Oil", price: 1193, rawPrice: 3.8094, rawUnit: "USD/gal", trend: "up", updatedAt: new Date().toISOString(), unit: "USD/mt", source: "fallback" },
    { product: "Gasoline", price: 1059, rawPrice: 2.955, rawUnit: "USD/gal", trend: "up", updatedAt: new Date().toISOString(), unit: "USD/mt", source: "fallback" },
  ],
};

export default function TraderDashboard() {
  const [snapshot, setSnapshot] = useState<TraderBoardSnapshot>(fallback);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/trader-dashboard", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        if (!response.ok) throw new Error("Unable to load");
        const json = await response.json();
        const data = traderBoardSnapshotSchema.parse(json);
        if (!cancelled) setSnapshot(data);
      } catch (error) {
        console.error("Failed to load trader dashboard data:", error);
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
            <h1 className="text-3xl md:text-4xl font-display text-white mb-3">Live Energy Prices From IG</h1>
            <p className="text-sm text-gray-300">Board unit: <span className="text-white font-medium">USD per metric ton or equivalent</span></p>
            <p className="text-sm text-gray-300 mt-1">Updated: {updated}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.quotes.map((quote) => (
              <article key={quote.product} className="rounded-2xl border border-white/15 bg-secondary/70 p-5">
                <p className="text-primary text-xs font-tech uppercase tracking-[0.18em] mb-2">{quote.product}</p>
                <p className="text-white text-3xl font-display mb-1">${quote.price.toFixed(2)}</p>
                <p className="text-sm text-gray-200">Unit: <span className="text-white font-medium">{quote.unit}</span></p>
                <p className="text-sm text-gray-300 mt-1">Raw IG basis: ${quote.rawPrice.toFixed(quote.rawUnit === "USD/gal" ? 4 : quote.rawUnit === "USD/MMBtu" ? 3 : 2)} {quote.rawUnit}</p>
                <p className="text-xs text-gray-400 mt-1">Source: {quote.source}</p>
                {quote.note ? <p className="text-xs text-gray-500 mt-1">{quote.note}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
