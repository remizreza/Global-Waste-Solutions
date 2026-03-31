import os
import sys
from typing import Optional

import requests

ALPHA_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "").strip()
COMMODITY_KEY = os.getenv("COMMODITIES_API_KEY", "").strip()

BBL_TO_MT = 7.33
LO_PERCENT = 0.75
LWO_PERCENT = 0.959


def get_brent() -> Optional[float]:
    if not ALPHA_KEY:
        print("Missing ALPHA_VANTAGE_API_KEY")
        return None

    url = "https://www.alphavantage.co/query"
    params = {
        "function": "BRENT",
        "interval": "daily",
        "apikey": ALPHA_KEY,
    }

    try:
        res = requests.get(url, params=params, timeout=20)
        res.raise_for_status()
        payload = res.json()
        latest = payload["data"][0]
        return float(latest["value"])
    except Exception as exc:
        print(f"Error fetching Brent: {exc}")
        return None


def get_dubai() -> Optional[float]:
    if not COMMODITY_KEY:
        print("Missing COMMODITIES_API_KEY")
        return None

    url = "https://api.commodities-api.com/latest"
    params = {
        "access_key": COMMODITY_KEY,
        "base": "USD",
        "symbols": "DBLc1",
    }

    try:
        res = requests.get(url, params=params, timeout=20)
        res.raise_for_status()
        payload = res.json()
        return float(payload["data"]["rates"]["DBLc1"])
    except Exception as exc:
        print(f"Error fetching Dubai proxy: {exc}")
        return None


def convert_to_mt(price_per_bbl: float) -> float:
    return price_per_bbl * BBL_TO_MT


def main() -> int:
    print("\nREDOXY LIVE PRICING ENGINE\n")

    brent = get_brent()
    dubai = get_dubai()

    if brent is not None:
        brent_mt = convert_to_mt(brent)
        lo_price = brent_mt * LO_PERCENT
        lwo_price = brent_mt * LWO_PERCENT

        print(f"Brent: ${brent:.2f}/bbl")
        print(f"Brent: ${brent_mt:.2f}/MT\n")
        print("REDOXY PRICING:")
        print(f"Light Oil (75%): ${lo_price:.2f}/MT + transport")
        print(f"LWO (95.9%): ${lwo_price:.2f}/MT + transport\n")

    if dubai is not None:
        dubai_mt = convert_to_mt(dubai)
        print(f"Dubai Proxy: ${dubai:.2f}/bbl")
        print(f"Dubai: ${dubai_mt:.2f}/MT\n")

    if brent is None and dubai is None:
        print("No live pricing returned because the required API keys are not configured.")
        return 1

    print("Done.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
