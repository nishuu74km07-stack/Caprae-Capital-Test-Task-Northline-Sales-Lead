import { isValidUsPhone } from "./phone";

type QualityInput = {
  website: string;
  domain: string;
  publicPhone: string;
  ownerName: string;
  employees: number | null;
  founded: number | null;
  description: string;
  signal: string;
};

export function scoreQuality(input: QualityInput): { score: number; notes: string[] } {
  let score = 0;
  const notes: string[] = [];

  if (input.website.trim() || input.domain.trim()) score += 20;
  else notes.push("No website on the public record.");

  if (isValidUsPhone(input.publicPhone)) score += 20;
  else if (input.publicPhone.trim()) notes.push("Listing phone is not a valid US number.");
  else notes.push("No listing phone.");

  if (input.ownerName.trim()) score += 25;
  else notes.push("Owner name is missing, so a caller does not know who to ask for.");

  if (input.employees != null) score += 15;
  else notes.push("Headcount is missing, so the revenue estimate is weak.");

  if (input.founded != null) score += 10;
  else notes.push("Year founded is missing.");

  if (input.description.trim() && input.signal.trim()) score += 10;
  else notes.push("The public description is too thin to personalize an opener.");

  return { score, notes };
}
