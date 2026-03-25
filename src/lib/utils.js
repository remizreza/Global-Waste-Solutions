import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getRegionCurrency() {
  if (typeof window === "undefined") {
    return "AED";
  }

  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes("uae.")) {
    return "AED";
  }

  if (hostname.includes("ksa.")) {
    return "SAR";
  }

  return "AED";
}

export function formatCurrency(value, currency = getRegionCurrency()) {
  const locale = currency === "SAR" ? "en-SA" : "en-AE";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
