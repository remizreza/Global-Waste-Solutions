import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ExternalLink, RefreshCw } from "lucide-react";

type BulletinItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
};

type BulletinResponse = {
  updatedAt: string;
  count: number;
  items: BulletinItem[];
};

const fallbackItems: BulletinItem[] = [
  {
    title: "IEA projects global oil demand growth moderating as efficiency and EV adoption scale.",
    link: "https://www.iea.org/reports/oil-market-report",
    source: "IEA Oil Market Report",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "IMO decarbonization rules continue to reshape bunker fuel and maritime logistics strategies.",
    link: "https://www.imo.org/en/MediaCentre/HotTopics/Pages/Decarbonization.aspx",
    source: "International Maritime Organization",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Middle East downstream and circular-economy investments remain active across refining corridors.",
    link: "https://www.reuters.com/markets/commodities/",
    source: "Reuters Commodities",
    publishedAt: new Date().toISOString(),
  },
];

function formatTimeAgo(dateValue: string): string {
  const ms = Date.now() - new Date(dateValue).getTime();
  const mins = Math.max(1, Math.round(ms / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function LiveBulletinBoard() {
  const [items, setItems] = useState<BulletinItem[]>(fallbackItems);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchBulletin = async () => {
      try {
        const response = await fetch("/api/live-bulletin");
        if (!response.ok) return;

        const payload = (await response.json()) as BulletinResponse;
        if (!mounted) return;
        setItems(payload.items);
        setUpdatedAt(payload.updatedAt);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBulletin();
    const intervalId = window.setInterval(() => {
      fetchBulletin();
      setRefreshTick((prev) => prev + 1);
    }, 120000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const rotatingItems = useMemo(() => items.slice(0, 6), [items]);

  return (
    <section className="py-14 border-y border-white/10 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl md:text-3xl font-display text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Live Oil & Gas Bulletin
          </h2>
          <p className="text-xs font-tech uppercase tracking-[0.2em] text-gray-300 flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            {loading ? "Refreshing..." : `Auto-refresh every 2 minutes`}
          </p>
        </div>

        {updatedAt ? (
          <p className="text-xs text-gray-400 mb-5">
            Last update: {new Date(updatedAt).toLocaleString()}
          </p>
        ) : null}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rotatingItems.map((item, index) => (
            <motion.a
              key={`${item.link}-${refreshTick}-${index}`}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="link-premium group"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary mb-2 font-tech">
                {item.source}
              </p>
              <p className="text-sm text-white leading-relaxed group-hover:text-orange-100 transition-colors">
                {item.title}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{formatTimeAgo(item.publishedAt)}</span>
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
