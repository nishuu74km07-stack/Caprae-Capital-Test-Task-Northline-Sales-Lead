import { dedupe, toCompanyFacts } from "./dedupe";
import { estimateRevenue } from "./revenue";
import { scoreQuality } from "./quality";
import { scoreFit } from "./scoring";
import { isValidUsPhone } from "./phone";
import type { BuyBox, CompanyFacts, Lead, RawRecord, SavedLeadState } from "./types";

export function ingest(records: RawRecord[]): { companies: CompanyFacts[]; scrapeOrder: string[] } {
  const { groups, canonicalIdByRecordId } = dedupe(records);
  const positionOf = new Map(records.map((record, index) => [record.id, index]));
  return {
    companies: groups.map((group) => toCompanyFacts(group, positionOf)),
    scrapeOrder: records.map((record) => canonicalIdByRecordId.get(record.id) ?? record.id),
  };
}

export function toLead(company: CompanyFacts, buyBox: BuyBox, saved: SavedLeadState): Lead {
  const currentYear = new Date().getFullYear();
  const yearsOperating = company.founded == null ? null : Math.max(0, currentYear - company.founded);
  const revenue = estimateRevenue(company.industry, company.employees);
  const fit = scoreFit(
    {
      industry: company.industry,
      state: company.state,
      employees: company.employees,
      yearsOperating,
      ownerName: company.ownerName,
      ownerTitle: company.ownerTitle,
      isFranchise: company.isFranchise,
      revenue,
    },
    buyBox,
  );
  const quality = scoreQuality(company);

  return {
    id: company.id,
    name: company.name,
    website: company.website,
    domain: company.domain,
    industry: company.industry,
    city: company.city,
    state: company.state,
    employees: company.employees,
    founded: company.founded,
    yearsOperating,
    ownerName: company.ownerName,
    ownerTitle: company.ownerTitle,
    publicPhone: company.publicPhone,
    phoneValid: isValidUsPhone(company.publicPhone),
    description: company.description,
    signal: company.signal,
    isFranchise: company.isFranchise,
    sources: company.sources,
    status: saved.status,
    enriched: saved.enriched,
    revenue,
    fitScore: fit.fitScore,
    fitReasons: fit.fitReasons,
    qualityScore: quality.score,
    qualityNotes: quality.notes,
    email: company.email,
    directPhone: company.directPhone,
    linkedin: company.linkedin,
    ownerTenure: company.ownerTenure,
    outreachDraft: saved.outreachDraft,
  };
}

export function assemble(records: RawRecord[], buyBox: BuyBox): { leads: Lead[]; scrapeOrder: string[] } {
  const ingested = ingest(records);
  const leads = ingested.companies.map((company) =>
    toLead(company, buyBox, { status: "new", enriched: false, outreachDraft: "" }),
  );
  return { leads, scrapeOrder: ingested.scrapeOrder };
}
