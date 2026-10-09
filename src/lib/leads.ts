import { IN_BOX_SCORE } from "./scoring";
import type { PublicLead } from "./types";

export function isInBox(lead: Pick<PublicLead, "fitScore">): boolean {
  return lead.fitScore >= IN_BOX_SCORE;
}

export function isNewInBox(lead: Pick<PublicLead, "fitScore" | "status">): boolean {
  return isInBox(lead) && lead.status === "new";
}

export function countNewInBox(leads: Array<Pick<PublicLead, "fitScore" | "status">>): number {
  return leads.filter(isNewInBox).length;
}

export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
