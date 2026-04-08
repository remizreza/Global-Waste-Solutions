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
  volumeMt: number;
  baseUsdMt: number;
  premiumUsdMt: number;
  freightUsdMt: number;
  logisticsUsdMt: number;
  competitiveUsdMt: number;
  targetUsdMt: number;
  defendedUsdMt: number;
  note: string;
};

type OfferAssessment = {
  status: "low" | "competitive" | "target" | "high" | "hard-to-close";
  label: string;
  detail: string;
  suggestion: string;
  colorClass: string;
};

type CalculatorRegionCard = {
  region: NegotiationRegion;
  label: string;
  incoterm: string;
  baseUsdMt: number;
  premiumUsdMt: number;
  freightUsdMt: number;
  logisticsUsdMt: number;
  competitiveUsdMt: number;
  targetUsdMt: number;
  defendedUsdMt: number;
};

type ProductStrategy = {
  family: "crude" | "distillate" | "base-oil" | "gas" | "specialty";
  benchmark: ManualInputs["benchmark"];
  strategy: string;
  quoteLabel: string;
};
type ProductFamilyTab = ProductStrategy["family"];

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
const DASHBOARD_MOTTO = "Benchmark-first pricing. Product-specific quoting. Region-ready execution.";
const PRODUCT_FAMILY_TABS: Array<{ key: ProductFamilyTab; label: string; description: string }> = [
  { key: "crude", label: "Crude", description: "Global and regional crude anchors" },
  { key: "distillate", label: "Distillates", description: "Middle-distillate and refined fuel pricing" },
  { key: "base-oil", label: "Base Oil", description: "Virgin and recycled neutral grades" },
  { key: "gas", label: "Gas", description: "Gas-linked and energy-complex checks" },
  { key: "specialty", label: "Specialty", description: "Fallback for products without a dedicated model" },
];
const PRODUCT_STRATEGIES: Record<string, ProductStrategy> = {
  "Brent Crude": {
    family: "crude",
    benchmark: "brent",
    strategy: "Use Brent as the neutral market anchor, then add destination structure and margin only where justified.",
    quoteLabel: "Crude cargo or refinery-linked offer",
  },
  "WTI Crude": {
    family: "crude",
    benchmark: "brent",
    strategy: "Treat WTI as a supporting crude indicator, but keep export-region negotiations anchored to Brent or Dubai structure.",
    quoteLabel: "Crude reference check",
  },
  "Gas Oil": {
    family: "distillate",
    benchmark: "plattsEquivalent",
    strategy: "Use middle-distillate benchmark structure and add freight, quality, and timing spreads by region.",
    quoteLabel: "Middle distillate negotiation",
  },
  "Heating Oil": {
    family: "distillate",
    benchmark: "plattsEquivalent",
    strategy: "Use distillate-linked pricing, then adjust sulfur, demand seasonality, and inland logistics.",
    quoteLabel: "Distillate swap or cargo quote",
  },
  "Natural Gas": {
    family: "gas",
    benchmark: "brent",
    strategy: "Use live gas as the reference price, but keep Brent visible for broader energy-complex direction and contract linkage.",
    quoteLabel: "Gas-linked commercial check",
  },
  "SN150 Virgin": {
    family: "base-oil",
    benchmark: "plattsEquivalent",
    strategy: "Use the refined-product structure as the feedstock floor, then add viscosity and virgin quality premium.",
    quoteLabel: "Base oil cargo offer",
  },
  "SN500 Virgin": {
    family: "base-oil",
    benchmark: "plattsEquivalent",
    strategy: "Use the feedstock floor, then widen the premium for heavier viscosity and virgin quality.",
    quoteLabel: "Heavy neutral base oil quote",
  },
  "SN150 RC": {
    family: "base-oil",
    benchmark: "plattsEquivalent",
    strategy: "Keep the same feedstock anchor, then discount for recycled-content supply and acceptance profile.",
    quoteLabel: "RC base oil quote",
  },
  "SN500 RC": {
    family: "base-oil",
    benchmark: "plattsEquivalent",
    strategy: "Use a recycled heavy-neutral model with a wider range for quality spread and batch variation.",
    quoteLabel: "RC heavy neutral quote",
  },
};
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

function formatUsd(value: number | null | undefined, digits = 2, fallback = "--") {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : fallback;
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
  const [sessionReady, setSessionReady] = useState(false);
  const [engineRefreshNonce, setEngineRefreshNonce] = useState(0);
  const [activeFamilyTab, setActiveFamilyTab] = useState<ProductFamilyTab>("crude");

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
        if (!cancelled) {
          setSessionReady(true);
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
  }, [engineRefreshNonce, inputs.volumeMt, setLocation]);

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
        const premiumUsdMt = Number(((preset.premiumLow + preset.premiumHigh) / 2).toFixed(2));
        const freightUsdMt = Number(((preset.freightLow + preset.freightHigh) / 2).toFixed(2));
        const logisticsUsdMt = Number(preset.logistics.toFixed(2));
        const competitiveUsdMt = benchmarkBaseForNegotiation + preset.premiumLow + preset.freightLow + preset.logistics;
        const defendedUsdMt = benchmarkBaseForNegotiation + preset.premiumHigh + preset.freightHigh + preset.logistics;
        const targetUsdMt = (competitiveUsdMt + defendedUsdMt) / 2;

        return {
          region,
          label: preset.label,
          incoterm: preset.incoterm,
          volumeMt: inputs.volumeMt,
          baseUsdMt: Number(benchmarkBaseForNegotiation.toFixed(2)),
          premiumUsdMt,
          freightUsdMt,
          logisticsUsdMt,
          competitiveUsdMt: Number(competitiveUsdMt.toFixed(2)),
          targetUsdMt: Number(targetUsdMt.toFixed(2)),
          defendedUsdMt: Number(defendedUsdMt.toFixed(2)),
          note: preset.note,
        };
      },
    );
  }, [benchmarkBaseForNegotiation, inputs.volumeMt]);
  const selectedRegionCard =
    marketEngine?.regionOffers.find((card) => card.region === inputs.region) ??
    regionNegotiationCards.find((card) => card.region === inputs.region) ??
    regionNegotiationCards[0];
  const regionCards = marketEngine?.regionOffers ?? regionNegotiationCards;
  const baseOilOffers = marketEngine?.baseOilOffers ?? [];
  const marketNews = marketEngine?.news ?? [];
  const sourceCatalog = marketEngine?.sourceCatalog ?? [];
  const selectedProductStrategy = PRODUCT_STRATEGIES[inputs.selectedProduct] ?? {
    family: "specialty" as const,
    benchmark: "brent" as const,
    strategy: "Use the closest live benchmark, then apply product-specific quality, logistics, and timing spreads manually.",
    quoteLabel: "Specialty product quote",
  };
  useEffect(() => {
    setActiveFamilyTab(selectedProductStrategy.family);
  }, [selectedProductStrategy.family]);
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
  const calculatorRegionCard: CalculatorRegionCard = {
    region: inputs.region,
    label: selectedRegionCard?.label ?? REGION_PRESETS[inputs.region].label,
    incoterm: selectedRegionCard?.incoterm ?? REGION_PRESETS[inputs.region].incoterm,
    baseUsdMt: Number(baseUsdMt.toFixed(2)),
    premiumUsdMt: Number(inputs.brokerPremiumUsdMt.toFixed(2)),
    freightUsdMt: Number(inputs.freightUsdMt.toFixed(2)),
    logisticsUsdMt: Number((selectedRegionCard?.logisticsUsdMt ?? REGION_PRESETS[inputs.region].logistics).toFixed(2)),
    competitiveUsdMt: Number((baseUsdMt + inputs.brokerPremiumUsdMt + inputs.freightUsdMt + (selectedRegionCard?.logisticsUsdMt ?? REGION_PRESETS[inputs.region].logistics)).toFixed(2)),
    targetUsdMt: Number((baseUsdMt + inputs.brokerPremiumUsdMt + inputs.freightUsdMt + (selectedRegionCard?.logisticsUsdMt ?? REGION_PRESETS[inputs.region].logistics) + inputs.dubaiDifferentialUsdMt + inputs.densityAdjustmentUsdMt + inputs.marginUsdMt).toFixed(2)),
    defendedUsdMt: Number((baseUsdMt + inputs.brokerPremiumUsdMt + inputs.freightUsdMt + (selectedRegionCard?.logisticsUsdMt ?? REGION_PRESETS[inputs.region].logistics) + inputs.dubaiDifferentialUsdMt + inputs.densityAdjustmentUsdMt + inputs.marginUsdMt + 12).toFixed(2)),
  };
  const offerAssessment = assessOfferPosition(offerUsdMt, selectedRegionCard);

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
      { name: "Competitive", offer: calculatorRegionCard.competitiveUsdMt },
      { name: "Target", offer: calculatorRegionCard.targetUsdMt },
      { name: "Defended", offer: calculatorRegionCard.defendedUsdMt },
      { name: "Tight Margin", offer: Number((offerUsdMt - 10).toFixed(2)) },
      { name: "Aggressive Margin", offer: Number((offerUsdMt + 15).toFixed(2)) },
    ],
    [calculatorRegionCard, offerUsdMt],
  );

  const gasOilLive = quotes.find((item) => item.product === "Gas Oil")?.price ?? 0;
  const heatingOilLive = quotes.find((item) => item.product === "Heating Oil")?.price ?? 0;
  const brentLive = quotes.find((item) => item.product === "Brent Crude")?.price ?? selectedBenchmark?.priceUsdPerMt ?? 0;
  const benchmarkInsightCards = benchmarks.map((benchmark) => ({
    ...benchmark,
    statusLabel:
      benchmark.key === "brent"
        ? "Global energy anchor"
        : benchmark.key === "dubaiProxy"
          ? "Regional crude direction"
          : "Refined product equivalent",
  }));
  const selectedBenchmarkCard = benchmarkInsightCards.find((item) => item.key === inputs.benchmark) ?? benchmarkInsightCards[0];
  const selectedQuote = quotes.find((quote) => quote.product === inputs.selectedProduct) ?? quotes[0];
  const filteredBaseOilOffers =
    selectedProductStrategy.family === "base-oil" ? baseOilOffers : baseOilOffers.slice(0, 2);
  const productWorkspaceRows = useMemo(() => {
    const liveRows = quotes.map((quote) => ({
      key: quote.product,
      label: quote.product,
      valueUsdMt: quote.price,
      source: quote.source,
      benchmark: quote.benchmark,
      family: PRODUCT_STRATEGIES[quote.product]?.family ?? "specialty",
      rawLabel: `${quote.rawPrice.toFixed(quote.rawUnit === "USD/gal" ? 4 : quote.rawUnit === "USD/MMBtu" ? 3 : 2)} ${quote.rawUnit}`,
    }));

    const baseOilRows = baseOilOffers.map((oil) => ({
      key: oil.slug,
      label: oil.label,
      valueUsdMt: oil.priceUsdMt,
      source: "Derived desk model",
      benchmark: oil.benchmark,
      family: "base-oil" as const,
      rawLabel: `Range ${oil.lowUsdMt.toFixed(2)} - ${oil.highUsdMt.toFixed(2)} USD/MT`,
    }));

    return [...liveRows, ...baseOilRows].filter((row) => row.family === activeFamilyTab);
  }, [activeFamilyTab, baseOilOffers, quotes]);

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

  if (!sessionReady && !snapshot) {
    return (
      <div className="min-h-screen bg-background px-6 pb-16 pt-20 text-foreground">
        <div className="container mx-auto max-w-3xl rounded-[28px] border border-emerald-950/35 bg-[linear-gradient(160deg,rgba(8,15,30,0.96),rgba(10,28,22,0.9)_60%,rgba(14,45,0,0.72))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.38)]">
          <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Admin Dashboard</p>
          <h1 className="mt-3 text-3xl font-display text-white">Loading pricing workbench</h1>
          <p className="mt-3 text-sm text-slate-300">Verifying session and loading live benchmarks, region bands, and news context.</p>
        </div>
      </div>
    );
  }

  const page = (
    <section className="relative min-h-screen overflow-hidden px-6 pb-16 pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(18,44,58,0.12),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(14,45,0,0.18),transparent_28%),linear-gradient(180deg,rgba(4,8,18,0.98),rgba(6,18,16,0.95)_42%,rgba(10,24,14,0.98))]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.04]" />
      <div className="pointer-events-none absolute inset-y-0 left-[8%] hidden w-px bg-white/7 lg:block" />
      <div className="pointer-events-none absolute inset-y-0 right-[8%] hidden w-px bg-white/6 lg:block" />
      <div className="container relative z-10 mx-auto max-w-7xl space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/12 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <video
            className="bg-video-smooth absolute inset-0 h-full w-full scale-[1.03] object-cover saturate-[1.08] contrast-[1.04] brightness-[0.92]"
            src="/assets/admin-yard-bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(242,135,55,0.18),transparent_24%),radial-gradient(circle_at_20%_28%,rgba(14,45,0,0.16),transparent_26%),linear-gradient(145deg,rgba(8,15,30,0.28),rgba(8,16,30,0.12)_28%,rgba(9,28,18,0.38)_58%,rgba(12,32,10,0.78))]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
          <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
          <div className="absolute inset-y-0 left-[58%] hidden w-px bg-white/10 xl:block" />
          <div className="relative z-10 p-6">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="font-tech text-xs uppercase tracking-[0.24em] text-primary">
                {shellless ? "Workbench Preview" : "Admin Market Desk"}
              </p>
              <h1 className="mt-3 text-3xl font-display text-white sm:text-4xl">
                Benchmark-first product pricing for practical negotiation work.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                {DASHBOARD_MOTTO} The desk is structured to answer three questions clearly:
                what is the market doing, what product are we pricing, and what is the defendable quote by region.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-white transition-colors hover:bg-primary/20"
                  onClick={() => setEngineRefreshNonce((value) => value + 1)}
                >
                  Refresh live market engine
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/12 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-white/25 hover:bg-white/5"
                  onClick={() =>
                    setInputs((current) => ({
                      ...current,
                      benchmark: selectedProductStrategy.benchmark,
                      useBenchmarkBase: true,
                      useManualBase: false,
                    }))
                  }
                >
                  Use recommended benchmark
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/12 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-white/25 hover:bg-white/5"
                  onClick={() => {
                    const record: ScenarioRecord = {
                      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                      createdAt: new Date().toISOString(),
                      inputs,
                      region: inputs.region,
                      targetUsdMt: calculatorRegionCard.targetUsdMt,
                      competitiveUsdMt: calculatorRegionCard.competitiveUsdMt,
                      defendedUsdMt: calculatorRegionCard.defendedUsdMt,
                      useful: false,
                      verified: false,
                    };
                    setSavedScenarios((prev) => [...prev, record].slice(-50));
                  }}
                >
                  Save quote setup
                </button>
              </div>
            </div>

            <div className="grid content-end gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <div className="rounded-2xl border border-emerald-950/35 bg-[linear-gradient(145deg,rgba(5,10,20,0.56),rgba(10,30,18,0.3))] p-4 backdrop-blur-md">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Market pulse</div>
                <div className="mt-3 text-2xl font-display text-white">{snapshot?.marketPulse ?? "--"}</div>
                <p className="mt-2 text-xs text-slate-400">Updated {updated}</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/35 bg-[linear-gradient(145deg,rgba(5,10,20,0.56),rgba(10,30,18,0.3))] p-4 backdrop-blur-md">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Active product</div>
                <div className="mt-3 text-2xl font-display text-white">{inputs.selectedProduct}</div>
                <p className="mt-2 text-xs text-slate-400">{selectedProductStrategy.quoteLabel}</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/35 bg-[linear-gradient(145deg,rgba(5,10,20,0.56),rgba(10,30,18,0.3))] p-4 backdrop-blur-md">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Selected benchmark</div>
                <div className="mt-3 text-2xl font-display text-white">
                  {selectedBenchmarkCard?.label ?? "--"}
                </div>
                <p className="mt-2 text-xs text-slate-400">{selectedProductStrategy.strategy}</p>
              </div>
              <div className="rounded-2xl border border-emerald-950/35 bg-[linear-gradient(145deg,rgba(5,10,20,0.56),rgba(10,30,18,0.3))] p-4 backdrop-blur-md">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Verified memory</div>
                <div className="mt-3 text-2xl font-display text-white">{verifiedUsefulScenarios.length}</div>
                <p className="mt-2 text-xs text-slate-400">
                  {learnedTargetUsdMt != null ? `Learned target ${learnedTargetUsdMt.toFixed(2)} / MT` : "No trusted learning points yet"}
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.94fr_1.06fr]">
          <div className="rounded-2xl border border-white/12 bg-card/65 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Market overview</p>
            <h2 className="mt-2 text-2xl font-display text-white">Live benchmark board</h2>
            <p className="mt-2 text-sm text-slate-300">
              The overview stays neutral. It shows the benchmark stack first, then every product quote is derived from one of these anchors.
            </p>
            <div className="mt-5 grid gap-3">
              {benchmarkInsightCards.map((benchmark) => (
                <button
                  key={benchmark.key}
                  type="button"
                  onClick={() => setInputs((current) => ({ ...current, benchmark: benchmark.key, useBenchmarkBase: true, useManualBase: false }))}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    inputs.benchmark === benchmark.key
                      ? "border-primary/35 bg-primary/10"
                      : "border-white/10 bg-black/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white">{benchmark.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{benchmark.statusLabel}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                      {benchmark.trend}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-6">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">USD / bbl</div>
                      <div className="mt-1 text-xl font-display text-white">${benchmark.priceUsdPerBbl.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">USD / mt</div>
                      <div className="mt-1 text-xl font-display text-white">${benchmark.priceUsdPerMt.toFixed(2)}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {benchmark.source} | {benchmark.symbol}
                    {benchmark.note ? ` | ${benchmark.note}` : ""}
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-5 h-56">
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
          </div>

          <div className="rounded-2xl border border-white/12 bg-card/65 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Product workspace</p>
            <h2 className="mt-2 text-2xl font-display text-white">Choose product, then shape the quote</h2>
            <p className="mt-2 text-sm text-slate-300">
              The workspace is product-first. Select the product you are actually pricing, then decide whether to use the benchmark, the live product quote, or a manual base.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="grid gap-2 md:grid-cols-5">
                {PRODUCT_FAMILY_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveFamilyTab(tab.key)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                      activeFamilyTab === tab.key
                        ? "border-primary/35 bg-primary/10"
                        : "border-white/10 bg-background/40 hover:border-white/20"
                    }`}
                  >
                    <div className="text-sm text-white">{tab.label}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">{tab.description}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                {productWorkspaceRows.map((row) => (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() =>
                      setInputs((current) => ({
                        ...current,
                        selectedProduct: row.label,
                        benchmark: PRODUCT_STRATEGIES[row.label]?.benchmark ?? current.benchmark,
                        useManualBase: false,
                      }))
                    }
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      inputs.selectedProduct === row.label
                        ? "border-primary/35 bg-primary/10"
                        : "border-white/10 bg-background/40 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-white">{row.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{row.benchmark}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                        {row.source}
                      </span>
                    </div>
                    <div className="mt-3 text-2xl font-display text-white">${row.valueUsdMt.toFixed(2)}</div>
                    <p className="mt-1 text-xs text-slate-500">{row.rawLabel}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
              <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Selected product strategy</div>
                    <div className="mt-2 text-2xl font-display text-white">{selectedQuote?.product ?? "--"}</div>
                    <p className="mt-2 text-sm text-slate-300">{selectedProductStrategy.strategy}</p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Mode: {selectedProductStrategy.family} | Output: {selectedProductStrategy.quoteLabel}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm text-slate-200">
                      Benchmark basis
                      <select
                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                        value={inputs.benchmark}
                        onChange={(e) => setInputs((current) => ({ ...current, benchmark: e.target.value as ManualInputs["benchmark"] }))}
                      >
                        <option value="brent">Brent</option>
                        <option value="dubaiProxy">Dubai proxy</option>
                        <option value="plattsEquivalent">Platts-equivalent</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm text-slate-200">
                      Region
                      <select
                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                        value={inputs.region}
                        onChange={(e) => setInputs((current) => ({ ...current, region: e.target.value as ManualInputs["region"] }))}
                      >
                        <option value="uae">UAE</option>
                        <option value="india">India</option>
                        <option value="ksa">KSA</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm text-slate-200">
                      Volume (MT)
                      <input
                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                        type="number"
                        min="1"
                        value={inputs.volumeMt}
                        onChange={(e) => setInputs((current) => ({ ...current, volumeMt: toInputNumber(e.target.value) || 1 }))}
                      />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-200">
                      Manual base override
                      <input
                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                        type="number"
                        value={inputs.manualBaseUsdMt}
                        onChange={(e) => setInputs((current) => ({ ...current, manualBaseUsdMt: toInputNumber(e.target.value) }))}
                      />
                    </label>
                  </div>

                  <div className="grid gap-3">
                    {[
                      ["brokerPremiumUsdMt", "Broker premium"],
                      ["freightUsdMt", "Freight"],
                      ["dubaiDifferentialUsdMt", "Benchmark differential"],
                      ["densityAdjustmentUsdMt", "Quality / density"],
                      ["marginUsdMt", "Margin"],
                    ].map(([key, label]) => (
                      <label key={key} className="grid gap-2 text-sm text-slate-200">
                        {label} (USD/MT)
                        <input
                          className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                          type="number"
                          value={inputs[key as keyof ManualInputs] as number}
                          onChange={(e) => setInputs((current) => ({ ...current, [key]: toInputNumber(e.target.value) }))}
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={inputs.useBenchmarkBase}
                        onChange={(e) => setInputs((current) => ({ ...current, useBenchmarkBase: e.target.checked }))}
                      />
                      Use selected benchmark as base
                    </label>
                    <label className="flex items-center gap-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={inputs.useManualBase}
                        onChange={(e) => setInputs((current) => ({ ...current, useManualBase: e.target.checked }))}
                      />
                      Use manual base instead
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">Competitive level</div>
                      <div className="mt-2 text-3xl font-display text-white">${formatUsd(calculatorRegionCard.competitiveUsdMt)} / MT</div>
                      <p className="mt-2 text-sm text-emerald-50">
                        Base {formatUsd(calculatorRegionCard.baseUsdMt)} + premium {formatUsd(calculatorRegionCard.premiumUsdMt)} + freight {formatUsd(calculatorRegionCard.freightUsdMt)} + logistics {formatUsd(calculatorRegionCard.logisticsUsdMt)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-amber-200">Target quote</div>
                      <div className="mt-2 text-3xl font-display text-white">${formatUsd(calculatorRegionCard.targetUsdMt)} / MT</div>
                      <p className="mt-2 text-sm text-amber-50">${offerUsdBbl.toFixed(2)} / bbl equivalent | {calculatorRegionCard.incoterm}</p>
                    </div>
                  </div>

                  <div className={`rounded-2xl border p-4 ${offerAssessment.colorClass}`}>
                    <div className="text-[11px] uppercase tracking-[0.18em]">Assessment</div>
                    <div className="mt-2 text-2xl font-display">{offerAssessment.label}</div>
                    <p className="mt-2 text-sm opacity-90">{offerAssessment.detail}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] opacity-80">{offerAssessment.suggestion}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Base input</div>
                      <div className="mt-2 text-2xl font-display text-white">${formatUsd(baseUsdMt)}</div>
                      <p className="mt-2 text-xs text-slate-500">{inputs.useManualBase ? "Manual base" : inputs.useBenchmarkBase ? selectedBenchmarkCard?.label : selectedQuote?.product}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Defended level</div>
                      <div className="mt-2 text-2xl font-display text-white">${formatUsd(calculatorRegionCard.defendedUsdMt)}</div>
                      <p className="mt-2 text-xs text-slate-500">Use only if urgency, quality, or logistics justify the spread.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Desk note</div>
                      <div className="mt-2 text-sm leading-6 text-slate-300">{selectedRegionCard?.note ?? REGION_PRESETS[inputs.region].note}</div>
                    </div>
                  </div>

                  <div className="h-60 rounded-2xl border border-white/10 bg-black/10 p-3">
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
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-2xl border border-white/12 bg-card/65 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Regional validation</p>
            <h2 className="mt-2 text-2xl font-display text-white">Closest trader bands by destination</h2>
            <p className="mt-2 text-sm text-slate-300">
              These are supporting regional guardrails. They stay separate from the quote builder so the desk can compare its working number against likely market acceptance.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {regionCards.map((card) => (
                <button
                  key={card.region}
                  type="button"
                  onClick={() => setInputs((current) => ({ ...current, region: card.region }))}
                  className={`rounded-2xl border p-5 text-left transition-colors ${
                    card.region === inputs.region
                      ? "border-primary/35 bg-primary/10"
                      : "border-white/10 bg-black/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{card.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{card.incoterm}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">Use</span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Competitive</div>
                      <div className="mt-1 text-2xl font-display text-white">${card.competitiveUsdMt.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Target</div>
                      <div className="mt-1 text-2xl font-display text-white">${card.targetUsdMt.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Defended</div>
                      <div className="mt-1 text-2xl font-display text-white">${card.defendedUsdMt.toFixed(2)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-5 h-56 rounded-2xl border border-white/10 bg-black/10 p-3">
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

          <div className="space-y-5">
            <div className="rounded-2xl border border-white/12 bg-card/65 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Base oil desk</p>
              <h2 className="mt-2 text-2xl font-display text-white">Derived base oil view</h2>
              <p className="mt-2 text-sm text-slate-300">
                Base oils stay as a distinct module. They are derived from benchmark structure, not treated as the center of the whole dashboard.
              </p>
              <div className="mt-5 grid gap-3">
                {filteredBaseOilOffers.map((oil) => (
                  <article key={oil.slug} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white">{oil.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{oil.benchmark}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">{oil.family}</span>
                    </div>
                    <div className="mt-3 text-2xl font-display text-white">${oil.priceUsdMt.toFixed(2)} / MT</div>
                    <p className="mt-1 text-sm text-slate-300">Range ${oil.lowUsdMt.toFixed(2)} - ${oil.highUsdMt.toFixed(2)}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-card/65 p-6">
              <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Saved work</p>
              <h2 className="mt-2 text-2xl font-display text-white">Verified scenario memory</h2>
              <div className="mt-4 grid gap-3">
                {savedScenarios.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-400">
                    No saved scenarios yet.
                  </div>
                ) : (
                  savedScenarios
                    .slice()
                    .reverse()
                    .slice(0, 4)
                    .map((scenario) => (
                      <article key={scenario.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className="text-white">
                          {scenario.region.toUpperCase()} | {scenario.inputs.selectedProduct} | ${scenario.targetUsdMt.toFixed(2)} / MT
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(scenario.createdAt).toLocaleString()} | benchmark {scenario.inputs.benchmark}
                        </p>
                      </article>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-2xl border border-white/12 bg-card/65 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Market context</p>
            <h2 className="mt-2 text-2xl font-display text-white">News that matters for the desk</h2>
            <p className="mt-2 text-sm text-slate-300">
              Market drivers are kept concise. The admin should not read like a media feed; it should show only enough context to support today&apos;s quote.
            </p>
            <div className="mt-5 grid gap-3">
              {marketNews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-400">
                  News feed is temporarily unavailable.
                </div>
              ) : (
                marketNews.slice(0, 4).map((item) => (
                  <a
                    key={`${item.source}-${item.link}`}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/10 bg-black/10 p-4 transition-colors hover:border-white/20"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="text-white">{item.title}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.source}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{new Date(item.publishedAt).toLocaleString()}</p>
                  </a>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-card/65 p-6">
            <p className="font-tech text-xs uppercase tracking-[0.22em] text-primary">Coverage & sources</p>
            <h2 className="mt-2 text-2xl font-display text-white">Reference stack behind the desk</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {sourceCatalog.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-black/10 p-4 transition-colors hover:border-white/20"
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
            <div className="mt-5 grid gap-3">
              {regionalProxyTable.slice(0, 3).map((row) => (
                <div key={row.product} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white">{row.product}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{row.formula}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">{row.benchmark}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    UAE ${row.uaeResult.toFixed(2)} {row.unit} | KSA ${row.ksaResult.toFixed(2)} {row.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  if (shellless) {
    return <div className="min-h-screen bg-background text-foreground">{page}</div>;
  }

  return <div className="min-h-screen bg-background text-foreground">{page}</div>;
}
