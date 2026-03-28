#!/usr/bin/env python3
"""Fetch Brent + Dubai proxy benchmarks and compute REDOXY offer pricing.

Data sources:
- Alpha Vantage Commodities API (`function=BRENT`, daily interval)
- Commodities-API (`symbols=DBLc1`) as a Dubai crude futures proxy

The script intentionally keeps broker market intel as manual inputs so teams can
mix benchmark feeds with real broker/freight context.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ALPHAVANTAGE_BASE_URL = "https://www.alphavantage.co/query"
COMMODITIES_API_BASE_URL = "https://api.commodities-api.com"


@dataclass
class Benchmark:
    name: str
    source: str
    usd_per_bbl: float
    updated_at: str

    def to_metric_ton(self, factor_bbl_per_mt: float) -> float:
        return round(self.usd_per_bbl * factor_bbl_per_mt, 2)


def http_get_json(url: str, timeout: int = 20) -> dict[str, Any]:
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "redoxy-pricing-model/1.0",
        },
    )
    with urlopen(request, timeout=timeout) as response:  # noqa: S310
        payload = response.read().decode("utf-8")
    return json.loads(payload)


def fetch_alpha_vantage_brent(api_key: str) -> Benchmark:
    params = urlencode(
        {
            "function": "BRENT",
            "interval": "daily",
            "apikey": api_key,
        }
    )
    payload = http_get_json(f"{ALPHAVANTAGE_BASE_URL}?{params}")

    daily_data = payload.get("data")
    if not isinstance(daily_data, list) or not daily_data:
        raise RuntimeError(f"Alpha Vantage BRENT response missing data: {payload}")

    latest = daily_data[0]
    if not isinstance(latest, dict):
        raise RuntimeError(f"Alpha Vantage BRENT latest row invalid: {latest}")

    value_raw = latest.get("value")
    date_raw = latest.get("date")

    try:
        value = float(value_raw)
    except (TypeError, ValueError) as exc:
        raise RuntimeError(f"Alpha Vantage BRENT value invalid: {value_raw}") from exc

    date_str = str(date_raw) if date_raw is not None else datetime.now(timezone.utc).date().isoformat()

    return Benchmark(
        name="Brent",
        source="Alpha Vantage",
        usd_per_bbl=round(value, 4),
        updated_at=date_str,
    )


def fetch_commodities_dubai_proxy(api_key: str, date: str | None = None) -> Benchmark:
    endpoint = "/latest" if date is None else f"/{date}"
    params = urlencode(
        {
            "access_key": api_key,
            "base": "USD",
            "symbols": "DBLc1",
        }
    )
    payload = http_get_json(f"{COMMODITIES_API_BASE_URL}{endpoint}?{params}")

    rates = payload.get("rates")
    if not isinstance(rates, dict):
        raise RuntimeError(f"Commodities-API response missing rates: {payload}")

    value_raw = rates.get("DBLc1")
    try:
        value = float(value_raw)
    except (TypeError, ValueError) as exc:
        raise RuntimeError(f"Commodities-API DBLc1 value invalid: {value_raw}") from exc

    if date is not None:
        updated_at = date
    else:
        timestamp = payload.get("timestamp")
        if isinstance(timestamp, int):
            updated_at = datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()
        else:
            updated_at = datetime.now(timezone.utc).isoformat()

    return Benchmark(
        name="Dubai Crude Proxy (DBLc1)",
        source="Commodities-API",
        usd_per_bbl=round(value, 4),
        updated_at=updated_at,
    )


def build_offer(
    benchmark: Benchmark,
    bbl_per_mt_factor: float,
    broker_premium_usd_mt: float,
    freight_usd_mt: float,
    margin_usd_mt: float,
) -> dict[str, Any]:
    benchmark_usd_mt = benchmark.to_metric_ton(bbl_per_mt_factor)
    final_offer = round(
        benchmark_usd_mt + broker_premium_usd_mt + freight_usd_mt + margin_usd_mt,
        2,
    )

    return {
        "benchmark": {
            "name": benchmark.name,
            "source": benchmark.source,
            "usd_per_bbl": benchmark.usd_per_bbl,
            "updated_at": benchmark.updated_at,
            "conversion_factor_bbl_per_mt": bbl_per_mt_factor,
            "converted_usd_per_mt": benchmark_usd_mt,
        },
        "manual_market_intel": {
            "broker_premium_usd_mt": broker_premium_usd_mt,
            "freight_usd_mt": freight_usd_mt,
            "margin_usd_mt": margin_usd_mt,
        },
        "final_offer_usd_mt": final_offer,
        "formula": "benchmark_converted_usd_mt + broker_premium_usd_mt + freight_usd_mt + margin_usd_mt",
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch Brent + Dubai proxy prices and compute a final USD/MT offer.",
    )
    parser.add_argument(
        "--benchmark",
        choices=("brent", "dubai"),
        default="brent",
        help="Benchmark used for final offer conversion (default: brent).",
    )
    parser.add_argument(
        "--commodities-date",
        default=None,
        help="Optional YYYY-MM-DD for a historical DBLc1 pull.",
    )
    parser.add_argument(
        "--bbl-per-mt",
        type=float,
        default=7.33,
        help="Barrel-to-metric-ton conversion factor for selected benchmark.",
    )
    parser.add_argument("--broker-premium", type=float, default=0.0, help="Manual broker premium/discount in USD/MT.")
    parser.add_argument("--freight", type=float, default=0.0, help="Manual freight cost in USD/MT.")
    parser.add_argument("--margin", type=float, default=0.0, help="Target margin in USD/MT.")
    parser.add_argument(
        "--alpha-vantage-key",
        default=os.getenv("ALPHA_VANTAGE_API_KEY"),
        help="Alpha Vantage API key (or set ALPHA_VANTAGE_API_KEY).",
    )
    parser.add_argument(
        "--commodities-key",
        default=os.getenv("COMMODITIES_API_KEY"),
        help="Commodities-API key (or set COMMODITIES_API_KEY).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.alpha_vantage_key:
        print("Missing Alpha Vantage API key. Use --alpha-vantage-key or ALPHA_VANTAGE_API_KEY.", file=sys.stderr)
        return 2

    if not args.commodities_key:
        print("Missing Commodities-API key. Use --commodities-key or COMMODITIES_API_KEY.", file=sys.stderr)
        return 2

    try:
        brent = fetch_alpha_vantage_brent(args.alpha_vantage_key)
        dubai = fetch_commodities_dubai_proxy(args.commodities_key, args.commodities_date)

        selected = brent if args.benchmark == "brent" else dubai
        offer = build_offer(
            benchmark=selected,
            bbl_per_mt_factor=args.bbl_per_mt,
            broker_premium_usd_mt=args.broker_premium,
            freight_usd_mt=args.freight,
            margin_usd_mt=args.margin,
        )

        output = {
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "benchmarks": {
                "brent": {
                    "source": brent.source,
                    "usd_per_bbl": brent.usd_per_bbl,
                    "updated_at": brent.updated_at,
                },
                "dubai_proxy_dblc1": {
                    "source": dubai.source,
                    "usd_per_bbl": dubai.usd_per_bbl,
                    "updated_at": dubai.updated_at,
                    "note": "DBLc1 is a Dubai crude financial futures proxy, not an official Platts physical assessment.",
                },
            },
            "pricing_model": offer,
        }

        print(json.dumps(output, indent=2))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(f"Pricing fetch failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
