import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

const regionOfferSchema = z.object({
  region: z.enum(["uae", "india", "ksa"]),
  label: z.string(),
  incoterm: z.string(),
  volumeMt: z.number(),
  baseUsdMt: z.number(),
  premiumUsdMt: z.number(),
  freightUsdMt: z.number(),
  logisticsUsdMt: z.number(),
  competitiveUsdMt: z.number(),
  targetUsdMt: z.number(),
  defendedUsdMt: z.number(),
  note: z.string(),
});

const baseOilOfferSchema = z.object({
  slug: z.enum(["sn150-virgin", "sn500-virgin", "sn150-rc", "sn500-rc"]),
  label: z.string(),
  family: z.enum(["Virgin", "RC"]),
  grade: z.enum(["SN150", "SN500"]),
  benchmark: z.string(),
  priceUsdMt: z.number(),
  lowUsdMt: z.number(),
  highUsdMt: z.number(),
  note: z.string(),
});

const marketEngineSnapshotSchema = z.object({
  updatedAt: z.string(),
  baseReferenceUsdMt: z.number(),
  baseReferenceLabel: z.string(),
  methodology: z.string(),
  regionOffers: z.array(regionOfferSchema),
  baseOilOffers: z.array(baseOilOfferSchema),
  news: z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      source: z.string(),
      publishedAt: z.string(),
    }),
  ),
  sourceCatalog: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      mode: z.string(),
      note: z.string(),
      url: z.string(),
    }),
  ),
});

const manualInputsSchema = z.object({
  selectedProduct: z.string(),
  benchmark: z.enum(["brent", "dubaiProxy", "plattsEquivalent"]),
  region: z.enum(["uae", "india", "ksa"]),
  volumeMt: z.number(),
  manualBaseUsdMt: z.number(),
  useManualBase: z.boolean(),
  useBenchmarkBase: z.boolean(),
  dubaiDifferentialUsdMt: z.number(),
  brokerPremiumUsdMt: z.number(),
  freightUsdMt: z.number(),
  densityAdjustmentUsdMt: z.number(),
  marginUsdMt: z.number(),
});

type TraderBoardSnapshot = z.infer<typeof traderBoardSnapshotSchema>;
type ManualInputs = z.infer<typeof manualInputsSchema>;
type HistoryPoint = { time: string; Brent?: number; Dubai?: number };
type MarketEngineSnapshot = z.infer<typeof marketEngineSnapshotSchema>;
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
type NegotiationRegion = "uae" | "india" | "ksa";
type RegionNegotiationCard = {
  region: NegotiationRegion;
  label: string;
  incoterm: string;
  benchmarkBase: number;
  lowOffer: number;
  targetOffer: number;
  defendedOffer: number;
  premiumLow: number;
  premiumHigh: number;
  freightLow: number;
  freightHigh: number;
  logistics: number;
  note: string;
};

type OfferAssessment = {
  status: "low" | "competitive" | "target" | "high" | "hard-to-close";
  label: string;
  detail: string;
  suggestion: string;
  colorClass: string;
};

const plattsGasoilReference = {
  label: "Platts FOB Arab Gulf 10 ppm gasoil",
  priceUsdPerBbl: 89.1,
  priceUsdPerMt: 663.8,
  marketRangeUsdMt: "$660 - $665 / MT",
  fobOfferRangeUsdMt: "$670 - $690 / MT",
  cfrIndiaRangeUsdMt: "$700 - $740 / MT",
  note: "Locked desk reference based on the latest verified Platts-linked market equivalent. Use this as the benchmark base, then add premium and freight for deal pricing.",
};

const STORAGE_KEY = "redoxy-admin-workbench-inputs";
const SCENARIO_STORAGE_KEY = "redoxy-admin-workbench-scenarios";

const defaultInputs: ManualInputs = {
  selectedProduct: "Brent Crude",
  benchmark: "plattsEquivalent",
  region: "india",
  volumeMt: 5000,
  manualBaseUsdMt: 0,
  useManualBase: false,
  useBenchmarkBase: true,
  dubaiDifferentialUsdMt: -4,
  brokerPremiumUsdMt: 18,
  freightUsdMt: 42,
  densityAdjustmentUsdMt: 6,
  marginUsdMt: 25,
};

const TRANSACTION_CURRENCY = "USD";
const REGION_PRESETS: Record<
  NegotiationRegion,
  {
    label: string;
    incoterm: string;
    premiumLow: number;
    premiumHigh: number;
    freightLow: number;
    freightHigh: number;
    logistics: number;
    note: string;
  }
> = {
  uae: {
    label: "UAE",
    incoterm: "FOB Fujairah / UAE-delivered",
    premiumLow: 10,
    premiumHigh: 18,
    freightLow: 4,
    freightHigh: 10,
    logistics: 4,
    note: "Closest trader range for prompt UAE circulation or Fujairah-linked lifting.",
  },
  india: {
    label: "India",
    incoterm: "CFR West India",
    premiumLow: 12,
    premiumHigh: 22,
    freightLow: 26,
    freightHigh: 44,
    logistics: 8,
    note: "Most common landed negotiation range for India using Arab Gulf gasoil base plus freight and discharge costs.",
  },
  ksa: {
    label: "KSA",
    incoterm: "Delivered KSA / domestic transfer",
    premiumLow: 9,
    premiumHigh: 17,
    freightLow: 6,
    freightHigh: 14,
    logistics: 6,
    note: "Most common working range for Saudi domestic or near-export positioning with lighter freight burden.",
  },
};

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

const scenarioRecordSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  inputs: manualInputsSchema,
  region: z.enum(["uae", "india", "ksa"]),
  targetUsdMt: z.number(),
  competitiveUsdMt: z.number(),
  defendedUsdMt: z.number(),
  useful: z.boolean(),
  verified: z.boolean(),
});

type ScenarioRecord = z.infer<typeof scenarioRecordSchema>;

function getStoredScenarios(): ScenarioRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCENARIO_STORAGE_KEY);
    if (!raw) return [];
    return z.array(scenarioRecordSchema).parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

function toInputNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toUsdBbl(usdMt: number) {
  return Number((usdMt / 7.33).toFixed(2));
}

function assessOfferPosition(offerUsdMt: number, regionCard?: {
  competitiveUsdMt?: number;
  targetUsdMt?: number;
  defendedUsdMt?: number;
} | null): OfferAssessment {
  if (!regionCard?.competitiveUsdMt || !regionCard?.targetUsdMt || !regionCard?.defendedUsdMt) {
    return {
      status: "target",
      label: "Market check unavailable",
      detail: "The region engine is not available yet, so this quote cannot be ranked against the live band.",
      suggestion: "Reload the market engine and compare again.",
      colorClass: "border-white/15 bg-white/5 text-slate-100",
    };
  }

  const low = regionCard.competitiveUsdMt;
  const target = regionCard.targetUsdMt;
  const defended = regionCard.defendedUsdMt;

  if (offerUsdMt < low - 8) {
    return {
      status: "low",
      label: "Below common trader range",
      detail: `This quote is running below the current ${low.toFixed(2)} competitive market floor for the selected region.`,
      suggestion: "Check whether quality, urgency, or volume discount really supports a sub-market deal.",
      colorClass: "border-cyan-400/20 bg-cyan-500/10 text-cyan-50",
    };
  }

  if (offerUsdMt < target - 3) {
    return {
      status: "competitive",
      label: "Competitive and negotiable",
      detail: `This sits between the market floor and target band, which is usually workable for opening negotiations.`,
      suggestion: "Use this as an opening price if you want stronger buyer traction.",
      colorClass: "border-emerald-400/20 bg-emerald-500/10 text-emerald-50",
    };
  }

  if (offerUsdMt <= target + 4) {
    return {
      status: "target",
      label: "Aligned with current market target",
      detail: `This is close to the live target band of ${target.toFixed(2)} for the selected region.`,
      suggestion: "Good working level for a standard negotiation without looking overly soft or stretched.",
      colorClass: "border-primary/25 bg-primary/10 text-orange-50",
    };
  }

  if (offerUsdMt <= defended + 6) {
    return {
      status: "high",
      label: "High but still defendable",
      detail: `This is above target and moving into defended territory versus the regional band.`,
      suggestion: "Keep it only if the deal has strong quality, promptness, or logistics justification.",
      colorClass: "border-amber-400/20 bg-amber-500/10 text-amber-50",
    };
  }

  return {
    status: "hard-to-close",
    label: "Difficult to close at current market",
    detail: `This quote is materially above the defended regional band of ${defended.toFixed(2)}.`,
    suggestion: "Offer options: lower the premium, reduce margin, or quote multiple regional terms for comparison.",
    colorClass: "border-rose-400/20 bg-rose-500/10 text-rose-50",
  };
}

type AdminDashboardProps = {
  shellless?: boolean;
};

export default function AdminDashboard({ shellless = false }: AdminDashboardProps) {
  const [, setLocation] = useLocation();
  const [snapshot, setSnapshot] = useState<TraderBoardSnapshot | null>(null);
  const [marketEngine, setMarketEngine] = useState<MarketEngineSnapshot | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [inputs, setInputs] = useState<ManualInputs>(() => getStoredInputs());
  const [savedScenarios, setSavedScenarios] = useState<ScenarioRecord[]>(() => getStoredScenarios());

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

        const [dashboardResponse, marketEngineResponse] = await Promise.all([
          fetch("/api/trader-dashboard", {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
          }),
          fetch(`/api/admin/market-engine?volumeMt=${encodeURIComponent(String(inputs.volumeMt))}`, {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }),
        ]);
        if (!dashboardResponse.ok) return;
        const data = traderBoardSnapshotSchema.parse(await dashboardResponse.json());
        if (cancelled) return;
        setSnapshot(data);
        if (marketEngineResponse.ok) {
          const engine = marketEngineSnapshotSchema.parse(await marketEngineResponse.json());
          if (!cancelled) {
            setMarketEngine(engine);
          }
        }
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
  }, [inputs.volumeMt, setLocation]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    window.localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(savedScenarios.slice(-50)));
  }, [savedScenarios]);

  const benchmarks = snapshot?.benchmarks ?? [];
  const quotes = snapshot?.quotes ?? [];
  const updated = snapshot ? new Date(snapshot.updatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "--";
  const selectedBenchmark = benchmarks.find((item) => item.key === inputs.benchmark) ?? benchmarks[0];
  const selectedProduct = quotes.find((item) => item.product === inputs.selectedProduct) ?? quotes[0];
  const baseUsdMt = inputs.useManualBase
    ? inputs.manualBaseUsdMt
    : inputs.useBenchmarkBase
      ? selectedBenchmark?.priceUsdPerMt ?? selectedProduct?.price ?? 0
      : selectedProduct?.price ?? selectedBenchmark?.priceUsdPerMt ?? 0;
  const coreDealUsdMt = baseUsdMt + inputs.brokerPremiumUsdMt + inputs.freightUsdMt;
  const adjustedDealUsdMt = coreDealUsdMt + inputs.dubaiDifferentialUsdMt + inputs.densityAdjustmentUsdMt + inputs.marginUsdMt;
  const offerUsdMt = adjustedDealUsdMt;
  const offerUsdBbl = toUsdBbl(offerUsdMt);
  const benchmarkBaseForNegotiation = selectedBenchmark?.priceUsdPerMt ?? baseUsdMt;
  const regionNegotiationCards = useMemo<RegionNegotiationCard[]>(() => {
    return (Object.entries(REGION_PRESETS) as Array<[NegotiationRegion, (typeof REGION_PRESETS)[NegotiationRegion]]>).map(
      ([region, preset]) => {
        const lowOffer = benchmarkBaseForNegotiation + preset.premiumLow + preset.freightLow + preset.logistics;
        const defendedOffer = benchmarkBaseForNegotiation + preset.premiumHigh + preset.freightHigh + preset.logistics;
        const targetOffer = (lowOffer + defendedOffer) / 2;

        return {
          region,
          label: preset.label,
          incoterm: preset.incoterm,
          benchmarkBase: Number(benchmarkBaseForNegotiation.toFixed(2)),
          lowOffer: Number(lowOffer.toFixed(2)),
          targetOffer: Number(targetOffer.toFixed(2)),
          defendedOffer: Number(defendedOffer.toFixed(2)),
          premiumLow: preset.premiumLow,
          premiumHigh: preset.premiumHigh,
          freightLow: preset.freightLow,
          freightHigh: preset.freightHigh,
          logistics: preset.logistics,
          note: preset.note,
        };
      },
    );
  }, [benchmarkBaseForNegotiation]);
  const selectedRegionCard =
    marketEngine?.regionOffers.find((card) => card.region === inputs.region) ??
    regionNegotiationCards.find((card) => card.region === inputs.region) ??
    regionNegotiationCards[0];
  const regionCards = marketEngine?.regionOffers ?? regionNegotiationCards;
  const baseOilOffers = marketEngine?.baseOilOffers ?? [];
  const marketNews = marketEngine?.news ?? [];
  const sourceCatalog = marketEngine?.sourceCatalog ?? [];
  const verifiedUsefulScenarios = savedScenarios.filter((item) => item.useful && item.verified);
  const learnedTargetUsdMt =
    verifiedUsefulScenarios.length > 0
      ? Number(
          (
            verifiedUsefulScenarios.reduce((sum, item) => sum + item.targetUsdMt, 0) /
            verifiedUsefulScenarios.length
          ).toFixed(2),
        )
      : null;
  const assessedOfferUsdMt = selectedRegionCard?.targetUsdMt ?? offerUsdMt;
  const offerAssessment = assessOfferPosition(assessedOfferUsdMt, selectedRegionCard);

  const breakdownData = useMemo(
    () => [
      { name: "Base", value: Number(baseUsdMt.toFixed(2)) },
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
      { name: "Competitive", offer: selectedRegionCard ? selectedRegionCard.lowOffer : Number((offerUsdMt - 15).toFixed(2)) },
      { name: "Target", offer: selectedRegionCard ? selectedRegionCard.targetOffer : Number(offerUsdMt.toFixed(2)) },
      { name: "Defended", offer: selectedRegionCard ? selectedRegionCard.defendedOffer : Number((offerUsdMt + 15).toFixed(2)) },
      { name: "Tight Margin", offer: Number((offerUsdMt - 10).toFixed(2)) },
      { name: "Aggressive Margin", offer: Number((offerUsdMt + 15).toFixed(2)) },
    ],
    [offerUsdMt, selectedRegionCard],
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

  const page = (
      <section className="min-h-screen px-6 pb-16 pt-32">
        <div className="container mx-auto max-w-7xl space-y-6">
          <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="mb-2 font-tech text-xs uppercase tracking-[0.2em] text-primary">Admin Dashboard</p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-display text-white">{shellless ? "Negotiation workbench" : "REDOXY oil pricing desk"}</h1>
                <p className="mt-2 text-sm text-gray-300">
                  Live Brent and proxy feeds support analysis. The negotiation engine converts today&apos;s benchmark structure into region-wise offers and trader-style working ranges.
                </p>
              </div>
              <div className="text-sm text-gray-300">Updated: {updated} | Pulse: {snapshot?.marketPulse ?? "--"}</div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {benchmarks.map((benchmark) => (
              <article key={benchmark.key} className="rounded-2xl border border-white/15 bg-secondary/70 p-5">
                <p className="mb-2 font-tech text-xs uppercase tracking-[0.18em] text-primary">
                  {benchmark.key === "brent"
                    ? "Live Brent for analysis"
                    : benchmark.key === "plattsEquivalent"
                      ? "Derived Platts-equivalent base"
                      : "Dubai proxy for direction only"}
                </p>
                <p className="text-2xl font-display text-white">${benchmark.priceUsdPerBbl.toFixed(2)} / bbl</p>
                <p className="mt-1 text-sm text-gray-300">${benchmark.priceUsdPerMt.toFixed(2)} / mt</p>
                <p className="mt-3 text-sm text-gray-400">Source: {benchmark.source} | Symbol: {benchmark.symbol}</p>
              </article>
            ))}
          </div>

          <article className="rounded-2xl border border-primary/25 bg-[linear-gradient(135deg,rgba(34,13,6,0.94),rgba(10,16,34,0.9)_55%,rgba(8,34,48,0.82))] p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Locked exact reference</p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-display text-white">{plattsGasoilReference.label}</h2>
                <p className="mt-2 text-sm text-slate-300">{plattsGasoilReference.note}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">USD / bbl</div>
                  <div className="mt-1 text-white">${plattsGasoilReference.priceUsdPerBbl.toFixed(2)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">USD / mt</div>
                  <div className="mt-1 text-white">${plattsGasoilReference.priceUsdPerMt.toFixed(2)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">FOB base</div>
                  <div className="mt-1 text-white">{plattsGasoilReference.marketRangeUsdMt}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">FOB quoted</div>
                  <div className="mt-1 text-white">{plattsGasoilReference.fobOfferRangeUsdMt}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">CFR India</div>
                  <div className="mt-1 text-white">{plattsGasoilReference.cfrIndiaRangeUsdMt}</div>
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Calculator</p>
              <h2 className="mt-2 text-xl font-display text-white">Final deal calculator</h2>
              <p className="mt-2 text-sm text-slate-300">
                Core negotiation formula: <span className="text-white">Platts-linked gasoil base + premium + freight = final deal price</span>.
                Live Brent and product feeds remain visible for analysis and direction. Optional adjustments stay available below when you need a tighter commercial quote.
              </p>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-slate-200">
                    Region
                    <select className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" value={inputs.region} onChange={(e) => setInputs((v) => ({ ...v, region: e.target.value as ManualInputs["region"] }))}>
                      <option value="uae">UAE</option>
                      <option value="india">India</option>
                      <option value="ksa">KSA</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm text-slate-200">
                    Volume (MT)
                    <input className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" type="number" min="1" value={inputs.volumeMt} onChange={(e) => setInputs((v) => ({ ...v, volumeMt: toInputNumber(e.target.value) || 1 }))} />
                  </label>
                </div>
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
                    <option value="plattsEquivalent">Platts-equivalent</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-200">
                  <input type="checkbox" checked={inputs.useBenchmarkBase} onChange={(e) => setInputs((v) => ({ ...v, useBenchmarkBase: e.target.checked }))} />
                  Use selected benchmark as calculator base
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
                  <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-200">Competitive / workable</div>
                  <div className="mt-2 text-3xl font-display text-white">${selectedRegionCard?.competitiveUsdMt.toFixed(2) ?? coreDealUsdMt.toFixed(2)} / MT</div>
                  <div className="mt-1 text-sm text-emerald-100">
                    Base {selectedRegionCard?.baseUsdMt.toFixed(2) ?? baseUsdMt.toFixed(2)} + premium {selectedRegionCard?.premiumUsdMt.toFixed(2) ?? inputs.brokerPremiumUsdMt.toFixed(2)} + freight {selectedRegionCard?.freightUsdMt.toFixed(2) ?? inputs.freightUsdMt.toFixed(2)}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-50/90">
                    Transaction currency: {TRANSACTION_CURRENCY}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200">Target negotiation</div>
                  <div className="mt-2 text-3xl font-display text-white">${selectedRegionCard?.targetUsdMt.toFixed(2) ?? offerUsdMt.toFixed(2)} / MT</div>
                  <div className="mt-1 text-sm text-amber-100">${toUsdBbl(selectedRegionCard?.targetUsdMt ?? offerUsdMt).toFixed(2)} / bbl equivalent</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-50/90">
                    Transaction currency: {TRANSACTION_CURRENCY}
                  </div>
                  <div className="mt-2 text-sm text-slate-200">{selectedRegionCard?.incoterm ?? "Includes optional Dubai differential, density, and margin overlays."}</div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-300">
                Base input is currently {inputs.useManualBase ? "manual" : selectedProduct?.product ?? "market"}.
                The separate market engine uses today&apos;s benchmark stack to generate closest trader-style regional offers. Use the manual fields below only when you need to override the engine.
              </div>
              <div className={`mt-4 rounded-2xl border p-4 ${offerAssessment.colorClass}`}>
                <div className="text-[11px] uppercase tracking-[0.22em]">Live assessment</div>
                <div className="mt-2 text-2xl font-display">{offerAssessment.label}</div>
                <p className="mt-2 text-sm opacity-90">{offerAssessment.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] opacity-80">{offerAssessment.suggestion}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-white"
                  onClick={() => {
                    if (!selectedRegionCard) return;
                    const record: ScenarioRecord = {
                      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                      createdAt: new Date().toISOString(),
                      inputs,
                      region: inputs.region,
                      targetUsdMt: selectedRegionCard.targetUsdMt,
                      competitiveUsdMt: selectedRegionCard.competitiveUsdMt,
                      defendedUsdMt: selectedRegionCard.defendedUsdMt,
                      useful: false,
                      verified: false,
                    };
                    setSavedScenarios((prev) => [...prev, record].slice(-50));
                  }}
                >
                  Save scenario
                </button>
                <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
                  Verified useful scenarios: {verifiedUsefulScenarios.length}
                  {learnedTargetUsdMt != null ? ` | learned target ${learnedTargetUsdMt.toFixed(2)} / MT` : ""}
                </div>
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

          <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Verified Scenario Memory</p>
            <h2 className="mt-2 text-xl font-display text-white">Only useful and verified inputs influence later guidance</h2>
            <p className="mt-2 text-sm text-slate-300">
              Every calculator run can be saved. Only scenarios explicitly marked useful and verified are treated as trusted learning references.
            </p>
            <div className="mt-4 grid gap-3">
              {savedScenarios.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-400">
                  No saved scenarios yet.
                </div>
              ) : (
                savedScenarios
                  .slice()
                  .reverse()
                  .slice(0, 8)
                  .map((scenario) => (
                    <article key={scenario.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-white">
                            {scenario.region.toUpperCase()} | {scenario.inputs.volumeMt.toLocaleString()} MT | target ${scenario.targetUsdMt.toFixed(2)} / MT
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Saved {new Date(scenario.createdAt).toLocaleString()} | benchmark {scenario.inputs.benchmark}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${scenario.useful ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-white/10 text-slate-300"}`}
                            onClick={() =>
                              setSavedScenarios((prev) =>
                                prev.map((item) =>
                                  item.id === scenario.id ? { ...item, useful: !item.useful } : item,
                                ),
                              )
                            }
                          >
                            {scenario.useful ? "Useful" : "Mark useful"}
                          </button>
                          <button
                            type="button"
                            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${scenario.verified ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-100" : "border-white/10 text-slate-300"}`}
                            onClick={() =>
                              setSavedScenarios((prev) =>
                                prev.map((item) =>
                                  item.id === scenario.id ? { ...item, verified: !item.verified } : item,
                                ),
                              )
                            }
                          >
                            {scenario.verified ? "Verified" : "Mark verified"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
              )}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Region Negotiation Engine</p>
              <h2 className="mt-2 text-xl font-display text-white">Closest trader working offers</h2>
              <p className="mt-2 text-sm text-slate-300">
                {marketEngine?.methodology ?? "Derived region pricing uses the selected benchmark structure, volume sensitivity, and typical premium plus freight behavior."}
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {regionCards.map((card) => (
                  <article
                    key={card.region}
                    className={`rounded-2xl border p-5 ${card.region === inputs.region ? "border-primary/40 bg-primary/10" : "border-white/10 bg-black/10"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{card.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{card.incoterm}</p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-200"
                        onClick={() => setInputs((v) => ({ ...v, region: card.region }))}
                      >
                        Use
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Competitive</div>
                        <div className="text-2xl font-display text-white">${card.competitiveUsdMt.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Target</div>
                        <div className="text-2xl font-display text-white">${card.targetUsdMt.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Defended</div>
                        <div className="text-2xl font-display text-white">${card.defendedUsdMt.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs leading-6 text-slate-400">
                      Base {card.baseUsdMt.toFixed(2)} + premium {card.premiumUsdMt.toFixed(2)} + freight {card.freightUsdMt.toFixed(2)} + logistics {card.logisticsUsdMt.toFixed(2)}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">{card.note}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Base Oil Engine</p>
              <h2 className="mt-2 text-xl font-display text-white">SN150 / SN500 derived desk ranges</h2>
              <p className="mt-2 text-sm text-slate-300">
                Virgin and RC lines are derived from today&apos;s gasoil and Brent structure. They are working desk references for negotiation prep, not licensed spot assessments.
              </p>
              <div className="mt-4 grid gap-4">
                {baseOilOffers.map((oil) => (
                  <article key={oil.slug} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white">{oil.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{oil.benchmark}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">{oil.family}</span>
                    </div>
                    <div className="mt-3 text-2xl font-display text-white">${oil.priceUsdMt.toFixed(2)} / MT</div>
                    <div className="mt-1 text-sm text-slate-300">
                      Range ${oil.lowUsdMt.toFixed(2)} - ${oil.highUsdMt.toFixed(2)}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{oil.note}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Source Stack</p>
            <h2 className="mt-2 text-xl font-display text-white">Live references used by the calculator engine</h2>
            <p className="mt-2 text-sm text-slate-300">
              The engine is not limited to one or two sites. It combines live APIs, rotating energy-news feeds, and public reference sources so calculations can be checked against a wider market context without confusing references with licensed backend data.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {sourceCatalog.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-black/10 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white">{source.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{source.role}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">{source.mode}</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">{source.note}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Market Drivers</p>
            <h2 className="mt-2 text-xl font-display text-white">Same-day energy news used alongside pricing context</h2>
            <p className="mt-2 text-sm text-slate-300">
              Each pricing run pairs the regional engine with fresh oil and gas headlines from major energy publications, so negotiations can be read against the current market tone rather than price alone.
            </p>
            <div className="mt-4 grid gap-3">
              {marketNews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-400">
                  News feed is temporarily unavailable.
                </div>
              ) : (
                marketNews.slice(0, 6).map((item) => (
                  <a
                    key={`${item.source}-${item.link}`}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/10 bg-black/10 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <p className="text-white">{item.title}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.source}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{new Date(item.publishedAt).toLocaleString()}</p>
                  </a>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-card/60 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Deal Formula</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Base price input</div>
                  <div className="mt-2 text-2xl font-display text-white">${selectedRegionCard?.baseUsdMt.toFixed(2) ?? baseUsdMt.toFixed(2)}</div>
                  <p className="mt-2 text-xs text-slate-500">The engine uses {marketEngine?.baseReferenceLabel ?? "the selected benchmark"} as the core reference before regional premium, freight, and logistics are applied.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Broker Quote</div>
                  <div className="mt-2 text-2xl font-display text-white">${selectedRegionCard?.premiumUsdMt.toFixed(2) ?? inputs.brokerPremiumUsdMt.toFixed(2)}</div>
                  <p className="mt-2 text-xs text-slate-500">Prompt market spread or negotiated premium/discount.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Freight</div>
                  <div className="mt-2 text-2xl font-display text-white">${selectedRegionCard?.freightUsdMt.toFixed(2) ?? inputs.freightUsdMt.toFixed(2)}</div>
                  <p className="mt-2 text-xs text-slate-500">Shipping, inland, or prompt logistics cost used in the deal.</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-white">
                <span className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Formula</span>
                <div className="mt-2 text-lg">Base Price + Broker Quote + Freight + Logistics = <span className="font-display">${selectedRegionCard?.targetUsdMt.toFixed(2) ?? coreDealUsdMt.toFixed(2)} / MT</span></div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-200">
                  Transaction currency: {TRANSACTION_CURRENCY}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Low / aggressive</div>
                  <div className="mt-2 text-2xl font-display text-white">${selectedRegionCard?.competitiveUsdMt.toFixed(2) ?? "--"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Target / common</div>
                  <div className="mt-2 text-2xl font-display text-white">${selectedRegionCard?.targetUsdMt.toFixed(2) ?? "--"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">High / defended</div>
                  <div className="mt-2 text-2xl font-display text-white">${selectedRegionCard?.defendedUsdMt.toFixed(2) ?? "--"}</div>
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
  );

  if (shellless) {
    return <div className="min-h-screen bg-background text-foreground">{page}</div>;
  }

  return <div className="min-h-screen bg-background text-foreground">{page}</div>;
}
