export function formatMoney(value: number): string {
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) {
    const millions = absolute / 1_000_000;
    const text = millions >= 10 ? millions.toFixed(0) : millions.toFixed(1);
    return `${sign}$${text}M`;
  }
  if (absolute >= 1_000) return `${sign}$${Math.round(absolute / 1000)}K`;
  return `${sign}$${Math.round(absolute)}`;
}

export function formatRange(low: number | null, high: number | null): string {
  if (low == null || high == null) return "Unknown";
  return `${formatMoney(low)}–${formatMoney(high)}`;
}

export function formatLocation(city: string, state: string): string {
  if (city && state) return `${city}, ${state}`;
  return city || state || "—";
}

export function millionsToDollars(millions: number): number {
  return Math.round(millions * 1_000_000);
}

export function dollarsToMillions(dollars: number): number {
  return dollars / 1_000_000;
}

export function websiteHref(website: string, domain: string): string | null {
  if (website.trim()) {
    return website.startsWith("http") ? website : `https://${website}`;
  }
  if (domain.trim()) return `https://${domain}`;
  return null;
}

export function confidenceLabel(confidence: "low" | "medium" | "high"): string {
  if (confidence === "high") return "Benchmarked";
  if (confidence === "medium") return "Rough";
  return "Unknown";
}

export function spokenIndustry(industry: string): string {
  if (industry === "HVAC") return "HVAC";
  if (industry === "IT Managed Services") return "IT managed services";
  return industry.toLowerCase();
}

export function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
