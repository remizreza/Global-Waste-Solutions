import { useEffect, useMemo, useState } from "react";

type CommodityQuote = {
  label: string;
  price: number;
  direction: "up" | "down";
};

const fallbackQuotes: CommodityQuote[] = [
  { label: "CRUDE", price: 84.2, direction: "up" },
  { label: "DIESEL", price: 96.5, direction: "down" },
  { label: "NAPHTHA", price: 71.4, direction: "up" },
  { label: "RECOVERY OILS", price: 62.3, direction: "up" },
];

function formatQuote(quote: CommodityQuote) {
  const symbol = quote.direction === "down" ? "Down" : "Up";
  return `${quote.label} $${quote.price.toFixed(2)} ${symbol}`;
}

export default function LiveCommodityTicker() {
  const [quotes, setQuotes] = useState<CommodityQuote[]>(fallbackQuotes);

  useEffect(() => {
    let cancelled = false;

    const fetchQuotes = async () => {
      try {
        const response = await fetch("/api/commodities");
        if (!response.ok) throw new Error("Ticker data unavailable");
        const data = (await response.json()) as {
          crude: number;
          diesel: number;
          naphtha: number;
          recoveryOils: number;
        };
        if (cancelled) return;
        setQuotes([
          { label: "CRUDE", price: data.crude, direction: "up" },
          { label: "DIESEL", price: data.diesel, direction: "down" },
          { label: "NAPHTHA", price: data.naphtha, direction: "up" },
          { label: "RECOVERY OILS", price: data.recoveryOils, direction: "up" },
        ]);
      } catch {
        // Keep fallback values
      }
    };

    fetchQuotes();
    return () => {
      cancelled = true;
    };
  }, []);

  const tickerText = useMemo(() => {
    return quotes.map(formatQuote).join(" | ");
  }, [quotes]);

  return (
    <div className="section-shell relative overflow-hidden rounded-[1.5rem] px-4 py-4">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(255,107,26,0.14),transparent_45%)]" />
      </div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="section-label text-[10px]">Live Market Pulse</p>
        <p className="text-[10px] font-tech uppercase tracking-[0.22em] text-gray-400">Energy + Recovery Commodities</p>
      </div>
      <div className="ticker-track whitespace-nowrap">
        <span className="ticker-text">{tickerText}</span>
        <span className="ticker-text" aria-hidden="true">
          {tickerText}
        </span>
      </div>
    </div>
  );
}
