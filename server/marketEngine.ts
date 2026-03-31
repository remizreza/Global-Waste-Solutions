export type MarketBenchmark = {
  key: "brent" | "dubaiProxy" | "plattsEquivalent";
  label: string;
  source: string;
  symbol: string;
  priceUsdPerBbl: number;
  priceUsdPerMt: number;
  updatedAt: string;
  note?: string;
};

export type MarketQuote = {
  product: string;
  price: number;
  rawPrice: number;
  rawUnit: "USD/bbl" | "USD/gal" | "USD/MMBtu" | "USD/mt";
  updatedAt: string;
  unit: "USD/mt" | "USD/mt eq";
  source: string;
  benchmark: string;
  note?: string;
};

export type MarketRegion = "uae" | "india" | "ksa";

export type RegionOffer = {
  region: MarketRegion;
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

export type BaseOilOffer = {
  slug: "sn150-virgin" | "sn500-virgin" | "sn150-rc" | "sn500-rc";
  label: string;
  family: "Virgin" | "RC";
  grade: "SN150" | "SN500";
  benchmark: string;
  priceUsdMt: number;
  lowUsdMt: number;
  highUsdMt: number;
  note: string;
};

export type MarketEngineSnapshot = {
  updatedAt: string;
  baseReferenceUsdMt: number;
  baseReferenceLabel: string;
  methodology: string;
  regionOffers: RegionOffer[];
  baseOilOffers: BaseOilOffer[];
};

const REGION_PRESETS: Record<
  MarketRegion,
  {
    label: string;
    incoterm: string;
    premium: number;
    freight: number;
    logistics: number;
    note: string;
  }
> = {
  uae: {
    label: "UAE",
    incoterm: "FOB Fujairah / UAE-delivered",
    premium: 14,
    freight: 7,
    logistics: 4,
    note: "Prompt UAE desk range using Arab Gulf gasoil base with lighter freight and terminal handling.",
  },
  india: {
    label: "India",
    incoterm: "CFR West India",
    premium: 18,
    freight: 35,
    logistics: 8,
    note: "Most common landed trader range for India using Arab Gulf base plus freight, discharge, and port handling.",
  },
  ksa: {
    label: "KSA",
    incoterm: "Delivered KSA / domestic transfer",
    premium: 13,
    freight: 10,
    logistics: 6,
    note: "Most common Saudi positioning range for domestic transfer or nearby lifting with moderate logistics overhead.",
  },
};

function round(value: number) {
  return Number(value.toFixed(2));
}

function getVolumeAdjustment(volumeMt: number) {
  if (volumeMt >= 20000) return -5;
  if (volumeMt >= 10000) return -3;
  if (volumeMt >= 5000) return -1;
  if (volumeMt <= 1000) return 3;
  return 0;
}

export function createMarketEngineSnapshot(input: {
  benchmarks: MarketBenchmark[];
  quotes: MarketQuote[];
  updatedAt: string;
  volumeMt?: number;
}): MarketEngineSnapshot {
  const plattsEquivalent =
    input.benchmarks.find((item) => item.key === "plattsEquivalent") ??
    input.benchmarks.find((item) => item.key === "dubaiProxy") ??
    input.benchmarks[0];
  const gasOil = input.quotes.find((item) => item.product === "Gas Oil");
  const brent = input.benchmarks.find((item) => item.key === "brent") ?? input.benchmarks[0];
  const volumeMt = input.volumeMt ?? 5000;
  const volumeAdjustment = getVolumeAdjustment(volumeMt);
  const baseReferenceUsdMt = plattsEquivalent?.priceUsdPerMt ?? gasOil?.price ?? 0;

  const regionOffers: RegionOffer[] = (Object.entries(REGION_PRESETS) as Array<
    [MarketRegion, (typeof REGION_PRESETS)[MarketRegion]]
  >).map(([region, preset]) => {
    const premiumUsdMt = preset.premium + volumeAdjustment;
    const freightUsdMt = Math.max(0, preset.freight + volumeAdjustment * 0.5);
    const logisticsUsdMt = preset.logistics;
    const competitiveUsdMt = baseReferenceUsdMt + premiumUsdMt + freightUsdMt + logisticsUsdMt;
    const targetUsdMt = competitiveUsdMt + 7;
    const defendedUsdMt = targetUsdMt + 11;

    return {
      region,
      label: preset.label,
      incoterm: preset.incoterm,
      volumeMt,
      baseUsdMt: round(baseReferenceUsdMt),
      premiumUsdMt: round(premiumUsdMt),
      freightUsdMt: round(freightUsdMt),
      logisticsUsdMt: round(logisticsUsdMt),
      competitiveUsdMt: round(competitiveUsdMt),
      targetUsdMt: round(targetUsdMt),
      defendedUsdMt: round(defendedUsdMt),
      note: preset.note,
    };
  });

  const gasOilBase = gasOil?.price ?? baseReferenceUsdMt;
  const brentSupport = (brent?.priceUsdPerMt ?? gasOilBase) * 0.08;

  const baseOilOffers: BaseOilOffer[] = [
    {
      slug: "sn150-virgin",
      label: "SN150 Virgin",
      family: "Virgin",
      grade: "SN150",
      benchmark: "Gasoil + virgin light-neutral premium",
      priceUsdMt: round(gasOilBase + 96 + brentSupport),
      lowUsdMt: round(gasOilBase + 82 + brentSupport),
      highUsdMt: round(gasOilBase + 122 + brentSupport),
      note: "Derived light-neutral base oil range using live gasoil structure plus virgin premium support.",
    },
    {
      slug: "sn500-virgin",
      label: "SN500 Virgin",
      family: "Virgin",
      grade: "SN500",
      benchmark: "Gasoil + heavy-neutral premium",
      priceUsdMt: round(gasOilBase + 142 + brentSupport),
      lowUsdMt: round(gasOilBase + 126 + brentSupport),
      highUsdMt: round(gasOilBase + 176 + brentSupport),
      note: "Derived heavy-neutral base oil range using live gasoil structure plus heavier viscosity premium.",
    },
    {
      slug: "sn150-rc",
      label: "SN150 RC",
      family: "RC",
      grade: "SN150",
      benchmark: "Virgin SN150 less recycled discount",
      priceUsdMt: round(gasOilBase + 34 + brentSupport),
      lowUsdMt: round(gasOilBase + 18 + brentSupport),
      highUsdMt: round(gasOilBase + 58 + brentSupport),
      note: "Derived recycled-content SN150 working range using virgin differential discount assumptions.",
    },
    {
      slug: "sn500-rc",
      label: "SN500 RC",
      family: "RC",
      grade: "SN500",
      benchmark: "Virgin SN500 less recycled discount",
      priceUsdMt: round(gasOilBase + 72 + brentSupport),
      lowUsdMt: round(gasOilBase + 50 + brentSupport),
      highUsdMt: round(gasOilBase + 98 + brentSupport),
      note: "Derived recycled-content SN500 working range using heavy-neutral recycled discount assumptions.",
    },
  ];

  return {
    updatedAt: input.updatedAt,
    baseReferenceUsdMt: round(baseReferenceUsdMt),
    baseReferenceLabel: plattsEquivalent?.label ?? "Derived benchmark",
    methodology:
      "Uses live Brent, DBLc1 Dubai proxy, and live/derived gasoil to build negotiation bands and base-oil estimates. These are trader-grade derived references, not licensed Platts physical assessments.",
    regionOffers,
    baseOilOffers,
  };
}
