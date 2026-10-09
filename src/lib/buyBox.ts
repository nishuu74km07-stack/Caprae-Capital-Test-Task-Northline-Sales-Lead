import type { BuyBox, SourceName } from "./types";
import { SOURCE_NAMES } from "./types";

export const INDUSTRIES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Pest Control",
  "Commercial Landscaping",
  "Fire Protection",
  "Roofing",
  "Commercial Cleaning",
  "Specialty Manufacturing",
  "IT Managed Services",
] as const;

export const STATES = ["TX", "FL", "GA", "NC", "AZ", "TN", "SC", "CO", "OH", "CA"] as const;

const INDUSTRY_SET = new Set<string>(INDUSTRIES);
const STATE_SET = new Set<string>(STATES);

export const defaultBuyBox: BuyBox = {
  searcherName: "Alex Morgan",
  firmName: "Northline Search",
  industries: ["HVAC", "Plumbing", "Electrical", "Pest Control", "Commercial Landscaping", "Fire Protection"],
  states: ["TX", "FL", "GA", "NC", "AZ", "TN"],
  revenueMin: 2_000_000,
  revenueMax: 15_000_000,
  employeesMin: 8,
  employeesMax: 80,
  minYears: 8,
  ownerOnly: true,
  creditAllowance: 20,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function asNumber(value: unknown, fallback: number): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeBuyBox(input: Partial<BuyBox>): BuyBox {
  const industries = (input.industries ?? [...defaultBuyBox.industries]).filter((industry) => INDUSTRY_SET.has(industry));
  if (industries.length === 0) {
    throw new Error("Pick at least one industry.");
  }

  const states = (input.states ?? [...defaultBuyBox.states]).filter((state) => STATE_SET.has(state));
  let revenueMin = asNumber(input.revenueMin, defaultBuyBox.revenueMin);
  let revenueMax = asNumber(input.revenueMax, defaultBuyBox.revenueMax);
  if (revenueMin > revenueMax) [revenueMin, revenueMax] = [revenueMax, revenueMin];

  let employeesMin = Math.round(asNumber(input.employeesMin, defaultBuyBox.employeesMin));
  let employeesMax = Math.round(asNumber(input.employeesMax, defaultBuyBox.employeesMax));
  if (employeesMin > employeesMax) [employeesMin, employeesMax] = [employeesMax, employeesMin];

  const searcherName = (input.searcherName ?? "").trim() || defaultBuyBox.searcherName;
  const firmName = (input.firmName ?? "").trim() || defaultBuyBox.firmName;

  return {
    searcherName,
    firmName,
    industries,
    states,
    revenueMin: Math.max(0, Math.round(revenueMin)),
    revenueMax: Math.max(0, Math.round(revenueMax)),
    employeesMin: Math.max(1, employeesMin),
    employeesMax: Math.max(1, employeesMax),
    minYears: clamp(Math.round(asNumber(input.minYears, defaultBuyBox.minYears)), 0, 80),
    ownerOnly: input.ownerOnly === undefined ? defaultBuyBox.ownerOnly : Boolean(input.ownerOnly),
    creditAllowance: clamp(Math.round(asNumber(input.creditAllowance, defaultBuyBox.creditAllowance)), 5, 100),
  };
}

export function asSource(value: string): SourceName {
  const match = SOURCE_NAMES.find((name) => name.toLowerCase() === value.trim().toLowerCase());
  return match ?? "Industry Directory";
}
