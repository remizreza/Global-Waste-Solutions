import type { Express } from "express";
import { createServer, type Server } from "http";
import { createHmac, timingSafeEqual } from "crypto";
import crypto from "crypto";
import { storage } from "./storage";

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
  quotes: TraderPricing[];
};

const COMMODITIES_API_BASE = "https://commodities-api.com/api";
const DEFAULT_COMMODITIES_KEY =
  process.env.COMMODITIES_API_KEY ??
  process.env.NEXT_PUBLIC_COMMODITIES_API_KEY ??
  "q38sxllxx9x4tcq01zr6q8b18271lcq9p880dmclzprmi8844pr4s0lkqg10";

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

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const ADMIN_TOKEN_TTL_MS = 1000 * 60 * 60 * 8;
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;
const BARREL_GALLONS = 42;
const KEROSENE_BARREL_GALLONS = 41.3;

function hasAdminConfig() {
  return Boolean(ADMIN_USERNAME && ADMIN_PASSWORD_HASH && ADMIN_TOKEN_SECRET);
}

function signTokenPayload(payload: string) {
  if (!ADMIN_TOKEN_SECRET) {
    throw new Error('ADMIN_TOKEN_SECRET is not configured');
  }
  return createHmac('sha256', ADMIN_TOKEN_SECRET).update(payload).digest('hex');
}

function createAdminToken(username: string) {
  const expiresAt = Date.now() + ADMIN_TOKEN_TTL_MS;
  const payload = `${username}|${expiresAt}`;
  const signature = signTokenPayload(payload);
  return Buffer.from(`${payload}|${signature}`).toString('base64url');
}

function getBearerToken(authorization: string | undefined): string | null {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

function isAdminAuthorized(authorization: string | undefined): boolean {
  const token = getBearerToken(authorization);
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [username, expiresAtRaw, signature] = decoded.split('|');
    if (!username || !expiresAtRaw || !signature) return false;

    const payload = `${username}|${expiresAtRaw}`;
    const expectedSignature = signTokenPayload(payload);
    const provided = Buffer.from(signature, 'utf8');
    const expected = Buffer.from(expectedSignature, 'utf8');
    if (provided.length !== expected.length) return false;
    if (!timingSafeEqual(provided, expected)) return false;

    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt)) return false;
    if (Date.now() > expiresAt) return false;

    return true;
  } catch {
    return false;
  }
}

function verifyPassword(password: string): boolean {
  if (!ADMIN_PASSWORD_HASH) return false;

  const [salt, expectedHex] = ADMIN_PASSWORD_HASH.split(':');
  if (!salt || !expectedHex) return false;

  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  const provided = Buffer.from(derived, 'hex');
  const expected = Buffer.from(expectedHex, 'hex');
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
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

async function createLiveTraderSnapshot(): Promise<TraderBoardSnapshot> {
  const now = new Date();

  let brent = 84.2;
  let dieselBrent = 96.5;
  let naphthaBrent = 71.4;
  let keroseneBrent = 93.2;
  let source = 'fallback';

  const [commoditiesResult, yahooResult, middleEastResult, investingResult] = await Promise.allSettled([
    fetchCommoditiesJson<{ rates?: Record<string, unknown> }>('latest', {
      base: 'USD',
      symbols: 'CRUDE,DIESEL,NAPHTHA',
    }),
    fetchYahooLiveQuotes(),
    fetchMiddleEastTradesQuotes(),
    fetchInvestingProxyQuotes(),
  ]);

  const rates =
    commoditiesResult.status === 'fulfilled' ? commoditiesResult.value.rates ?? {} : {};
  const yahoo = yahooResult.status === 'fulfilled' ? yahooResult.value : null;
  const middleEast =
    middleEastResult.status === 'fulfilled' ? middleEastResult.value : {};
  const investing =
    investingResult.status === 'fulfilled' ? investingResult.value : {};

  const commodityBrent = numberOrNull(rates.CRUDE);
  const commodityDiesel = numberOrNull(rates.DIESEL);
  const commodityNaphtha = numberOrNull(rates.NAPHTHA);
  const middleEastHasQuotes = [
    middleEast.diesel,
    middleEast.naphtha,
    middleEast.kerosene,
  ].some((value) => value != null);

  const hasLiveBrent =
    investing.brent != null || yahoo?.brent != null || commodityBrent != null;
  const hasLiveDiesel =
    middleEast.diesel != null || commodityDiesel != null || yahoo != null;
  const hasLiveNaphtha =
    middleEast.naphtha != null || commodityNaphtha != null || yahoo != null;
  const hasLiveKerosene = middleEast.kerosene != null || yahoo != null;
  const hasAnyLiveQuotes =
    hasLiveBrent || hasLiveDiesel || hasLiveNaphtha || hasLiveKerosene;
  const hasCompleteLiveQuotes =
    hasLiveBrent && hasLiveDiesel && hasLiveNaphtha && hasLiveKerosene;

  brent = investing.brent ?? yahoo?.brent ?? commodityBrent ?? brent;
  dieselBrent =
    middleEast.diesel ??
    commodityDiesel ??
    (yahoo ? yahoo.heatingOil * BARREL_GALLONS : dieselBrent);
  naphthaBrent =
    middleEast.naphtha ??
    commodityNaphtha ??
    (yahoo ? yahoo.rbob * BARREL_GALLONS : naphthaBrent);
  keroseneBrent =
    middleEast.kerosene ??
    (yahoo ? yahoo.heatingOil * KEROSENE_BARREL_GALLONS : keroseneBrent);

  if (hasCompleteLiveQuotes) {
    if (middleEastHasQuotes) {
      source = 'middleeast-trades+commodities';
    } else if (yahoo || investing.brent != null) {
      source = 'investing/yahoo+commodities';
    } else {
      source = 'commodities-api';
    }
  } else if (hasAnyLiveQuotes) {
    source = 'partial-fallback';
  }

  const quotes: TraderPricing[] = [
    {
      product: 'Diesel',
      brent: Number(dieselBrent.toFixed(2)),
      plats: Number((dieselBrent + 4.25).toFixed(2)),
      spread: 4.25,
      trend: 'up',
      updatedAt: now.toISOString(),
      unit: 'USD/bbl',
      source,
    },
    {
      product: 'Naphtha',
      brent: Number(naphthaBrent.toFixed(2)),
      plats: Number((naphthaBrent + 3.85).toFixed(2)),
      spread: 3.85,
      trend: 'up',
      updatedAt: now.toISOString(),
      unit: 'USD/bbl',
      source,
    },
    {
      product: 'Kerosene',
      brent: Number(keroseneBrent.toFixed(2)),
      plats: Number((keroseneBrent + 4.05).toFixed(2)),
      spread: 4.05,
      trend: 'up',
      updatedAt: now.toISOString(),
      unit: 'USD/bbl',
      source,
    },
  ];

  return {
    updatedAt: now.toISOString(),
    tradersOnline: 20 + Math.floor((Math.sin(now.getTime() / 180000) + 1) * 4),
    marketPulse: brent > 85 ? 'Bullish' : brent < 80 ? 'Bearish' : 'Neutral',
    quotes,
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
    if (!hasAdminConfig() || !ADMIN_USERNAME) {
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

    if (
      username.toLowerCase() !== ADMIN_USERNAME.toLowerCase() ||
      !verifyPassword(password)
    ) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    const token = createAdminToken(username);
    return res.json({ ok: true, token, expiresInMs: ADMIN_TOKEN_TTL_MS });
  });

  app.get("/api/admin/session", (req, res) => {
    if (!hasAdminConfig()) {
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
