import SiteLayout from "@/components/SiteLayout";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const benchmarkQuoteSchema = z.object({
  key: z.enum(["brent", "dubaiProxy", "plattsEquivalent"]),
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

const plattsGasoilReference = {
  label: "Platts FOB Arab Gulf 10 ppm gasoil",
  priceUsdPerBbl: 89.1,
  priceUsdPerMt: 663.8,
  marketRangeUsdMt: "$660 - $665 / MT",
  fobOfferRangeUsdMt: "$670 - $690 / MT",
  cfrIndiaRangeUsdMt: "$700 - $740 / MT",
  source: "Platts-linked futures proxy",
  note: "Market equivalent reference based on a live-linked MOPAG proxy. This is the benchmark base, not the final deal price.",
};

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
  const brentBenchmark = snapshot.benchmarks.find((item) => item.key === "brent") ?? snapshot.benchmarks[0];
  const publicBenchmarks = snapshot.benchmarks.filter((item) => item.key === "brent" || item.key === "plattsEquivalent");
  const negotiationExample = useMemo(() => {
    const premium = 18;
    const freight = 32;
    const logistics = 8;
    const fobOffer = plattsGasoilReference.priceUsdPerMt + premium;
    const cfrOffer = fobOffer + freight + logistics;

    return {
      premium,
      freight,
      logistics,
      fobOffer: Number(fobOffer.toFixed(2)),
      cfrOffer: Number(cfrOffer.toFixed(2)),
    };
  }, []);

  return (
    <SiteLayout>
      <section className="relative min-h-screen overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,42,58,0.16),transparent_34%),linear-gradient(180deg,rgba(4,8,18,0.98),rgba(5,10,22,0.94)_42%,rgba(10,14,24,0.98))]" />
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.035]" />
        <div className="pointer-events-none absolute inset-y-0 left-[8%] hidden w-px bg-white/8 lg:block" />
        <div className="pointer-events-none absolute inset-y-0 right-[8%] hidden w-px bg-white/6 lg:block" />
        <div className="container relative z-10 mx-auto flex max-w-7xl flex-col gap-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
            <video
              className="bg-video-smooth absolute inset-0 h-full w-full scale-[1.03] object-cover saturate-[1.08] contrast-[1.04] brightness-[0.92]"
              src="/assets/admin-yard-bg.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(242,135,55,0.22),transparent_24%),radial-gradient(circle_at_18%_32%,rgba(66,123,255,0.16),transparent_26%),linear-gradient(112deg,rgba(5,12,22,0.3),rgba(6,13,24,0.12)_28%,rgba(6,14,24,0.44)_56%,rgba(7,14,24,0.78)_82%,rgba(8,16,28,0.9))]" />
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.045]" />
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
            <div className="absolute inset-y-0 left-[42%] hidden w-px bg-white/10 xl:block" />
            <div className="relative z-10 p-7">
              <div className="max-w-3xl">
                <p className="mb-3 font-tech text-xs uppercase tracking-[0.26em] text-primary">Public Live Price Board</p>
                <h1 className="text-3xl font-display text-white md:text-5xl">REDOXY live benchmark board.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                  Public view shows live benchmark direction plus one locked Platts-linked gasoil reference. Use Brent for market direction and the Platts-linked base for actual middle-distillate negotiation.
                </p>
              </div>
              <div className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(5,10,20,0.6),rgba(10,20,32,0.34))] px-4 py-3 backdrop-blur-md">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Updated</div>
                  <div className="mt-1 text-white">{updated}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(5,10,20,0.6),rgba(10,20,32,0.34))] px-4 py-3 backdrop-blur-md">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Market Pulse</div>
                  <div className="mt-1 text-white">{snapshot.marketPulse}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(5,10,20,0.6),rgba(10,20,32,0.34))] px-4 py-3 backdrop-blur-md">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Desk Activity</div>
                  <div className="mt-1 text-white">{snapshot.tradersOnline} traders online</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {publicBenchmarks.map((benchmark) => (
              <article key={benchmark.key} className="rounded-[1.75rem] border border-white/15 bg-card/70 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">
                      {benchmark.key === "brent" ? "Live Brent Benchmark" : "Platts-Equivalent Negotiation Base"}
                    </p>
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

          <article className="rounded-[1.85rem] border border-primary/25 bg-[linear-gradient(135deg,rgba(34,13,6,0.92),rgba(10,16,34,0.9)_55%,rgba(8,34,48,0.82))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="font-tech text-xs uppercase tracking-[0.24em] text-primary">Exact Pricing Reference</p>
                <h2 className="mt-2 text-2xl font-display text-white md:text-3xl">{plattsGasoilReference.label}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-200">{plattsGasoilReference.note}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-200">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Source</div>
                <div className="mt-1 text-white">{plattsGasoilReference.source}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">USD / bbl</div>
                <div className="mt-2 text-2xl font-display text-white">${plattsGasoilReference.priceUsdPerBbl.toFixed(2)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">USD / mt</div>
                <div className="mt-2 text-2xl font-display text-white">${plattsGasoilReference.priceUsdPerMt.toFixed(2)}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">FOB market base</div>
                <div className="mt-2 text-xl text-white">{plattsGasoilReference.marketRangeUsdMt}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">FOB deal range</div>
                <div className="mt-2 text-xl text-white">{plattsGasoilReference.fobOfferRangeUsdMt}</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">CFR India working range</div>
              <div className="mt-2 text-xl text-white">{plattsGasoilReference.cfrIndiaRangeUsdMt}</div>
            </div>
          </article>

          <article className="rounded-[1.85rem] border border-white/15 bg-card/70 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.24em] text-primary">Negotiation Formula</p>
            <div className="mt-3 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-2xl font-display text-white">Real-time deal price structure</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Use Brent for macro direction and use the Platts-linked gasoil benchmark as the actual middle-distillate base for negotiation.
                </p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Formula</div>
                  <div className="mt-2 text-lg text-white">
                    Final deal = Platts 10 ppm gasoil + premium + freight + logistics/spec adjustment
                  </div>
                  <div className="mt-3 text-sm text-slate-300">
                    Today’s Brent benchmark: <span className="text-white">${brentBenchmark.priceUsdPerBbl.toFixed(2)} / bbl</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    Today’s Platts-linked gasoil: <span className="text-white">${plattsGasoilReference.priceUsdPerMt.toFixed(2)} / MT</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Worked example</div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div>Base Platts-linked gasoil: <span className="text-white">${plattsGasoilReference.priceUsdPerMt.toFixed(2)}</span></div>
                  <div>Premium: <span className="text-white">+${negotiationExample.premium.toFixed(2)}</span></div>
                  <div>FOB offer: <span className="text-white">${negotiationExample.fobOffer.toFixed(2)} / MT</span></div>
                  <div>Freight: <span className="text-white">+${negotiationExample.freight.toFixed(2)}</span></div>
                  <div>Logistics/spec: <span className="text-white">+${negotiationExample.logistics.toFixed(2)}</span></div>
                  <div className="border-t border-white/10 pt-2 text-base">
                    CFR negotiation level: <span className="font-semibold text-white">${negotiationExample.cfrOffer.toFixed(2)} / MT</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </SiteLayout>
  );
}
