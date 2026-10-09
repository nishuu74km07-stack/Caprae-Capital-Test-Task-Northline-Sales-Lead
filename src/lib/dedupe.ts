import { nationalDigits } from "./phone";
import type { CompanyFacts, RawRecord } from "./types";

export type CompanyIdentity = {
  listedName: string;
  city: string;
  state: string;
  publicPhone: string;
  domain: string;
};

const NAME_STOP_WORDS = new Set([
  "llc",
  "inc",
  "incorporated",
  "co",
  "company",
  "corp",
  "corporation",
  "ltd",
  "limited",
  "the",
  "and",
]);

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !NAME_STOP_WORDS.has(word))
    .join(" ");
}

function tokens(name: string): Set<string> {
  return new Set(normalizeName(name).split(" ").filter((word) => word.length > 2));
}

export function namesLikelySame(left: string, right: string): boolean {
  const a = tokens(left);
  const b = tokens(right);
  if (a.size === 0 || b.size === 0) return false;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  const union = a.size + b.size - shared;
  return union > 0 && shared / union >= 0.67;
}

export function isSameCompany(left: CompanyIdentity, right: CompanyIdentity): boolean {
  const leftPhone = nationalDigits(left.publicPhone);
  const rightPhone = nationalDigits(right.publicPhone);
  if (leftPhone && leftPhone === rightPhone) return true;

  const leftDomain = left.domain.trim().toLowerCase();
  const rightDomain = right.domain.trim().toLowerCase();
  if (leftDomain && leftDomain === rightDomain) return true;

  return (
    left.state.trim().toUpperCase() === right.state.trim().toUpperCase() &&
    left.city.trim().toLowerCase() === right.city.trim().toLowerCase() &&
    namesLikelySame(left.listedName, right.listedName)
  );
}

function completeness(record: RawRecord): number {
  return [
    record.ownerName,
    record.ownerTitle,
    record.website,
    record.domain,
    record.publicPhone,
    record.description,
    record.signal,
    record.email,
    record.directPhone,
    record.linkedin,
    record.employees,
    record.founded,
    record.ownerTenure,
  ].filter((value) => value !== null && value !== undefined && value !== "").length;
}

function pickCanonical(records: RawRecord[]): RawRecord {
  return [...records].sort((left, right) => {
    const byFields = completeness(right) - completeness(left);
    if (byFields !== 0) return byFields;
    return right.listedName.length - left.listedName.length;
  })[0];
}

function firstText(records: RawRecord[], key: "website" | "domain" | "industry" | "city" | "state" | "ownerName" | "ownerTitle" | "publicPhone" | "description" | "signal" | "email" | "directPhone" | "linkedin"): string {
  for (const record of records) {
    const value = record[key].trim();
    if (value) return key === "domain" ? value.toLowerCase() : value;
  }
  return "";
}

function firstNumber(records: RawRecord[], key: "employees" | "founded" | "ownerTenure"): number | null {
  for (const record of records) {
    const value = record[key];
    if (typeof value === "number") return value;
  }
  return null;
}

export type DedupeGroup = {
  records: RawRecord[];
  canonical: RawRecord;
};

export function dedupe(records: RawRecord[]): { groups: DedupeGroup[]; canonicalIdByRecordId: Map<string, string> } {
  const parent = records.map((_, index) => index);

  function find(index: number): number {
    let cursor = index;
    while (parent[cursor] !== cursor) {
      parent[cursor] = parent[parent[cursor]];
      cursor = parent[cursor];
    }
    return cursor;
  }

  function union(left: number, right: number) {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
  }

  for (let left = 0; left < records.length; left += 1) {
    for (let right = left + 1; right < records.length; right += 1) {
      if (find(left) !== find(right) && isSameCompany(records[left], records[right])) union(left, right);
    }
  }

  const grouped = new Map<number, RawRecord[]>();
  records.forEach((record, index) => {
    const root = find(index);
    const list = grouped.get(root) ?? [];
    list.push(record);
    grouped.set(root, list);
  });

  const groups = [...grouped.values()].map((list) => ({ records: list, canonical: pickCanonical(list) }));
  const canonicalIdByRecordId = new Map<string, string>();
  for (const group of groups) {
    for (const record of group.records) canonicalIdByRecordId.set(record.id, group.canonical.id);
  }

  return { groups, canonicalIdByRecordId };
}

export function toCompanyFacts(group: DedupeGroup, positionOf: Map<string, number>): CompanyFacts {
  const ordered = [group.canonical, ...group.records.filter((record) => record.id !== group.canonical.id)];
  return {
    id: group.canonical.id,
    name: group.canonical.listedName,
    website: firstText(ordered, "website"),
    domain: firstText(ordered, "domain"),
    industry: firstText(ordered, "industry"),
    city: firstText(ordered, "city"),
    state: firstText(ordered, "state").toUpperCase(),
    employees: firstNumber(ordered, "employees"),
    founded: firstNumber(ordered, "founded"),
    ownerName: firstText(ordered, "ownerName"),
    ownerTitle: firstText(ordered, "ownerTitle"),
    publicPhone: firstText(ordered, "publicPhone"),
    description: firstText(ordered, "description"),
    signal: firstText(ordered, "signal"),
    isFranchise: group.records.some((record) => record.isFranchise),
    email: firstText(ordered, "email"),
    directPhone: firstText(ordered, "directPhone"),
    linkedin: firstText(ordered, "linkedin"),
    ownerTenure: firstNumber(ordered, "ownerTenure"),
    sources: group.records
      .map((record) => ({
        id: record.id,
        source: record.source,
        listedName: record.listedName,
        position: positionOf.get(record.id) ?? 0,
      }))
      .sort((left, right) => left.position - right.position),
  };
}

export function matchesCompany(record: RawRecord, company: CompanyFacts): boolean {
  const names = [company.name, ...company.sources.map((source) => source.listedName)];
  return names.some((listedName) =>
    isSameCompany(record, {
      listedName,
      city: company.city,
      state: company.state,
      publicPhone: company.publicPhone,
      domain: company.domain,
    }),
  );
}
