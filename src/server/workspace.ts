import { toLead } from "../lib/assemble";
import { normalizeBuyBox } from "../lib/buyBox";
import { planImport } from "../lib/importPlan";
import { csvToRecords } from "../lib/csv";
import { sortLeads } from "../lib/filters";
import { buildOutreach } from "../lib/outreach";
import { isNewInBox } from "../lib/leads";
import { toPublicLead } from "../lib/serialize";
import { summarize } from "../lib/stats";
import type { BuyBox, LeadStatus, PublicLead, RawRecord, Workspace } from "../lib/types";
import {
  getDb,
  insertStoredCompany,
  loadCompanies,
  loadScrapeOrder,
  nextPosition,
  readSetting,
  resetDatabase,
  writeSetting,
  type StoredCompany,
} from "./db";

let cacheVersion = 0;
let cache: { version: number; workspace: Workspace } | null = null;

function invalidate() {
  cacheVersion += 1;
  cache = null;
}

function readBuyBox(): BuyBox {
  const raw = readSetting(getDb(), "buyBox");
  if (!raw) return normalizeBuyBox({});
  try {
    return normalizeBuyBox(JSON.parse(raw) as Partial<BuyBox>);
  } catch {
    return normalizeBuyBox({});
  }
}

function blank(current: string, incoming: string): string {
  return current.trim() ? current : incoming.trim();
}

function preferLonger(current: string, incoming: string): string {
  return incoming.trim().length > current.trim().length ? incoming : current;
}

export function getWorkspace(): Workspace {
  if (cache?.version === cacheVersion) return cache.workspace;

  const db = getDb();
  const buyBox = readBuyBox();
  const stored = loadCompanies(db);
  const leads = sortLeads(
    stored.map((company) =>
      toLead(company, buyBox, {
        status: company.status,
        enriched: company.enriched,
        outreachDraft: company.outreachDraft,
      }),
    ),
  );
  const scrapeOrder = loadScrapeOrder(db);
  const summary = summarize(leads, scrapeOrder, buyBox.creditAllowance);
  const publicLeads = leads.map(toPublicLead);
  const byId = new Map(publicLeads.map((lead) => [lead.id, lead]));
  const queue = summary.queueIds.map((id) => byId.get(id)).filter((lead): lead is PublicLead => Boolean(lead));

  const workspace: Workspace = {
    buyBox,
    leads: publicLeads,
    stats: {
      rawCount: summary.rawCount,
      companyCount: summary.companyCount,
      duplicatesRemoved: summary.duplicatesRemoved,
      inBox: summary.inBox,
      stillToCall: summary.stillToCall,
      shortlisted: summary.shortlisted,
      outreach: summary.outreach,
      conversations: summary.conversations,
      passed: summary.passed,
      enriched: summary.enriched,
      withOwner: summary.withOwner,
      credits: summary.credits,
      creditComparison: summary.creditComparison,
      comparisonSentence: summary.comparisonSentence,
      byIndustry: summary.byIndustry,
      queue,
    },
    simulation: {
      scrapeOrder,
      companies: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        fitScore: lead.fitScore,
        industry: lead.industry,
        state: lead.state,
      })),
    },
  };

  cache = { version: cacheVersion, workspace };
  return workspace;
}

function requireCompany(id: string): StoredCompany {
  const company = loadCompanies(getDb()).find((item) => item.id === id);
  if (!company) throw new Error("Company not found.");
  return company;
}

export function saveBuyBox(input: Partial<BuyBox>): { workspace: Workspace; message: string } {
  const buyBox = normalizeBuyBox(input);
  writeSetting(getDb(), "buyBox", JSON.stringify(buyBox));
  invalidate();
  return { workspace: getWorkspace(), message: "Buy box saved. Every company was rescored." };
}

export function setStatus(id: string, status: LeadStatus): { workspace: Workspace; message: string } {
  requireCompany(id);
  getDb().prepare("UPDATE companies SET status = ? WHERE id = ?").run(status, id);
  invalidate();
  return { workspace: getWorkspace(), message: "Status updated." };
}

export function enrichLead(id: string): { workspace: Workspace; message: string } {
  const company = requireCompany(id);
  if (company.status === "passed") {
    throw new Error("Move this company out of Passed before you spend a credit.");
  }
  if (company.enriched) throw new Error("This company is already enriched.");

  const buyBox = readBuyBox();
  const used = loadCompanies(getDb()).filter((item) => item.enriched).length;
  if (used >= buyBox.creditAllowance) {
    throw new Error("No credits left. Raise the budget on the buy box, or pass on the rest of the list.");
  }

  const nextStatus = company.status === "new" ? "shortlisted" : company.status;
  getDb().prepare("UPDATE companies SET enriched = 1, status = ? WHERE id = ?").run(nextStatus, id);
  invalidate();
  const message =
    company.status === "new" ? `${company.name} is enriched and shortlisted.` : `${company.name} is enriched.`;
  return { workspace: getWorkspace(), message };
}

export function draftLead(id: string): { workspace: Workspace; message: string } {
  const company = requireCompany(id);
  if (company.status === "passed") throw new Error("Passed companies do not get an outreach draft.");
  const buyBox = readBuyBox();
  const lead = toLead(company, buyBox, {
    status: company.status,
    enriched: company.enriched,
    outreachDraft: company.outreachDraft,
  });
  const draft = buildOutreach(lead, buyBox);
  getDb().prepare("UPDATE companies SET outreach_draft = ? WHERE id = ?").run(draft, id);
  invalidate();
  return { workspace: getWorkspace(), message: "Outreach draft is ready to copy." };
}

function applyMerge(company: StoredCompany, record: RawRecord) {
  company.website = blank(company.website, record.website);
  company.domain = blank(company.domain, record.domain);
  company.ownerName = blank(company.ownerName, record.ownerName);
  company.ownerTitle = blank(company.ownerTitle, record.ownerTitle);
  company.publicPhone = blank(company.publicPhone, record.publicPhone);
  company.description = preferLonger(company.description, record.description);
  company.signal = preferLonger(company.signal, record.signal);
  company.employees = company.employees ?? record.employees;
  company.founded = company.founded ?? record.founded;
  company.email = blank(company.email, record.email);
  company.directPhone = blank(company.directPhone, record.directPhone);
  company.linkedin = blank(company.linkedin, record.linkedin);
  company.ownerTenure = company.ownerTenure ?? record.ownerTenure;
  company.isFranchise = company.isFranchise || record.isFranchise;

  const db = getDb();
  db.prepare(
    `UPDATE companies SET
      website = ?, domain = ?, owner_name = ?, owner_title = ?, public_phone = ?, description = ?, signal = ?,
      employees = ?, founded = ?, email = ?, direct_phone = ?, linkedin = ?, owner_tenure = ?, is_franchise = ?
     WHERE id = ?`,
  ).run(
    company.website,
    company.domain,
    company.ownerName,
    company.ownerTitle,
    company.publicPhone,
    company.description,
    company.signal,
    company.employees,
    company.founded,
    company.email,
    company.directPhone,
    company.linkedin,
    company.ownerTenure,
    company.isFranchise ? 1 : 0,
    company.id,
  );
  db.prepare(`INSERT INTO sources (id, company_id, source, listed_name, position) VALUES (?, ?, ?, ?, ?)`).run(
    record.id,
    company.id,
    record.source,
    record.listedName,
    nextPosition(db),
  );
}

export function importCsv(text: string): { workspace: Workspace; message: string } {
  if (text.length > 1_000_000) throw new Error("That file is too large for this desk.");
  const parsed = csvToRecords(text);
  const db = getDb();
  const existing = loadCompanies(db);
  const plan = planImport(existing, parsed.records);

  db.exec("BEGIN IMMEDIATE");
  try {
    for (const company of plan.additions) insertStoredCompany(db, company);
    const fresh = loadCompanies(db);
    for (const merge of plan.merges) {
      const company = fresh.find((item) => item.id === merge.companyId) ?? existing.find((item) => item.id === merge.companyId);
      if (!company) continue;
      applyMerge(company, merge.record);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  invalidate();
  const parts = [
    plan.additions.length ? `${plan.additions.length} added` : "",
    plan.merges.length ? `${plan.merges.length} merged into companies already on file` : "",
    plan.unchanged ? `${plan.unchanged} already on file` : "",
    parsed.skipped.length ? `${parsed.skipped.length} skipped` : "",
  ].filter(Boolean);
  const note = parsed.skipped[0] ? ` ${parsed.skipped[0]}` : "";
  const message = `${parts.length ? parts.join(", ") : "Nothing new in that file."}.${note}`.trim();
  return { workspace: getWorkspace(), message };
}

export function resetDemo(): { workspace: Workspace; message: string } {
  resetDatabase(getDb());
  invalidate();
  return { workspace: getWorkspace(), message: "Demo list restored." };
}

export function shortlistInBox(): { workspace: Workspace; message: string } {
  const buyBox = readBuyBox();
  const db = getDb();
  const stored = loadCompanies(db);
  const leads = stored.map((company) =>
    toLead(company, buyBox, {
      status: company.status,
      enriched: company.enriched,
      outreachDraft: company.outreachDraft,
    }),
  );
  const targets = leads.filter(isNewInBox);
  if (targets.length === 0) {
    return { workspace: getWorkspace(), message: "No new buy-box companies left to shortlist." };
  }

  const update = db.prepare("UPDATE companies SET status = 'shortlisted' WHERE id = ?");
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const lead of targets) update.run(lead.id);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  invalidate();
  return {
    workspace: getWorkspace(),
    message: `${targets.length} buy-box ${targets.length === 1 ? "company" : "companies"} shortlisted.`,
  };
}
