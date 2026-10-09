import { INDUSTRIES } from "./buyBox";
import type { RevenueEstimate } from "./types";

const REVENUE_PER_EMPLOYEE: Record<(typeof INDUSTRIES)[number], number> = {
  HVAC: 220_000,
  Plumbing: 200_000,
  Electrical: 210_000,
  "Pest Control": 140_000,
  "Commercial Landscaping": 110_000,
  "Fire Protection": 190_000,
  Roofing: 230_000,
  "Commercial Cleaning": 70_000,
  "Specialty Manufacturing": 240_000,
  "IT Managed Services": 160_000,
};

const FALLBACK_REVENUE_PER_EMPLOYEE = 150_000;

export function estimateRevenue(industry: string, employees: number | null): RevenueEstimate {
  if (employees == null || employees <= 0) {
    return { low: null, high: null, midpoint: null, confidence: "low" };
  }

  const known = industry in REVENUE_PER_EMPLOYEE;
  const perEmployee = known
    ? REVENUE_PER_EMPLOYEE[industry as keyof typeof REVENUE_PER_EMPLOYEE]
    : FALLBACK_REVENUE_PER_EMPLOYEE;
  const midpoint = employees * perEmployee;

  return {
    low: Math.round(midpoint * 0.82),
    high: Math.round(midpoint * 1.18),
    midpoint,
    confidence: known ? "high" : "medium",
  };
}
