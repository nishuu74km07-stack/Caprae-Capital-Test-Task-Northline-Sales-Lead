import type { BuyBox, Lead } from "./types";
import { formatRange, spokenIndustry } from "./format";

export function buildOutreach(lead: Pick<Lead, "ownerName" | "name" | "industry" | "city" | "yearsOperating" | "signal" | "revenue">, buyBox: BuyBox): string {
  const firstName = lead.ownerName.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";
  const years = lead.yearsOperating == null ? `in ${lead.city}` : `for ${lead.yearsOperating} years in ${lead.city}`;
  const revenue =
    lead.revenue.midpoint == null
      ? ""
      : `Public headcount puts revenue around ${formatRange(lead.revenue.low, lead.revenue.high)}.`;
  const observation = lead.signal.trim() || `${lead.name} showed up as an owner-operated ${spokenIndustry(lead.industry)} company.`;

  return [
    greeting,
    "",
    `I'm ${buyBox.searcherName} with ${buyBox.firmName}. I look for ${spokenIndustry(lead.industry)} companies in the ${formatRange(buyBox.revenueMin, buyBox.revenueMax)} range, and I write to owners directly.`,
    "",
    `${lead.name} has been operating ${years}. ${observation}`,
    revenue,
    "",
    "If a conversation about what comes next would ever be useful, even a few years from now, I would value fifteen minutes. I will not follow this with a weekly sequence.",
    "",
    buyBox.searcherName,
    buyBox.firmName,
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
