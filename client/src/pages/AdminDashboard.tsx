import SiteLayout from "@/components/SiteLayout";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

const traderQuoteSchema = z.object({
  product: z.string(),
  price: z.number(),
  rawPrice: z.number(),
  rawUnit: z.enum(["USD/bbl", "USD/gal", "USD/MMBtu", "USD/mt"]),
  trend: z.enum(["up", "down", "flat"]),
  updatedAt: z.string(),
  unit: z.enum(["USD/mt", "USD/mt eq"]),
  source: z.string(),
  benchmark: z.string(),
  note: z.string().optional(),
});

const forecastSchema = z.object({
  date: z.string(),
  benchmark: z.string(),
  benchmarkUsdMt: z.number(),
  expectedOfferUsdMt: z.number(),
  confidence: z.enum(["low", "medium"]),
});

const traderBoardSnapshotSchema = z.object({
  updatedAt: z.string(),
  tradersOnline: z.number(),
  marketPulse: z.enum(["Bullish", "Bearish", "Neutral"]),
  benchmarkMode: z.literal("benchmark-driven"),
  benchmarks: z.array(benchmarkQuoteSchema),
  quotes: z.array(traderQuoteSchema),
  forecasts: z.array(forecastSchema),
});

const manualInputsSchema = z.object({
  selectedProduct: z.string(),
  benchmark: z.enum(["brent", "dubaiProxy"]),
  manualBaseUsdMt: z.number(),
  useManualBase: z.boolean(),
  dubaiDifferentialUsdMt: z.number(),
  brokerPremiumUsdMt: z.number(),
  freightUsdMt: z.number(),
  densityAdjustmentUsdMt: z.number(),
  marginUsdMt: z.number(),
});

type TraderBoardSnapshot = z.infer<typeof traderBoardSnapshotSchema>;
type ManualInputs = z.infer<typeof manualInputsSchema>;
type HistoryPoint = { time: string; Brent?: number; Dubai?: number };
type RegionalProxyRow = {
  product: string;
  benchmark: string;
  formula: string;
  uaeParameter: number;
  ksaParameter: number;
  uaeResult: number;
  ksaResult: number;
  unit: string;
};

const STORAGE_KEY = "redoxy-admin-workbench-inputs";

const defaultInputs: ManualInputs = {
  selectedProduct: "Brent Crude",
  benchmark: "brent",
  manualBaseUsdMt: 0,
  useManualBase: false,
  dubaiDifferentialUsdMt: -4,
  brokerPremiumUsdMt: 18,
  freightUsdMt: 42,
  densityAdjustmentUsdMt: 6,
  marginUsdMt: 25,
};

const TRANSACTION_CURRENCY = "USD";

function getStoredInputs(): ManualInputs {
  if (typeof window === "undefined") return defaultInputs;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultInputs;
    return manualInputsSchema.parse(JSON.parse(raw));
  } catch {
    return defaultInputs;
  }
}

function toInputNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toUsdBbl(usdMt: number) {
  return Number((usdMt / 7.33).toFixed(2));
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [snapshot, setSnapshot] = useState<TraderBoardSnapshot | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [inputs, setInputs] = useState<ManualInputs>(() => getStoredInputs());

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
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        if (!session.ok) {
          localStorage.removeItem("admin_token");
          setLocation("/admin/login");
          return;
        }

        const response = await fetch("/api/trader-dashboard", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        if (!response.ok) return;
        const data = traderBoardSnapshotSchema.parse(await response.json());
        if (cancelled) return;
        setSnapshot(data);
        const brent = data.benchmarks.find((item) => item.key === "brent");
        const dubai = data.benchmarks.find((item) => item.key === "dubaiProxy");
        setHistory((prev) => [...prev.slice(-35), { time: new Date(data.updatedAt).toLocaleTimeString(), Brent: brent?.priceUsdPerBbl, Dubai: dubai?.priceUsdPerBbl }]);
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setLocation]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const benchmarks = snapshot?.benchmarks ?? [];
  const quotes = snapshot?.quotes ?? [];
  const updated = snapshot ? new Date(snapshot.updatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "--";
  const selectedBenchmark = benchmarks.find((item) => item.key === inputs.benchmark) ?? benchmarks[0];
  const selectedProduct = quotes.find((item) => item.product === inputs.selectedProduct) ?? quotes[0];
  const baseUsdMt = inputs.useManualBase ? inputs.manualBaseUsdMt : selectedProduct?.price ?? selectedBenchmark?.priceUsdPerMt ?? 0;
  const coreDealUsdMt = baseUsdMt + inputs.brokerPremiumUsdMt + inputs.freightUsdMt;
  const adjustedDealUsdMt = coreDealUsdMt + inputs.dubaiDifferentialUsdMt + inputs.densityAdjustmentUsdMt + inputs.marginUsdMt;
  const offerUsdMt = adjustedDealUsdMt;
  const offerUsdBbl = toUsdBbl(offerUsdMt);

  const breakdownData = useMemo(
    () => [
      { name: "Live Price", value: Number(baseUsdMt.toFixed(2)) },
      { name: "Broker", value: Number(inputs.brokerPremiumUsdMt.toFixed(2)) },
      { name: "Freight", value: Number(inputs.freightUsdMt.toFixed(2)) },
      { name: "Dubai Diff", value: Number(inputs.dubaiDifferentialUsdMt.toFixed(2)) },
      { name: "Density", value: Number(inputs.densityAdjustmentUsdMt.toFixed(2)) },
      { name: "Margin", value: Number(inputs.marginUsdMt.toFixed(2)) },
    ],
    [baseUsdMt, inputs],
  );

  const variationData = useMemo(
    () => [
      { name: "Low Freight", offer: Number((offerUsdMt - 15).toFixed(2)) },
      { name: "Base", offer: Number(offerUsdMt.toFixed(2)) },
      { name: "High Freight", offer: Number((offerUsdMt + 15).toFixed(2)) },
      { name: "Tight Margin", offer: Number((offerUsdMt - 10).toFixed(2)) },
      { name: "Aggressive Margin", offer: Number((offerUsdMt + 15).toFixed(2)) },
    ],
    [offerUsdMt],
  );

  const gasOilLive = quotes.find((item) => item.product === "Gas Oil")?.price ?? 0;
  const heatingOilLive = quotes.find((item) => item.product === "Heating Oil")?.price ?? 0;
  const brentLive = quotes.find((item) => item.product === "Brent Crude")?.price ?? selectedBenchmark?.priceUsdPerMt ?? 0;

  const regionalProxyTable = useMemo<RegionalProxyRow[]>(
    () => [
      {
        product: "Diesel",
        benchmark: "Gas Oil",
        formula: "Gas Oil + diesel premium",
        uaeParameter: 22,
        ksaParameter: 28,
        uaeResult: Number((gasOilLive + 22).toFixed(2)),
        ksaResult: Number((gasOilLive + 28).toFixed(2)),
        unit: "USD/MT",
      },
      {
        product: "Kerosene",
        benchmark: "Heating Oil",
        formula: "Heating Oil + kerosene differential",
        uaeParameter: 6,
        ksaParameter: 10,
        uaeResult: Number((heatingOilLive + 6).toFixed(2)),
        ksaResult: Number((heatingOilLive + 10).toFixed(2)),
        unit: "USD/MT",
      },
      {
        product: "Naphtha",
        benchmark: "Brent",
        formula: "Brent x naphtha factor",
        uaeParameter: 0.84,
        ksaParameter: 0.82,
        uaeResult: Number((brentLive * 0.84).toFixed(2)),
        ksaResult: Number((brentLive * 0.82).toFixed(2)),
        unit: "USD/MT",
      },
      {
        product: "Recovery Oil (Black)",
        benchmark: "Brent",
        formula: "Brent x discount factor",
        uaeParameter: 0.63,
        ksaParameter: 0.59,
        uaeResult: Number((brentLive * 0.63).toFixed(2)),
        ksaResult: Number((brentLive * 0.59).toFixed(2)),
        unit: "USD/MT",
      },
    ],
    [gasOilLive, heatingOilLive, brentLive],
  );

  return (
    <SiteLayout>
      <section className="min-h-screen px-6 pb-16 pt-32">
        <div className="container mx-auto max-w-7xl space-y-6">
          <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="mb-2 font-tech text-xs uppercase tracking-[0.2em] text-primary">Admin Dashboard</p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-display text-white">REDOXY oil pricing desk</h1>
                <p className="mt-2 text-sm text-gray-300">Advanced tools stay here. Public dashboard shows prices only.</p>
              </div>
              <div className="text-sm text-gray-300">Updated: {updated} | Pulse: {snapshot?.marketPulse ?? "--"}</div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {benchmarks.map((benchmark) => (
              <article key={benchmark.key} className="rounded-2xl border border-white/15 bg-secondary/70 p-5">
                <p className="mb-2 font-tech text-xs uppercase tracking-[0.18em] text-primary">{benchmark.label === "Brent Benchmark" ? "Brent for Crude" : "Dubai Proxy for Crude"}</p>
                <p className="text-2xl font-display text-white">${benchmark.priceUsdPerBbl.toFixed(2)} / bbl</p>
                <p className="mt-1 text-sm text-gray-300">${benchmark.priceUsdPerMt.toFixed(2)} / mt</p>
                <p className="mt-3 text-sm text-gray-400">Source: {benchmark.source} | Symbol: {benchmark.symbol}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Calculator</p>
              <h2 className="mt-2 text-xl font-display text-white">Final deal calculator</h2>
              <p className="mt-2 text-sm text-slate-300">
                Core formula: <span className="text-white">live benchmark/product price (IG + API) + broker quote + freight = final deal price</span>.
                Optional adjustments stay available below when you need a tighter commercial quote.
              </p>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2 text-sm text-slate-200">
                  Product
                  <select className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" value={inputs.selectedProduct} onChange={(e) => setInputs((v) => ({ ...v, selectedProduct: e.target.value }))}>
                    {quotes.map((quote) => <option key={quote.product} value={quote.product}>{quote.product}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Benchmark
                  <select className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" value={inputs.benchmark} onChange={(e) => setInputs((v) => ({ ...v, benchmark: e.target.value as ManualInputs["benchmark"] }))}>
                    <option value="brent">Brent</option>
                    <option value="dubaiProxy">Dubai proxy</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input type="checkbox" checked={inputs.useManualBase} onChange={(e) => setInputs((v) => ({ ...v, useManualBase: e.target.checked }))} />
                  Use manual base price instead of live selected product
                </label>
                {inputs.useManualBase ? (
                  <label className="grid gap-2 text-sm text-slate-200">
                    Manual base USD/MT
                    <input className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" type="number" value={inputs.manualBaseUsdMt} onChange={(e) => setInputs((v) => ({ ...v, manualBaseUsdMt: toInputNumber(e.target.value) }))} />
                  </label>
                ) : null}
                {[
                  ["brokerPremiumUsdMt", "Broker premium"],
                  ["freightUsdMt", "Freight"],
                  ["dubaiDifferentialUsdMt", "Dubai differential"],
                  ["densityAdjustmentUsdMt", "Density adjustment"],
                  ["marginUsdMt", "Margin"],
                ].map(([key, label]) => (
                  <label key={key} className="grid gap-2 text-sm text-slate-200">
                    {label} (USD/MT)
                    <input className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" type="number" value={inputs[key as keyof ManualInputs] as number} onChange={(e) => setInputs((v) => ({ ...v, [key]: toInputNumber(e.target.value) }))} />
                  </label>
                ))}
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-200">Final deal price</div>
                  <div className="mt-2 text-3xl font-display text-white">${coreDealUsdMt.toFixed(2)} / MT</div>
                  <div className="mt-1 text-sm text-emerald-100">
                    {baseUsdMt.toFixed(2)} + {inputs.brokerPremiumUsdMt.toFixed(2)} + {inputs.freightUsdMt.toFixed(2)}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-50/90">
                    Transaction currency: {TRANSACTION_CURRENCY}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200">Adjusted offer</div>
                  <div className="mt-2 text-3xl font-display text-white">${offerUsdMt.toFixed(2)} / MT</div>
                  <div className="mt-1 text-sm text-amber-100">${offerUsdBbl.toFixed(2)} / bbl equivalent</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-50/90">
                    Transaction currency: {TRANSACTION_CURRENCY}
                  </div>
                  <div className="mt-2 text-sm text-slate-200">Includes optional Dubai differential, density, and margin overlays.</div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-300">
                Based on current {selectedProduct?.product ?? "market"} data, broker quote, and freight. Use the adjusted figure only when the deal needs extra commercial overlays.
              </div>
              <a href="/admin-pricing-guide.md" target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-primary underline">
                Open pricing guide and worked examples
              </a>
            </div>

            <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Forecasts And History</p>
              <h2 className="mt-2 text-xl font-display text-white">Live trend and next 5 days</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" hide />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="Brent" stroke="#f59e0b" dot={false} />
                    <Line type="monotone" dataKey="Dubai" stroke="#22d3ee" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={snapshot?.forecasts ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Area type="monotone" dataKey="benchmarkUsdMt" stroke="#38bdf8" fill="#0ea5e9" fillOpacity={0.22} />
                    <Area type="monotone" dataKey="expectedOfferUsdMt" stroke="#f97316" fill="#f97316" fillOpacity={0.18} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Deal Formula</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Live Benchmark/Product Price</div>
                  <div className="mt-2 text-2xl font-display text-white">${baseUsdMt.toFixed(2)}</div>
                  <p className="mt-2 text-xs text-slate-500">Selected live benchmark/product from IG plus configured benchmark APIs.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Broker Quote</div>
                  <div className="mt-2 text-2xl font-display text-white">${inputs.brokerPremiumUsdMt.toFixed(2)}</div>
                  <p className="mt-2 text-xs text-slate-500">Prompt market spread or negotiated premium/discount.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Freight</div>
                  <div className="mt-2 text-2xl font-display text-white">${inputs.freightUsdMt.toFixed(2)}</div>
                  <p className="mt-2 text-xs text-slate-500">Shipping, inland, or prompt logistics cost used in the deal.</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-white">
                <span className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Formula</span>
                <div className="mt-2 text-lg">Live Price + Broker Quote + Freight = <span className="font-display">${coreDealUsdMt.toFixed(2)} / MT</span></div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-200">
                  Transaction currency: {TRANSACTION_CURRENCY}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Offer Breakdown</p>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Variations</p>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={variationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="offer" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">UAE And KSA Proxy Table</p>
            <h2 className="mt-2 text-xl font-display text-white">Derived pricing references</h2>
            <p className="mt-2 text-sm text-slate-300">
              Premiums and factors below are working desk assumptions. UAE uses slightly stronger middle-distillate and black-oil realizations around Fujairah and prompt export corridors. KSA uses slightly wider inland/export adjustments.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[860px] border-separate border-spacing-y-3 text-sm text-slate-300">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-3">Product</th>
                    <th className="px-3">Benchmark</th>
                    <th className="px-3">Formula</th>
                    <th className="px-3">UAE Factor/Premium</th>
                    <th className="px-3">UAE Result</th>
                    <th className="px-3">KSA Factor/Premium</th>
                    <th className="px-3">KSA Result</th>
                  </tr>
                </thead>
                <tbody>
                  {regionalProxyTable.map((row) => (
                    <tr key={row.product} className="rounded-2xl bg-black/10">
                      <td className="px-3 py-3 font-medium text-white">{row.product}</td>
                      <td className="px-3 py-3">{row.benchmark}</td>
                      <td className="px-3 py-3">{row.formula}</td>
                      <td className="px-3 py-3">{row.uaeParameter}</td>
                      <td className="px-3 py-3 text-white">${row.uaeResult.toFixed(2)} {row.unit}</td>
                      <td className="px-3 py-3">{row.ksaParameter}</td>
                      <td className="px-3 py-3 text-white">${row.ksaResult.toFixed(2)} {row.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-300">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">How premiums are derived</div>
                <p className="mt-2">Diesel and kerosene premiums are added over the nearest live middle-distillate proxy because logistics, sulfur/spec, and regional promptness usually price as a spread over gasoil or heating oil, not directly over crude.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-300">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">How factors are derived</div>
                <p className="mt-2">Naphtha and recovery oil factors are crude-linked yield/value assumptions. Naphtha is usually a light-end fraction below Brent on a per-ton basis. Recovery black oil trades at a deeper discount because of quality, handling, and downstream recovery limits.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-secondary/70 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Market Coverage</p>
            <h2 className="mt-2 text-xl font-display text-white">All available oil and energy prices</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quotes.map((quote) => (
                <article key={quote.product} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{quote.product}</p>
                      <p className="mt-1 text-xs text-slate-400">{quote.benchmark}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">{quote.source}</span>
                  </div>
                  <p className="mt-3 text-2xl font-display text-white">${quote.price.toFixed(2)}</p>
                  <p className="text-sm text-slate-300">{quote.unit} | raw {quote.rawPrice.toFixed(quote.rawUnit === "USD/gal" ? 4 : quote.rawUnit === "USD/MMBtu" ? 3 : 2)} {quote.rawUnit}</p>
                  {quote.note ? <p className="mt-2 text-xs leading-5 text-slate-500">{quote.note}</p> : null}
                </article>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">Direct live inputs come from configured IG markets and benchmark APIs when available. Dubai/Platts-linked and refinery-specific gaps fall back to clearly marked proxy or derived estimates instead of empty tiles.</p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
