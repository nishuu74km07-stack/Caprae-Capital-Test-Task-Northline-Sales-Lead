import type { LeadStatus, PublicLead } from "./types";

export type LeadFilters = {
  query: string;
  industry: string;
  state: string;
  minScore: number;
  status: "active" | "all" | LeadStatus;
  ownerOnly: boolean;
  hideThin: boolean;
};

export const defaultFilters: LeadFilters = {
  query: "",
  industry: "",
  state: "",
  minScore: 0,
  status: "active",
  ownerOnly: false,
  hideThin: false,
};

export function filtersAreDefault(filters: LeadFilters): boolean {
  return JSON.stringify(filters) === JSON.stringify(defaultFilters);
}

export function filterLeads(leads: PublicLead[], filters: LeadFilters): PublicLead[] {
  const query = filters.query.trim().toLowerCase();
  return leads.filter((lead) => {
    if (filters.status === "active" && lead.status === "passed") return false;
    if (filters.status !== "active" && filters.status !== "all" && lead.status !== filters.status) return false;
    if (filters.industry && lead.industry !== filters.industry) return false;
    if (filters.state && lead.state !== filters.state) return false;
    if (lead.fitScore < filters.minScore) return false;
    if (filters.ownerOnly && !lead.ownerName.trim()) return false;
    if (filters.hideThin && lead.qualityScore < 50) return false;
    if (!query) return true;
    const haystack = [lead.name, lead.city, lead.state, lead.ownerName, lead.industry, lead.domain].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

export function sortLeads<T extends { fitScore: number; qualityScore: number; name: string }>(leads: T[]): T[] {
  return [...leads].sort(
    (left, right) => right.fitScore - left.fitScore || right.qualityScore - left.qualityScore || left.name.localeCompare(right.name),
  );
}

export function uniqueValues(leads: PublicLead[], key: "industry" | "state"): string[] {
  return [...new Set(leads.map((lead) => lead[key]).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}
