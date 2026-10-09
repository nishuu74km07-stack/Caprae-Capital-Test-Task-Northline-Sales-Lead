import type { RawRecord, SourceName } from "./types";
import { asSource } from "./buyBox";

export function saneYear(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const year = Math.round(value);
  const current = new Date().getFullYear();
  if (year < 1900 || year > current) return null;
  return year;
}

export function saneCount(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const count = Math.round(value);
  if (count <= 0 || count > 100_000) return null;
  return count;
}

export function makeRecord(
  input: Partial<RawRecord> & Pick<RawRecord, "id" | "listedName" | "industry" | "city" | "state">,
): RawRecord {
  const domain = (input.domain ?? "").trim().toLowerCase();
  return {
    id: input.id,
    source: input.source ?? "Google Maps",
    listedName: input.listedName,
    website: (input.website ?? "").trim() || (domain ? `https://${domain}` : ""),
    domain,
    industry: input.industry,
    city: input.city,
    state: input.state,
    employees: saneCount(input.employees ?? null),
    founded: saneYear(input.founded ?? null),
    ownerName: input.ownerName ?? "",
    ownerTitle: input.ownerTitle ?? "",
    publicPhone: input.publicPhone ?? "",
    description: input.description ?? "",
    signal: input.signal ?? "",
    isFranchise: input.isFranchise ?? false,
    email: input.email ?? "",
    directPhone: input.directPhone ?? "",
    linkedin: input.linkedin ?? "",
    ownerTenure: input.ownerTenure == null ? null : saneCount(input.ownerTenure),
  };
}

export function parseSource(value: string): SourceName {
  return asSource(value);
}
