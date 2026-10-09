import type { BuyBox, ScoreReason } from "./types";
import type { RevenueEstimate } from "./types";
import { formatMoney, formatRange } from "./format";

export const IN_BOX_SCORE = 75;
export const FRANCHISE_PENALTY = 35;
export const MISSING_OWNER_PENALTY = 20;

type ScoreInput = {
  industry: string;
  state: string;
  employees: number | null;
  yearsOperating: number | null;
  ownerName: string;
  ownerTitle: string;
  isFranchise: boolean;
  revenue: RevenueEstimate;
};

function nearBand(value: number, min: number, max: number): boolean {
  const low = min * 0.8;
  const high = max * 1.2;
  return value >= low && value <= high;
}

function employeePartial(value: number, min: number, max: number): boolean {
  return value >= min * 0.6 && value <= max * 1.25;
}

export function scoreFit(input: ScoreInput, buyBox: BuyBox): { fitScore: number; fitReasons: ScoreReason[] } {
  const reasons: ScoreReason[] = [];

  const industryHit = buyBox.industries.includes(input.industry);
  reasons.push({
    label: industryHit ? `${input.industry} is in the buy box` : `${input.industry || "Unknown industry"} is outside the buy box`,
    points: industryHit ? 30 : 0,
    applied: industryHit,
  });

  const midpoint = input.revenue.midpoint;
  if (midpoint != null && midpoint >= buyBox.revenueMin && midpoint <= buyBox.revenueMax) {
    reasons.push({
      label: `Revenue ${formatRange(input.revenue.low, input.revenue.high)} is inside ${formatMoney(buyBox.revenueMin)}–${formatMoney(buyBox.revenueMax)}`,
      points: 25,
      applied: true,
    });
  } else if (midpoint != null && nearBand(midpoint, buyBox.revenueMin, buyBox.revenueMax)) {
    reasons.push({
      label: `Revenue ${formatMoney(midpoint)} sits just outside the buy box`,
      points: 12,
      applied: true,
    });
  } else {
    reasons.push({
      label: midpoint == null ? "Revenue is unknown" : `Revenue ${formatMoney(midpoint)} is outside the buy box`,
      points: 0,
      applied: false,
    });
  }

  const stateHit = buyBox.states.length === 0 || buyBox.states.includes(input.state);
  reasons.push({
    label: stateHit
      ? buyBox.states.length === 0
        ? "No state limit on the buy box"
        : `${input.state} is in the buy box`
      : `${input.state || "Unknown state"} is outside the buy box`,
    points: stateHit ? 15 : 0,
    applied: stateHit,
  });

  if (input.employees != null && input.employees >= buyBox.employeesMin && input.employees <= buyBox.employeesMax) {
    reasons.push({
      label: `${input.employees} employees is inside ${buyBox.employeesMin}–${buyBox.employeesMax}`,
      points: 10,
      applied: true,
    });
  } else if (input.employees != null && employeePartial(input.employees, buyBox.employeesMin, buyBox.employeesMax)) {
    reasons.push({
      label: `${input.employees} employees is close to the headcount band`,
      points: 5,
      applied: true,
    });
  } else {
    reasons.push({
      label: input.employees == null ? "Headcount is missing" : `${input.employees} employees is outside the band`,
      points: 0,
      applied: false,
    });
  }

  if (input.ownerName.trim()) {
    const title = input.ownerTitle.trim() || "owner";
    reasons.push({
      label: `${input.ownerName.trim()} is listed as ${title}`,
      points: 10,
      applied: true,
    });
  } else {
    reasons.push({ label: "No owner on the public record", points: 0, applied: false });
    if (buyBox.ownerOnly) {
      reasons.push({
        label: "The buy box requires an owner on file",
        points: -MISSING_OWNER_PENALTY,
        applied: true,
      });
    }
  }

  if (input.yearsOperating == null) {
    reasons.push({ label: "Year founded is missing", points: 0, applied: false });
  } else if (input.yearsOperating >= buyBox.minYears) {
    reasons.push({
      label: `${input.yearsOperating} years operating (minimum ${buyBox.minYears})`,
      points: 10,
      applied: true,
    });
  } else {
    reasons.push({
      label: `${input.yearsOperating} years operating is under the ${buyBox.minYears}-year minimum`,
      points: 0,
      applied: false,
    });
  }

  if (input.isFranchise) {
    reasons.push({
      label: "Franchise location. The franchisor usually controls a sale.",
      points: -FRANCHISE_PENALTY,
      applied: true,
    });
  }

  const raw = reasons.reduce((sum, reason) => sum + (reason.applied ? reason.points : 0), 0);
  return { fitScore: Math.max(0, Math.min(100, raw)), fitReasons: reasons };
}
