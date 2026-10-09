import { IN_BOX_SCORE } from "./scoring";
import { compareCredits, comparisonSentence } from "./stats";
import type { BuyBox } from "./types";

type ReportLead = {
  id: string;
  name: string;
  fitScore: number;
  city?: string;
  state?: string;
};

export function buildCreditReport(input: {
  buyBox: BuyBox;
  leads: ReportLead[];
  scrapeOrder: string[];
  budget?: number;
}): string {
  const budget = input.budget ?? input.buyBox.creditAllowance;
  const comparison = compareCredits(input.leads, input.scrapeOrder, budget);
  const gap = comparison.rankedInBox - comparison.scrapeOrderInBox;
  const inBox = input.leads.filter((lead) => lead.fitScore >= IN_BOX_SCORE);
  const byId = new Map(input.leads.map((lead) => [lead.id, lead]));
  const rankedNames = [...input.leads]
    .sort((left, right) => right.fitScore - left.fitScore)
    .slice(0, budget)
    .filter((lead) => lead.fitScore >= IN_BOX_SCORE)
    .map((lead) => `- ${lead.name} (${lead.fitScore}) · ${lead.city}, ${lead.state}`);
  const scrapeNames = comparison.scrapeOrderInBoxIds.map((id) => {
    const lead = byId.get(id);
    return lead ? `- ${lead.name} (${lead.fitScore})` : `- ${id}`;
  });

  return [
    "# Northline credit savings report",
    "",
    `Firm: ${input.buyBox.firmName}`,
    `Searcher: ${input.buyBox.searcherName}`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "## Problem",
    "A SaaSquatch-style scrape arrives in source order. Enriching down that file burns credits on duplicates, franchises, and out-of-box companies before the right owners appear.",
    "",
    "## Result on this list",
    comparisonSentence(comparison),
    "",
    `| Metric | Value |`,
    `| --- | --- |`,
    `| Credit budget | ${budget} |`,
    `| Companies on file | ${input.leads.length} |`,
    `| Inside buy box (${IN_BOX_SCORE}+) | ${inBox.length} |`,
    `| Scrape-order in-box hits | ${comparison.scrapeOrderInBox} |`,
    `| Ranked-queue in-box hits | ${comparison.rankedInBox} |`,
    `| Extra owners reached | +${gap} |`,
    `| Duplicate credit waste in scrape order | ${comparison.duplicateSpend} |`,
    "",
    "## Buy box",
    `- Industries: ${input.buyBox.industries.join(", ")}`,
    `- States: ${input.buyBox.states.length ? input.buyBox.states.join(", ") : "Any"}`,
    `- Revenue: ${input.buyBox.revenueMin} – ${input.buyBox.revenueMax}`,
    `- Employees: ${input.buyBox.employeesMin} – ${input.buyBox.employeesMax}`,
    `- Min years: ${input.buyBox.minYears}`,
    `- Owner required: ${input.buyBox.ownerOnly ? "yes" : "no"}`,
    "",
    "## In-box hits if you enrich in scrape order",
    ...(scrapeNames.length ? scrapeNames : ["- None in the first credits"]),
    "",
    "## In-box hits if you enrich the ranked queue",
    ...(rankedNames.length ? rankedNames : ["- None in this budget"]),
    "",
    "## Recommendation",
    "Keep scraping wide. Rank against the buy box before spending a credit. Enrich only the credit line (75+), then call.",
    "",
  ].join("\n");
}

export function downloadText(filename: string, contents: string, type = "text/markdown;charset=utf-8") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
