import SiteLayout from "@/components/SiteLayout";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const benchmarkQuoteSchema = z.object({
  key: z.enum(["brent", "dubaiProxy"]),
  label: z.string(),
  source: z.string(),
  symbol: z.string(),
  priceUsdPerBbl: z.number(),
  priceUsdPerMt: z.number(),
  previousUsdPerBbl: z.number().nullable(),
  changeUsdPerBbl: z.number().nullable(),
  changePercent: z.number().nullable(),
  trend: z.enum(["up", "down", "flat"]),
  updatedAt: z.string(),
  note: z.string().optional(),
});

const traderBoardSnapshotSchema = z.object({
  updatedAt: z.string(),
  tradersOnline: z.number(),
  marketPulse: z.enum(["Bullish", "Bearish", "Neutral"]),
  benchmarkMode: z.literal("benchmark-driven"),
  benchmarks: z.array(benchmarkQuoteSchema),
  quotes: z.array(z.unknown()),
});

type TraderBoardSnapshot = z.infer<typeof traderBoardSnapshotSchema>;
type BenchmarkQuote = z.infer<typeof benchmarkQuoteSchema>;

const fallback: TraderBoardSnapshot = {
  updatedAt: new Date().toISOString(),
  tradersOnline: 21,
  marketPulse: "Neutral",
  benchmarkMode: "benchmark-driven",
  benchmarks: [
    {
      key: "brent",
      label: "Brent Benchmark",
      source: "fallback",
      symbol: "BRENT",
      priceUsdPerBbl: 95.5,
      priceUsdPerMt: 700,
      previousUsdPerBbl: 94.1,
      changeUsdPerBbl: 1.4,
      changePercent: 1.49,
      trend: "up",
      updatedAt: new Date().toISOString(),
      note: "Fallback benchmark used when Alpha Vantage is unavailable.",
    },
    {
      key: "dubaiProxy",
      label: "Dubai Proxy",
      source: "fallback",
      symbol: "DBLc1",
      priceUsdPerBbl: 93.2,
      priceUsdPerMt: 683.16,
      previousUsdPerBbl: 92.4,
      changeUsdPerBbl: 0.8,
      changePercent: 0.87,
      trend: "up",
      updatedAt: new Date().toISOString(),
      note: "DBLc1 is a futures proxy, not the licensed Platts physical assessment.",
    },
  ],
  quotes: [],
};

function trendText(quote: BenchmarkQuote) {
  if (quote.trend === "flat" || quote.changeUsdPerBbl == null) return "Flat vs prior close";
  const sign = quote.changeUsdPerBbl > 0 ? "+" : "";
  const percent = quote.changePercent == null ? "" : ` (${sign}${quote.changePercent.toFixed(2)}%)`;
  return `${sign}${quote.changeUsdPerBbl.toFixed(2)} USD/bbl${percent}`;
}

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
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const updated = useMemo(
    () =>
      new Date(snapshot.updatedAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [snapshot.updatedAt],
  );

  return (
    <SiteLayout>
      <section className="min-h-screen px-6 pb-16 pt-32">
        <div className="container mx-auto flex max-w-7xl flex-col gap-6">
          <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(135deg,rgba(7,30,44,0.96),rgba(8,48,64,0.78)_50%,rgba(64,48,18,0.68))] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
            <p className="mb-3 font-tech text-xs uppercase tracking-[0.26em] text-primary">Public Live Price Board</p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-display text-white md:text-5xl">REDOXY live benchmark board.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                  Public view shows live benchmark prices only. Commercial pricing logic and manual adjustments remain in the admin dashboard.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Updated</div>
                  <div className="mt-1 text-white">{updated}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Market Pulse</div>
                  <div className="mt-1 text-white">{snapshot.marketPulse}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Desk Activity</div>
                  <div className="mt-1 text-white">{snapshot.tradersOnline} traders online</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {snapshot.benchmarks.map((benchmark) => (
              <article key={benchmark.key} className="rounded-[1.75rem] border border-white/15 bg-card/70 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">{benchmark.key === "brent" ? "Brent For Crude" : "Dubai Proxy For Crude"}</p>
                    <h2 className="mt-2 text-3xl font-display text-white">${benchmark.priceUsdPerBbl.toFixed(2)}</h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                      benchmark.trend === "up"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : benchmark.trend === "down"
                          ? "bg-rose-500/15 text-rose-300"
                          : "bg-slate-500/15 text-slate-300"
                    }`}
                  >
                    {benchmark.trend}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">USD / bbl</div>
                    <div className="mt-2 text-xl text-white">${benchmark.priceUsdPerBbl.toFixed(2)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">USD / mt</div>
                    <div className="mt-2 text-xl text-white">${benchmark.priceUsdPerMt.toFixed(2)}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-300">{trendText(benchmark)}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Source: {benchmark.source} | Symbol: {benchmark.symbol}
                </p>
                {benchmark.note ? <p className="mt-2 text-xs leading-5 text-slate-500">{benchmark.note}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
