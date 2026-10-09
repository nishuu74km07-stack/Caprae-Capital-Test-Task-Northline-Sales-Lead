import { makeRecord, parseSource, saneCount, saneYear } from "./record";
import type { PublicLead, RawRecord } from "./types";

export const RAW_COLUMNS = [
  "listed_name",
  "source",
  "website",
  "domain",
  "industry",
  "city",
  "state",
  "employees",
  "founded",
  "owner_name",
  "owner_title",
  "public_phone",
  "description",
  "signal",
  "is_franchise",
  "email",
  "direct_phone",
  "linkedin",
  "owner_tenure",
] as const;

function escapeCell(value: string | number | boolean | null): string {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function recordsToCsv(records: RawRecord[]): string {
  const lines = [RAW_COLUMNS.join(",")];
  for (const record of records) {
    const row = [
      record.listedName,
      record.source,
      record.website,
      record.domain,
      record.industry,
      record.city,
      record.state,
      record.employees ?? "",
      record.founded ?? "",
      record.ownerName,
      record.ownerTitle,
      record.publicPhone,
      record.description,
      record.signal,
      record.isFranchise ? "true" : "false",
      record.email,
      record.directPhone,
      record.linkedin,
      record.ownerTenure ?? "",
    ];
    lines.push(row.map(escapeCell).join(","));
  }
  return `${lines.join("\n")}\n`;
}

export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else inQuotes = false;
      } else cell += char;
      continue;
    }
    if (char === '"') inQuotes = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((current) => current.some((value) => value.trim() !== ""));
}

function cellNumber(value: string | undefined): number | null {
  if (!value || !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function csvToRecords(text: string): { records: RawRecord[]; skipped: string[] } {
  const rows = parseCsv(text);
  if (rows.length === 0) return { records: [], skipped: ["The file is empty."] };

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const skipped: string[] = [];
  const records: RawRecord[] = [];
  const stamp = Date.now().toString(36);

  rows.slice(1).forEach((row, index) => {
    const value = (column: string) => row[headers.indexOf(column)]?.trim() ?? "";
    const listedName = value("listed_name");
    if (!listedName) {
      skipped.push(`Row ${index + 2} is missing a company name.`);
      return;
    }
    const franchise = value("is_franchise").toLowerCase();
    records.push(
      makeRecord({
        id: `imp_${stamp}_${index}_${Math.random().toString(36).slice(2, 6)}`,
        source: parseSource(value("source")),
        listedName,
        website: value("website"),
        domain: value("domain"),
        industry: value("industry") || "Unknown",
        city: value("city"),
        state: (value("state") || "").toUpperCase(),
        employees: saneCount(cellNumber(value("employees"))),
        founded: saneYear(cellNumber(value("founded"))),
        ownerName: value("owner_name"),
        ownerTitle: value("owner_title"),
        publicPhone: value("public_phone"),
        description: value("description"),
        signal: value("signal"),
        isFranchise: franchise === "true" || franchise === "yes" || franchise === "1",
        email: value("email"),
        directPhone: value("direct_phone"),
        linkedin: value("linkedin"),
        ownerTenure: saneCount(cellNumber(value("owner_tenure"))),
      }),
    );
  });

  return { records, skipped };
}

export function leadsToCsv(leads: PublicLead[]): string {
  const headers = [
    "name",
    "domain",
    "industry",
    "city",
    "state",
    "employees",
    "revenue_low",
    "revenue_high",
    "fit_score",
    "quality_score",
    "owner_name",
    "status",
    "sources",
    "email",
    "direct_phone",
    "linkedin",
    "email_check",
    "outreach_draft",
  ];
  const lines = [headers.join(",")];
  for (const lead of leads) {
    lines.push(
      [
        lead.name,
        lead.domain,
        lead.industry,
        lead.city,
        lead.state,
        lead.employees ?? "",
        lead.revenue.low ?? "",
        lead.revenue.high ?? "",
        lead.fitScore,
        lead.qualityScore,
        lead.ownerName,
        lead.status,
        lead.sources.map((source) => source.source).join(" | "),
        lead.email ?? "",
        lead.directPhone ?? "",
        lead.linkedin ?? "",
        lead.emailCheck?.note ?? "",
        lead.outreachDraft,
      ]
        .map(escapeCell)
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
