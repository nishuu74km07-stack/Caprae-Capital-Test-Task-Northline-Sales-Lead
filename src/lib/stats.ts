import { IN_BOX_SCORE } from "./scoring";
import type { CreditComparison, IndustryStat, Lead, Stats } from "./types";

type Comparable = {
  id: string;
  fitScore: number;
};

export function compareCredits(leads: Comparable[], scrapeOrder: string[], budget: number): CreditComparison {
  const byId = new Map(leads.map((lead) => [lead.id, lead]));
  const seen = new Set<string>();
  let spent = 0;
  let scrapeOrderInBox = 0;
  let duplicateSpend = 0;
  const scrapeOrderInBoxIds: string[] = [];

  for (const id of scrapeOrder) {
    if (spent >= budget) break;
    spent += 1;
    if (seen.has(id)) {
      duplicateSpend += 1;
      continue;
    }
    seen.add(id);
    const lead = byId.get(id);
    if (lead && lead.fitScore >= IN_BOX_SCORE) {
      scrapeOrderInBox += 1;
      scrapeOrderInBoxIds.push(id);
    }
  }

  const rankedInBox = [...leads]
    .sort((left, right) => right.fitScore - left.fitScore)
    .slice(0, budget)
    .filter((lead) => lead.fitScore >= IN_BOX_SCORE).length;

  return { budget, scrapeOrderInBox, rankedInBox, duplicateSpend, scrapeOrderInBoxIds };
}

export function comparisonSentence(comparison: CreditComparison): string {
  const duplicate =
    comparison.duplicateSpend === 0
      ? ""
      : comparison.duplicateSpend === 1
        ? " One of those scrape-order credits hits a company already in the file."
        : ` ${comparison.duplicateSpend} of those scrape-order credits hit a company already in the file.`;
  return `A ${comparison.budget}-credit budget spent in scrape order reaches ${comparison.scrapeOrderInBox} buy-box companies. The same budget on the ranked queue reaches ${comparison.rankedInBox}.${duplicate}`;
}

export function summarize(leads: Lead[], scrapeOrder: string[], allowance: number): Omit<Stats, "queue" | "comparisonSentence"> & {
  queueIds: string[];
  comparisonSentence: string;
} {
  const inBoxLeads = leads.filter((lead) => lead.fitScore >= IN_BOX_SCORE);
  const used = leads.filter((lead) => lead.enriched).length;
  const industries = new Map<string, IndustryStat>();

  for (const lead of leads) {
    const current = industries.get(lead.industry) ?? { industry: lead.industry || "Unknown", total: 0, inBox: 0 };
    current.total += 1;
    if (lead.fitScore >= IN_BOX_SCORE) current.inBox += 1;
    industries.set(lead.industry, current);
  }

  const creditComparison = compareCredits(leads, scrapeOrder, allowance);
  const queueIds = [...leads]
    .filter((lead) => lead.fitScore >= IN_BOX_SCORE && (lead.status === "new" || lead.status === "shortlisted"))
    .sort((left, right) => right.fitScore - left.fitScore || right.qualityScore - left.qualityScore || left.name.localeCompare(right.name))
    .slice(0, 5)
    .map((lead) => lead.id);

  return {
    rawCount: scrapeOrder.length,
    companyCount: leads.length,
    duplicatesRemoved: Math.max(0, scrapeOrder.length - leads.length),
    inBox: inBoxLeads.length,
    stillToCall: inBoxLeads.filter((lead) => lead.status === "new" || lead.status === "shortlisted").length,
    shortlisted: leads.filter((lead) => lead.status === "shortlisted").length,
    outreach: leads.filter((lead) => lead.status === "outreach").length,
    conversations: leads.filter((lead) => lead.status === "conversation").length,
    passed: leads.filter((lead) => lead.status === "passed").length,
    enriched: used,
    withOwner: inBoxLeads.filter((lead) => lead.ownerName.trim()).length,
    credits: {
      allowance,
      used,
      remaining: Math.max(0, allowance - used),
    },
    creditComparison,
    comparisonSentence: comparisonSentence(creditComparison),
    byIndustry: [...industries.values()].sort((left, right) => right.inBox - left.inBox || right.total - left.total || left.industry.localeCompare(right.industry)),
    queueIds,
  };
}
