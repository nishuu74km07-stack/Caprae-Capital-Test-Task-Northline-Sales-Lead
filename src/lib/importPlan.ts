import { ingest } from "./assemble";
import { matchesCompany } from "./dedupe";
import type { CompanyFacts, RawRecord } from "./types";

export type ImportPlan = {
  additions: CompanyFacts[];
  merges: { companyId: string; record: RawRecord }[];
  unchanged: number;
};

export function planImport(existing: CompanyFacts[], incoming: RawRecord[]): ImportPlan {
  const companies = existing.map((company) => ({ ...company, sources: [...company.sources] }));
  const additions: CompanyFacts[] = [];
  const merges: { companyId: string; record: RawRecord }[] = [];
  let unchanged = 0;

  for (const record of incoming) {
    const match = companies.find((company) => matchesCompany(record, company));
    if (!match) {
      const created = ingest([record]).companies[0];
      companies.push(created);
      additions.push(created);
      continue;
    }

    const already = match.sources.some(
      (source) => source.source === record.source && source.listedName.toLowerCase() === record.listedName.toLowerCase(),
    );
    if (already) {
      unchanged += 1;
      continue;
    }

    merges.push({ companyId: match.id, record });
    match.sources.push({
      id: record.id,
      source: record.source,
      listedName: record.listedName,
      position: match.sources.length,
    });
    if (!match.publicPhone) match.publicPhone = record.publicPhone;
    if (!match.domain) match.domain = record.domain;
  }

  return { additions, merges, unchanged };
}
