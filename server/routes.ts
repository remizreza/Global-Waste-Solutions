import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

type BulletinItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
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
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
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

  return httpServer;
}
