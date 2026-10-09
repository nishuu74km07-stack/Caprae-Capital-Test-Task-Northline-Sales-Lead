import type { LeadStatus } from "./types";
import { IN_BOX_SCORE } from "./scoring";

export const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "shortlisted", label: "Shortlist" },
  { value: "outreach", label: "Outreach" },
  { value: "conversation", label: "Talking" },
  { value: "passed", label: "Pass" },
];

export const STATUS_FILTERS: { value: "active" | "all" | LeadStatus; label: string }[] = [
  { value: "active", label: "Hide passed" },
  { value: "all", label: "Every status" },
  ...STATUS_OPTIONS,
];

export const SCORE_BANDS = [
  { value: 0, label: "Any score" },
  { value: 60, label: "Review and up (60+)" },
  { value: IN_BOX_SCORE, label: `Credit line (${IN_BOX_SCORE}+)` },
  { value: 85, label: "Call first (85+)" },
] as const;

export function statusLabel(status: LeadStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function statusTone(status: LeadStatus): "good" | "warn" | "muted" | "bad" {
  if (status === "shortlisted" || status === "conversation") return "good";
  if (status === "outreach") return "warn";
  if (status === "passed") return "bad";
  return "muted";
}

export function scoreTone(score: number): "good" | "warn" | "muted" {
  if (score >= 85) return "good";
  if (score >= IN_BOX_SCORE) return "warn";
  return "muted";
}

export function priorityLabel(score: number): string {
  if (score >= 85) return "Call first";
  if (score >= IN_BOX_SCORE) return "Strong fit";
  if (score >= 60) return "Review";
  return "Hold";
}

export function isStatus(value: unknown): value is LeadStatus {
  return STATUS_OPTIONS.some((option) => option.value === value);
}
