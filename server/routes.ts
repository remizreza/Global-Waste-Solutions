import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import {
  createAdminToken,
  getAdminTokenTtlMs,
  isAdminAuthorized,
  isAdminAuthConfigured,
  validateAdminCredentials,
} from "./adminAuth.js";

type BulletinItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
};

type CommoditySnapshot = {
  crude: number;
  diesel: number;
  naphtha: number;
  recoveryOils: number;
  timestamp: string;
  source: string;
};

type TraderPricing = {
  product: string;
  price: number;
  rawPrice: number;
  rawUnit: "USD/bbl" | "USD/gal" | "USD/MMBtu" | "USD/mt";
  trend: "up" | "down" | "flat";
  updatedAt: string;
  unit: "USD/mt" | "USD/mt eq";
  source: string;
  benchmark: string;
  note?: string;
};

type ForecastPoint = {
  date: string;
  benchmark: string;
  benchmarkUsdMt: number;
  expectedOfferUsdMt: number;
  confidence: "low" | "medium";
};

type BenchmarkKey = "brent" | "dubaiProxy";

type BenchmarkQuote = {
  key: BenchmarkKey;
  label: string;
  source: string;
  symbol: string;
  priceUsdPerBbl: number;
  priceUsdPerMt: number;
  previousUsdPerBbl: number | null;
  changeUsdPerBbl: number | null;
  changePercent: number | null;
  trend: "up" | "down" | "flat";
  updatedAt: string;
  note?: string;
};

type TraderBoardSnapshot = {
  updatedAt: string;
  tradersOnline: number;
  marketPulse: "Bullish" | "Bearish" | "Neutral";
  benchmarkMode: "benchmark-driven";
  benchmarks: BenchmarkQuote[];
  quotes: TraderPricing[];
  forecasts: ForecastPoint[];
};

type EnergyProductKey = "brent" | "wti" | "naturalGas" | "heatingOil" | "gasoline" | "gasOil";

type IgSession = {
  accessToken: string;
  expiresAt: number;
};

type IgMarketQuote = {
  bid: number | null;
  offer: number | null;
  updatedAt: string | null;
  epic: string;
  instrumentName: string | null;
};

const COMMODITIES_API_BASE = "https://api.commodities-api.com";
const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";
const DEFAULT_COMMODITIES_KEY =
  process.env.COMMODITIES_API_KEY ??
  process.env.NEXT_PUBLIC_COMMODITIES_API_KEY ??
  "q38sxllxx9x4tcq01zr6q8b18271lcq9p880dmclzprmi8844pr4s0lkqg10";
const ALPHA_VANTAGE_API_KEY =
  process.env.ALPHA_VANTAGE_API_KEY ??
  process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY ??
  "";

const FALLBACK_COMMODITY_QUOTES: CommoditySnapshot = {
  crude: 84.2,
  diesel: 96.5,
  naphtha: 71.4,
  recoveryOils: 62.3,
  timestamp: new Date().toISOString(),
  source: "fallback",
};

const KEYWORDS = [
  "oil",
  "gas",
  "petrochemical",
  "refinery",
  "lng",
  "diesel",
  "crude",
  "upstream",
  "downstream",
  "naphtha",
];

const FEEDS = [
  {
    source: "EIA Today In Energy",
    url: "https://www.eia.gov/rss/todayinenergy.xml",
  },
  {
    source: "EIA Press Releases",
    url: "https://www.eia.gov/rss/press_rss.xml",
  },
  {
    source: "Offshore Technology",
    url: "https://www.offshore-technology.com/feed/",
  },
];

const FALLBACK_ITEMS: BulletinItem[] = [
  {
    title: "Crude and refined product balances remain a core demand signal.",
    link: "https://www.eia.gov/petroleum/",
    source: "REDOXY Bulletin",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Petrochemical feedstock pricing trends continue to influence GCC trade flow.",
    link: "https://www.eia.gov/",
    source: "REDOXY Bulletin",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Operational efficiency and treatment technology remain key refinery priorities.",
    link: "https://www.eia.gov/todayinenergy/",
    source: "REDOXY Bulletin",
    publishedAt: new Date().toISOString(),
  },
];

function decodeXml(text: string): string {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function stripTags(text: string): string {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTag(block: string, tag: string): string {
  const direct = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const cdata = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`,
    "i",
  );
  const cdataMatch = block.match(cdata);
  if (cdataMatch?.[1]) {
    return stripTags(decodeXml(cdataMatch[1])).trim();
  }
  const directMatch = block.match(direct);
  if (directMatch?.[1]) {
    return stripTags(decodeXml(directMatch[1])).trim();
  }
  return "";
}

function parseRss(xml: string, source: string): BulletinItem[] {
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  return itemBlocks
    .map((block) => {
      const title = extractTag(block, "title");
      const link = extractTag(block, "link");
      const pubDate = extractTag(block, "pubDate");
      const parsedDate = Date.parse(pubDate);
      const publishedAt = Number.isNaN(parsedDate)
        ? new Date().toISOString()
        : new Date(parsedDate).toISOString();

      return {
        title,
        link,
        source,
        publishedAt,
      };
    })
    .filter((item) => item.title.length > 8 && item.link.startsWith("http"));
}

function isIndustryRelevant(item: BulletinItem): boolean {
  const haystack = `${item.title} ${item.source}`.toLowerCase();
  return KEYWORDS.some((keyword) => haystack.includes(keyword));
}

function buildCommoditiesUrl(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${COMMODITIES_API_BASE}/${endpoint}`);
  url.searchParams.set("access_key", DEFAULT_COMMODITIES_KEY);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url;
}

function buildAlphaVantageUrl(params: Record<string, string>) {
  const url = new URL(ALPHA_VANTAGE_BASE);
  url.searchParams.set("apikey", ALPHA_VANTAGE_API_KEY);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url;
}

async function fetchCommoditiesJson<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = buildCommoditiesUrl(endpoint, params);
  const response = await fetch(url.toString(), {
    headers: { "user-agent": "redoxy-commodities-client/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Commodities API ${endpoint} failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseNumberString(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toTrend(change: number | null): "up" | "down" | "flat" {
  if (change == null || Math.abs(change) < 0.0001) return "flat";
  return change > 0 ? "up" : "down";
}

function convertBblToMt(priceUsdPerBbl: number, factor = 7.33) {
  return Number((priceUsdPerBbl * factor).toFixed(2));
}

function buildDerivedQuote(input: {
  product: string;
  rawPrice: number;
  rawUnit: TraderPricing["rawUnit"];
  unit: TraderPricing["unit"];
  price: number;
  source: string;
  benchmark: string;
  note?: string;
  updatedAt: string;
}): TraderPricing {
  return {
    product: input.product,
    price: Number(input.price.toFixed(2)),
    rawPrice: Number(input.rawPrice.toFixed(input.rawUnit === "USD/gal" ? 4 : input.rawUnit === "USD/MMBtu" ? 3 : 2)),
    rawUnit: input.rawUnit,
    trend: "flat",
    updatedAt: input.updatedAt,
    unit: input.unit,
    source: input.source,
    benchmark: input.benchmark,
    note: input.note,
  };
}

function buildForecasts(benchmark: BenchmarkQuote, premiumPerMt = 87): ForecastPoint[] {
  const step = benchmark.changeUsdPerBbl ?? 0.65;
  return Array.from({ length: 5 }, (_, index) => {
    const direction = benchmark.trend === "down" ? -1 : 1;
    const nextBbl = benchmark.priceUsdPerBbl + direction * step * (index + 1) * 0.35;
    const benchmarkUsdMt = convertBblToMt(nextBbl);
    return {
      date: new Date(Date.now() + (index + 1) * 86400000).toISOString().slice(0, 10),
      benchmark: benchmark.label,
      benchmarkUsdMt,
      expectedOfferUsdMt: Number((benchmarkUsdMt + premiumPerMt).toFixed(2)),
      confidence: index < 2 ? "medium" : "low",
    };
  });
}

const BARREL_GALLONS = 42;
const KEROSENE_BARREL_GALLONS = 41.3;
const IG_API_BASE = process.env.IG_API_BASE?.trim() || "https://api.ig.com/gateway/deal";
const IG_LOGIN_BUFFER_MS = 60_000;

let igSessionCache: IgSession | null = null;

function getIgConfiguredEpics() {
  return {
    brent: process.env.IG_EPIC_BRENT?.trim() || "CC.D.LCO.UNC.IP",
    wti: process.env.IG_EPIC_WTI?.trim() || "CC.D.CL.UNC.IP",
    naturalGas: process.env.IG_EPIC_NATURAL_GAS?.trim() || "CC.D.NG.UNC.IP",
    heatingOil: process.env.IG_EPIC_HEATING_OIL?.trim() || "CC.D.HO.UNC.IP",
    gasoline: process.env.IG_EPIC_GASOLINE?.trim() || "CC.D.RB.UNC.IP",
    gasOil: process.env.IG_EPIC_GAS_OIL?.trim() || process.env.IG_EPIC_DIESEL?.trim() || "CC.D.LGO.UNC.IP",
  };
}

function isIgConfigured() {
  return Boolean(
    process.env.IG_API_KEY?.trim() &&
      process.env.IG_USERNAME?.trim() &&
      process.env.IG_PASSWORD?.trim(),
  );
}

async function getIgAccessToken() {
  if (!isIgConfigured()) {
    return null;
  }

  const cached = igSessionCache;
  if (cached && cached.expiresAt > Date.now() + IG_LOGIN_BUFFER_MS) {
    return cached.accessToken;
  }

  const response = await fetch(`${IG_API_BASE}/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json; charset=UTF-8",
      Version: "3",
      "X-IG-API-KEY": process.env.IG_API_KEY!.trim(),
    },
    body: JSON.stringify({
      identifier: process.env.IG_USERNAME!.trim(),
      password: process.env.IG_PASSWORD!.trim(),
      encryptedPassword: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`IG session failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    oauthToken?: {
      access_token?: string;
      expires_in?: string;
      token_type?: string;
    };
  };

  const accessToken = payload.oauthToken?.access_token?.trim();
  const expiresInRaw = Number(payload.oauthToken?.expires_in ?? "0");

  if (!accessToken || !Number.isFinite(expiresInRaw) || expiresInRaw <= 0) {
    throw new Error("IG session did not return a usable OAuth token");
  }

  const session: IgSession = {
    accessToken,
    expiresAt: Date.now() + expiresInRaw * 1000,
  };
  igSessionCache = session;
  return session.accessToken;
}

async function fetchIgMarketQuote(epic: string): Promise<IgMarketQuote | null> {
  const accessToken = await getIgAccessToken();
  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${IG_API_BASE}/markets/${encodeURIComponent(epic)}`, {
    headers: {
      Accept: "application/json; charset=UTF-8",
      Version: "3",
      Authorization: `Bearer ${accessToken}`,
      "IG-ACCOUNT-ID": process.env.IG_ACCOUNT_ID?.trim() || "",
      "X-IG-API-KEY": process.env.IG_API_KEY!.trim(),
    },
  });

  if (!response.ok) {
    throw new Error(`IG market ${epic} failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    instrument?: {
      name?: unknown;
    };
    snapshot?: {
      bid?: unknown;
      offer?: unknown;
      updateTime?: unknown;
      updateTimestampUTC?: unknown;
    };
  };

  const snapshot = payload.snapshot ?? {};
  const updateTimestampUtc = numberOrNull(snapshot.updateTimestampUTC);
  const updateAt =
    typeof snapshot.updateTime === "string" && snapshot.updateTime.trim()
      ? snapshot.updateTime.trim()
      : updateTimestampUtc != null
        ? new Date(updateTimestampUtc * 1000).toISOString()
        : null;

  return {
    bid: numberOrNull(snapshot.bid),
    offer: numberOrNull(snapshot.offer),
    updatedAt: updateAt,
    epic,
    instrumentName:
      typeof payload.instrument?.name === "string" ? payload.instrument.name : null,
  };
}

function normalizeIgEnergyPrice(key: EnergyProductKey, mid: number) {
  switch (key) {
    case "brent": {
      const rawPrice = mid / 100;
      return {
        product: "Brent Crude" as const,
        price: Number((rawPrice * 7.33).toFixed(2)),
        rawPrice: Number(rawPrice.toFixed(2)),
        rawUnit: "USD/bbl" as const,
        unit: "USD/mt" as const,
      };
    }
    case "wti": {
      const rawPrice = mid / 100;
      return {
        product: "WTI Crude" as const,
        price: Number((rawPrice * 7.62).toFixed(2)),
        rawPrice: Number(rawPrice.toFixed(2)),
        rawUnit: "USD/bbl" as const,
        unit: "USD/mt" as const,
      };
    }
    case "naturalGas": {
      const rawPrice = mid / 1000;
      return {
        product: "Natural Gas" as const,
        price: Number((rawPrice * 52).toFixed(2)),
        rawPrice: Number(rawPrice.toFixed(3)),
        rawUnit: "USD/MMBtu" as const,
        unit: "USD/mt eq" as const,
        note: "LNG equivalent using 52 MMBtu/mt",
      };
    }
    case "heatingOil": {
      const rawPrice = mid / 10000;
      return {
        product: "Heating Oil" as const,
        price: Number((rawPrice * 313.32).toFixed(2)),
        rawPrice: Number(rawPrice.toFixed(4)),
        rawUnit: "USD/gal" as const,
        unit: "USD/mt" as const,
      };
    }
    case "gasoline": {
      const rawPrice = mid / 10000;
      return {
        product: "Gasoline" as const,
        price: Number((rawPrice * 358.26).toFixed(2)),
        rawPrice: Number(rawPrice.toFixed(4)),
        rawUnit: "USD/gal" as const,
        unit: "USD/mt" as const,
      };
    }
    case "gasOil": {
      return {
        product: "Gas Oil" as const,
        price: Number(mid.toFixed(2)),
        rawPrice: Number(mid.toFixed(2)),
        rawUnit: "USD/mt" as const,
        unit: "USD/mt" as const,
        note: "Live IG London Gas Oil market used as gas oil benchmark.",
      };
    }
  }
}

async function fetchIgQuotes(): Promise<
  Partial<Record<EnergyProductKey, TraderPricing>> & {
    source?: string;
    updatedAt?: string;
  }
> {
  const epics = getIgConfiguredEpics();
  const configuredEntries = Object.entries(epics).filter((entry): entry is [keyof typeof epics, string] => Boolean(entry[1]));

  if (configuredEntries.length === 0 || !isIgConfigured()) {
    return {};
  }

  const results = await Promise.allSettled(
    configuredEntries.map(async ([key, epic]) => [key, await fetchIgMarketQuote(epic)] as const),
  );

  const quotes: Partial<Record<EnergyProductKey, TraderPricing>> = {};
  let latestUpdateAt: string | undefined;

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const [key, quote] = result.value;
    const mid =
      quote?.bid != null && quote.offer != null
        ? Number(((quote.bid + quote.offer) / 2).toFixed(2))
        : quote?.bid ?? quote?.offer ?? null;

    if (mid != null) {
      const normalized = normalizeIgEnergyPrice(key, mid);
      quotes[key] = {
        product: normalized.product,
        price: normalized.price,
        rawPrice: normalized.rawPrice,
        rawUnit: normalized.rawUnit,
        trend: "up",
        updatedAt: quote?.updatedAt ?? new Date().toISOString(),
        unit: normalized.unit,
        source: "ig-live",
        benchmark:
          normalized.product === "Brent Crude"
            ? "Brent crude benchmark"
            : normalized.product === "WTI Crude"
              ? "WTI crude benchmark"
              : normalized.product === "Natural Gas"
                ? "Henry Hub style gas benchmark"
                : normalized.product === "Heating Oil"
                  ? "Heating oil crack proxy"
                  : normalized.product === "Gas Oil"
                    ? "London gas oil benchmark"
                    : "Gasoline crack proxy",
        note: "note" in normalized ? normalized.note : undefined,
      };
    }

    if (quote?.updatedAt && (!latestUpdateAt || quote.updatedAt > latestUpdateAt)) {
      latestUpdateAt = quote.updatedAt;
    }
  }

  if (Object.keys(quotes).length === 0) {
    return {};
  }

  return {
    ...quotes,
    source: "ig-markets",
    updatedAt: latestUpdateAt,
  };
}

async function fetchYahooLiveQuotes() {
  const response = await fetch(
    'https://query1.finance.yahoo.com/v7/finance/quote?symbols=BZ%3DF,HO%3DF,RB%3DF',
    { headers: { 'user-agent': 'redoxy-trader-dashboard/1.0' } },
  );

  if (!response.ok) {
    throw new Error(`Yahoo quote fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const rows =
    typeof payload === 'object' &&
    payload !== null &&
    'quoteResponse' in payload &&
    typeof (payload as { quoteResponse?: unknown }).quoteResponse === 'object' &&
    (payload as { quoteResponse: { result?: unknown } }).quoteResponse !== null &&
    Array.isArray((payload as { quoteResponse: { result?: unknown[] } }).quoteResponse.result)
      ? (payload as { quoteResponse: { result: Array<{ symbol?: string; regularMarketPrice?: unknown }> } }).quoteResponse.result
      : [];

  const bySymbol = new Map(rows.map((row) => [row.symbol, row.regularMarketPrice]));

  const brent = numberOrNull(bySymbol.get('BZ=F'));
  const heatingOil = numberOrNull(bySymbol.get('HO=F'));
  const rbob = numberOrNull(bySymbol.get('RB=F'));

  if (brent == null || heatingOil == null || rbob == null) {
    throw new Error('Yahoo returned incomplete quote set');
  }

  return { brent, heatingOil, rbob };
}

async function fetchMiddleEastTradesQuotes(): Promise<Partial<Record<'diesel' | 'naphtha' | 'kerosene', number>>> {
  const endpoint = process.env.MIDDLEEAST_TRADES_API_URL;
  if (!endpoint) return {};

  const response = await fetch(endpoint, {
    headers: {
      'user-agent': 'redoxy-trader-dashboard/1.0',
      ...(process.env.MIDDLEEAST_TRADES_API_KEY
        ? { authorization: `Bearer ${process.env.MIDDLEEAST_TRADES_API_KEY}` }
        : {}),
    },
  });

  if (!response.ok) return {};

  const payload = (await response.json()) as Record<string, unknown>;
  return {
    diesel: numberOrNull(payload.dieselPrice) ?? undefined,
    naphtha: numberOrNull(payload.naphthaPrice) ?? undefined,
    kerosene: numberOrNull(payload.kerosenePrice) ?? undefined,
  };
}

async function fetchInvestingProxyQuotes(): Promise<Partial<Record<'brent', number>>> {
  const endpoint = process.env.INVESTING_API_URL;
  if (!endpoint) return {};

  const response = await fetch(endpoint, {
    headers: {
      'user-agent': 'redoxy-trader-dashboard/1.0',
      ...(process.env.INVESTING_API_KEY
        ? { authorization: `Bearer ${process.env.INVESTING_API_KEY}` }
        : {}),
    },
  });

  if (!response.ok) return {};

  const payload = (await response.json()) as Record<string, unknown>;
  return {
    brent: numberOrNull(payload.brent) ?? numberOrNull(payload.brentPrice) ?? undefined,
  };
}

async function fetchAlphaVantageBrent(): Promise<BenchmarkQuote | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    return null;
  }

  const url = buildAlphaVantageUrl({
    function: "BRENT",
    interval: "daily",
  });

  const response = await fetch(url.toString(), {
    headers: {
      "user-agent": "redoxy-brent-client/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Alpha Vantage BRENT failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ date?: unknown; value?: unknown }>;
    interval?: unknown;
    unit?: unknown;
    name?: unknown;
    "Error Message"?: unknown;
    Information?: unknown;
    Note?: unknown;
  };

  if (payload["Error Message"] || payload.Information || payload.Note) {
    throw new Error("Alpha Vantage did not return a usable Brent payload");
  }

  const rows = Array.isArray(payload.data) ? payload.data : [];
  const latest = rows.find((row) => parseNumberString(row?.value) != null);
  const previous = rows.slice(rows.indexOf(latest ?? rows[0]) + 1).find((row) => parseNumberString(row?.value) != null);

  const latestPrice = parseNumberString(latest?.value);
  if (latestPrice == null) {
    throw new Error("Alpha Vantage Brent payload missing latest value");
  }

  const previousPrice = parseNumberString(previous?.value);
  const change = previousPrice == null ? null : Number((latestPrice - previousPrice).toFixed(2));
  const changePercent =
    previousPrice == null || previousPrice === 0
      ? null
      : Number((((latestPrice - previousPrice) / previousPrice) * 100).toFixed(2));

  const updatedAt =
    typeof latest?.date === "string" && latest.date.trim()
      ? new Date(`${latest.date}T00:00:00Z`).toISOString()
      : new Date().toISOString();

  return {
    key: "brent",
    label: "Brent Benchmark",
    source: "Alpha Vantage",
    symbol: "BRENT",
    priceUsdPerBbl: Number(latestPrice.toFixed(2)),
    priceUsdPerMt: convertBblToMt(latestPrice),
    previousUsdPerBbl: previousPrice == null ? null : Number(previousPrice.toFixed(2)),
    changeUsdPerBbl: change,
    changePercent,
    trend: toTrend(change),
    updatedAt,
    note: "Daily Brent benchmark feed from Alpha Vantage.",
  };
}

async function fetchDubaiProxyQuote(): Promise<BenchmarkQuote | null> {
  if (!DEFAULT_COMMODITIES_KEY) {
    return null;
  }

  const [latestResponse, historicalResponse] = await Promise.all([
    fetchCommoditiesJson<{
      data?: { success?: unknown; date?: unknown; rates?: Record<string, unknown> };
      success?: unknown;
      date?: unknown;
      rates?: Record<string, unknown>;
    }>("latest", {
      base: "USD",
      symbols: "DBLc1",
    }),
    fetchCommoditiesJson<{
      data?: { success?: unknown; date?: unknown; rates?: Record<string, unknown> };
      success?: unknown;
      date?: unknown;
      rates?: Record<string, unknown>;
    }>(new Date(Date.now() - 86400000).toISOString().slice(0, 10), {
      base: "USD",
      symbols: "DBLc1",
    }),
  ]);

  const latestRates = latestResponse.data?.rates ?? latestResponse.rates ?? {};
  const historicalRates = historicalResponse.data?.rates ?? historicalResponse.rates ?? {};

  const latestPrice = parseNumberString(latestRates.DBLc1);
  if (latestPrice == null) {
    throw new Error("Commodities-API Dubai proxy payload missing DBLc1");
  }

  const previousPrice = parseNumberString(historicalRates.DBLc1);
  const change = previousPrice == null ? null : Number((latestPrice - previousPrice).toFixed(2));
  const changePercent =
    previousPrice == null || previousPrice === 0
      ? null
      : Number((((latestPrice - previousPrice) / previousPrice) * 100).toFixed(2));

  const latestDate =
    typeof latestResponse.data?.date === "string"
      ? latestResponse.data.date
      : typeof latestResponse.date === "string"
        ? latestResponse.date
        : new Date().toISOString().slice(0, 10);

  return {
    key: "dubaiProxy",
    label: "Dubai Proxy",
    source: "Commodities-API",
    symbol: "DBLc1",
    priceUsdPerBbl: Number(latestPrice.toFixed(2)),
    priceUsdPerMt: convertBblToMt(latestPrice),
    previousUsdPerBbl: previousPrice == null ? null : Number(previousPrice.toFixed(2)),
    changeUsdPerBbl: change,
    changePercent,
    trend: toTrend(change),
    updatedAt: new Date(`${latestDate}T00:00:00Z`).toISOString(),
    note: "DBLc1 is a futures proxy, not the licensed Platts physical assessment.",
  };
}

async function createLiveTraderSnapshot(): Promise<TraderBoardSnapshot> {
  const now = new Date();
  const [igResult, brentResult, dubaiResult] = await Promise.allSettled([
    fetchIgQuotes(),
    fetchAlphaVantageBrent(),
    fetchDubaiProxyQuote(),
  ]);
  const ig = igResult.status === "fulfilled" ? igResult.value : {};
  const benchmarkCandidates = [
    brentResult.status === "fulfilled" ? brentResult.value : null,
    dubaiResult.status === "fulfilled" ? dubaiResult.value : null,
  ].filter((quote): quote is BenchmarkQuote => Boolean(quote));

  const fallbackQuotes: TraderPricing[] = [
    {
      product: "Brent Crude",
      price: 700,
      rawPrice: 95.5,
      rawUnit: "USD/bbl",
      trend: "up",
      updatedAt: now.toISOString(),
      unit: "USD/mt",
      source: "fallback",
      benchmark: "Brent crude benchmark",
    },
    {
      product: "WTI Crude",
      price: 675,
      rawPrice: 88.6,
      rawUnit: "USD/bbl",
      trend: "up",
      updatedAt: now.toISOString(),
      unit: "USD/mt",
      source: "fallback",
      benchmark: "WTI crude benchmark",
    },
    {
      product: "Natural Gas",
      price: 149,
      rawPrice: 2.867,
      rawUnit: "USD/MMBtu",
      trend: "up",
      updatedAt: now.toISOString(),
      unit: "USD/mt eq",
      source: "fallback",
      benchmark: "Henry Hub style gas benchmark",
      note: "LNG equivalent using 52 MMBtu/mt",
    },
    {
      product: "Heating Oil",
      price: 1193,
      rawPrice: 3.8094,
      rawUnit: "USD/gal",
      trend: "up",
      updatedAt: now.toISOString(),
      unit: "USD/mt",
      source: "fallback",
      benchmark: "Heating oil crack proxy",
    },
    {
      product: "Gasoline",
      price: 1059,
      rawPrice: 2.955,
      rawUnit: "USD/gal",
      trend: "up",
      updatedAt: now.toISOString(),
      unit: "USD/mt",
      source: "fallback",
      benchmark: "Gasoline crack proxy",
    },
    {
      product: "Gas Oil",
      price: 696.82,
      rawPrice: 696.82,
      rawUnit: "USD/mt",
      trend: "up",
      updatedAt: now.toISOString(),
      unit: "USD/mt",
      source: "fallback",
      benchmark: "London gas oil benchmark",
      note: "Fallback London gas oil benchmark used when IG gas oil is unavailable.",
    },
  ];

  const quoteOrder: EnergyProductKey[] = ["brent", "wti", "naturalGas", "heatingOil", "gasoline", "gasOil"];
  const quotes = quoteOrder.map((key) => ig[key] ?? fallbackQuotes[quoteOrder.indexOf(key)]);
  const benchmarkFallbacks: BenchmarkQuote[] = [
    {
      key: "brent",
      label: "Brent Benchmark",
      source: "fallback",
      symbol: "BRENT",
      priceUsdPerBbl: fallbackQuotes[0].rawPrice,
      priceUsdPerMt: fallbackQuotes[0].price,
      previousUsdPerBbl: 94.1,
      changeUsdPerBbl: Number((fallbackQuotes[0].rawPrice - 94.1).toFixed(2)),
      changePercent: Number((((fallbackQuotes[0].rawPrice - 94.1) / 94.1) * 100).toFixed(2)),
      trend: "up",
      updatedAt: now.toISOString(),
      note: "Fallback benchmark used because Alpha Vantage data is unavailable.",
    },
    {
      key: "dubaiProxy",
      label: "Dubai Proxy",
      source: "fallback",
      symbol: "DBLc1",
      priceUsdPerBbl: 93.2,
      priceUsdPerMt: convertBblToMt(93.2),
      previousUsdPerBbl: 92.4,
      changeUsdPerBbl: 0.8,
      changePercent: 0.87,
      trend: "up",
      updatedAt: now.toISOString(),
      note: "Fallback futures proxy used because DBLc1 data is unavailable.",
    },
  ];
  const benchmarkMap = new Map(benchmarkCandidates.map((quote) => [quote.key, quote]));
  const benchmarks = benchmarkFallbacks.map((fallback) => benchmarkMap.get(fallback.key) ?? fallback);
  const liveCount = quoteOrder.filter((key) => Boolean(ig[key])).length;
  const source = liveCount === quoteOrder.length ? "ig-live" : liveCount > 0 ? "partial-fallback" : "fallback";
  const oilBench = benchmarks[0]?.priceUsdPerBbl ?? ig.brent?.rawPrice ?? fallbackQuotes[0].rawPrice;

  const primaryQuotes = quotes.map((quote) => ({
    ...quote,
    benchmark: quote.product === "Brent Crude"
      ? "Brent crude benchmark"
      : quote.product === "WTI Crude"
        ? "WTI crude benchmark"
        : quote.product === "Natural Gas"
          ? "Henry Hub style gas benchmark"
          : quote.product === "Heating Oil"
            ? "Heating oil crack proxy"
            : quote.product === "Gas Oil"
              ? "London gas oil benchmark"
              : "Gasoline crack proxy",
    source: quote.source === "fallback" && source === "partial-fallback" ? "partial-fallback" : quote.source,
  }));

  const heatingOil = primaryQuotes.find((quote) => quote.product === "Heating Oil") ?? fallbackQuotes[3];
  const gasOil = primaryQuotes.find((quote) => quote.product === "Gas Oil") ?? fallbackQuotes[5];
  const brentBenchmark = benchmarks.find((quote) => quote.key === "brent") ?? benchmarkFallbacks[0];
  const dubaiBenchmark = benchmarks.find((quote) => quote.key === "dubaiProxy") ?? benchmarkFallbacks[1];

  const derivedQuotes: TraderPricing[] = [
    buildDerivedQuote({
      product: "Diesel",
      rawPrice: gasOil.rawPrice,
      rawUnit: "USD/mt",
      unit: "USD/mt",
      price: gasOil.price + 22,
      source: gasOil.source.includes("ig") ? "ig-derived" : "fallback-derived",
      benchmark: "Diesel derived from heating oil / gasoil proxy",
      note: "Derived from live gas oil with diesel premium when direct diesel feed is unavailable.",
      updatedAt: gasOil.updatedAt,
    }),
    buildDerivedQuote({
      product: "Kerosene",
      rawPrice: Number((heatingOil.rawPrice * 0.972).toFixed(4)),
      rawUnit: "USD/gal",
      unit: "USD/mt",
      price: heatingOil.price * 0.965,
      source: heatingOil.source.includes("ig") ? "ig-derived" : "fallback-derived",
      benchmark: "Kerosene derived from heating oil",
      note: "Proxy estimate from heating oil / jet range product.",
      updatedAt: heatingOil.updatedAt,
    }),
    buildDerivedQuote({
      product: "Naphtha",
      rawPrice: brentBenchmark.priceUsdPerBbl * 0.84,
      rawUnit: "USD/bbl",
      unit: "USD/mt",
      price: brentBenchmark.priceUsdPerMt * 0.84,
      source: brentBenchmark.source === "fallback" ? "fallback-derived" : "brent-derived",
      benchmark: "Brent-linked naphtha proxy",
      note: "Brent-linked proxy used when direct naphtha feed is unavailable.",
      updatedAt: brentBenchmark.updatedAt,
    }),
    buildDerivedQuote({
      product: "Recovery Oil (Black)",
      rawPrice: brentBenchmark.priceUsdPerBbl * 0.61,
      rawUnit: "USD/bbl",
      unit: "USD/mt",
      price: brentBenchmark.priceUsdPerMt * 0.61,
      source: "redoxy-derived",
      benchmark: "Recovered black oil discount to Brent",
      note: "Recovered black oil estimate using internal discount-to-Brent logic.",
      updatedAt: brentBenchmark.updatedAt,
    }),
  ];

  return {
    updatedAt: now.toISOString(),
    tradersOnline: 20 + Math.floor((Math.sin(now.getTime() / 180000) + 1) * 4),
    marketPulse: oilBench > 85 ? 'Bullish' : oilBench < 80 ? 'Bearish' : 'Neutral',
    benchmarkMode: "benchmark-driven",
    benchmarks,
    quotes: [...primaryQuotes, ...derivedQuotes],
    forecasts: buildForecasts(brentBenchmark),
  };
}

function parseSnapshotRates(rates: Record<string, unknown>): CommoditySnapshot {
  const crude = numberOrNull(rates.CRUDE) ?? numberOrNull(rates.crude);
  const diesel = numberOrNull(rates.DIESEL) ?? numberOrNull(rates.diesel);
  const naphtha = numberOrNull(rates.NAPHTHA) ?? numberOrNull(rates.naphtha);

  if (crude == null || diesel == null || naphtha == null) {
    throw new Error("Missing required commodity rates");
  }

  return {
    crude,
    diesel,
    naphtha,
    recoveryOils: Number((naphtha * 0.872).toFixed(2)),
    timestamp: new Date().toISOString(),
    source: "live",
  };
}

async function getLiveBulletin(): Promise<BulletinItem[]> {
  const feedItems = await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const response = await fetch(feed.url, {
          headers: { "user-agent": "redoxy-bulletin-bot/1.0" },
        });
        if (!response.ok) {
          return [];
        }
        const xml = await response.text();
        return parseRss(xml, feed.source);
      } catch {
        return [];
      }
    }),
  );

  const merged = feedItems
    .flat()
    .filter(isIndustryRelevant)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 8);

  return merged.length > 0 ? merged : FALLBACK_ITEMS;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      service: "redoxyksa",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/live-bulletin", async (_req, res) => {
    const items = await getLiveBulletin();
    res.json({
      updatedAt: new Date().toISOString(),
      count: items.length,
      items,
    });
  });

  app.get("/api/commodities/symbols", async (_req, res) => {
    try {
      const payload = await fetchCommoditiesJson<Record<string, unknown>>(
        "symbols",
      );
      res.json(payload);
    } catch (error) {
      res.status(502).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load commodities symbols",
      });
    }
  });

  app.get("/api/commodities", async (_req, res) => {
    try {
      const payload = await fetchCommoditiesJson<{
        rates?: Record<string, unknown>;
        timestamp?: number;
      }>("latest", {
        base: "USD",
        symbols: "CRUDE,DIESEL,NAPHTHA",
      });

      const rates = payload.rates ?? {};
      const snapshot = parseSnapshotRates(rates);

      if (payload.timestamp) {
        snapshot.timestamp = new Date(payload.timestamp * 1000).toISOString();
      }

      res.json(snapshot);
    } catch {
      res.json(FALLBACK_COMMODITY_QUOTES);
    }
  });

  app.get("/api/commodities/news", async (_req, res) => {
    try {
      const payload = await fetchCommoditiesJson<Record<string, unknown>>(
        "getNews",
      );
      res.json(payload);
    } catch (error) {
      res.status(502).json({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load commodities news",
      });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    if (!isAdminAuthConfigured()) {
      return res.status(503).json({
        ok: false,
        error: "Admin auth is not configured on the server",
      });
    }

    const rawUsername =
      typeof req.body?.username === "string" ? req.body.username : "";
    const rawPassword =
      typeof req.body?.password === "string" ? req.body.password : "";
    const username = rawUsername.trim();
    const password = rawPassword.trim();

    if (!validateAdminCredentials(username, password)) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    const token = createAdminToken(username);
    return res.json({ ok: true, token, expiresInMs: getAdminTokenTtlMs() });
  });

  app.get("/api/admin/session", (req, res) => {
    if (!isAdminAuthConfigured()) {
      return res.status(503).json({ ok: false, error: "Admin auth unavailable" });
    }

    const authorized = isAdminAuthorized(req.headers.authorization);
    if (!authorized) {
      return res.status(401).json({ ok: false });
    }

    return res.json({ ok: true });
  });

  app.post("/api/admin/logout", (_req, res) => {
    return res.json({ ok: true });
  });

  app.get("/api/trader-dashboard", async (_req, res) => {
    const snapshot = await createLiveTraderSnapshot();
    res.json(snapshot);
  });

  return httpServer;
}
