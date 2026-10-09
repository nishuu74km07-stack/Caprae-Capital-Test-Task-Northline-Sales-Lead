import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ingest } from "../lib/assemble";
import { defaultBuyBox } from "../lib/buyBox";
import { seedRecords } from "../data/seed";
import type { CompanyFacts, LeadSource, SourceName } from "../lib/types";

const globalForDb = globalThis as unknown as { northlineDb?: DatabaseSync };

function migrate(db: DatabaseSync) {
  db.exec(`
    PRAGMA journal_mode = DELETE;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      website TEXT NOT NULL DEFAULT '',
      domain TEXT NOT NULL DEFAULT '',
      industry TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      employees INTEGER,
      founded INTEGER,
      owner_name TEXT NOT NULL DEFAULT '',
      owner_title TEXT NOT NULL DEFAULT '',
      public_phone TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      signal TEXT NOT NULL DEFAULT '',
      is_franchise INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'new',
      enriched INTEGER NOT NULL DEFAULT 0,
      email TEXT NOT NULL DEFAULT '',
      direct_phone TEXT NOT NULL DEFAULT '',
      linkedin TEXT NOT NULL DEFAULT '',
      owner_tenure INTEGER,
      outreach_draft TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      source TEXT NOT NULL,
      listed_name TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sources_company ON sources(company_id);
    CREATE INDEX IF NOT EXISTS sources_position ON sources(position);
  `);
}

function dataDir() {
  // Vercel / Lambda filesystems are read-only except /tmp.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join("/tmp", "northline");
  }
  return path.join(process.cwd(), "data");
}

export function getDb(): DatabaseSync {
  if (globalForDb.northlineDb) return globalForDb.northlineDb;
  const dir = dataDir();
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "northline.db"));
  migrate(db);
  seedIfEmpty(db);
  globalForDb.northlineDb = db;
  return db;
}

type CompanyRow = {
  id: string;
  name: string;
  website: string;
  domain: string;
  industry: string;
  city: string;
  state: string;
  employees: number | null;
  founded: number | null;
  owner_name: string;
  owner_title: string;
  public_phone: string;
  description: string;
  signal: string;
  is_franchise: number;
  status: string;
  enriched: number;
  email: string;
  direct_phone: string;
  linkedin: string;
  owner_tenure: number | null;
  outreach_draft: string;
};

export type StoredCompany = CompanyFacts & {
  status: "new" | "shortlisted" | "outreach" | "conversation" | "passed";
  enriched: boolean;
  outreachDraft: string;
};

function insertCompany(db: DatabaseSync, company: CompanyFacts, positionStart?: number) {
  db.prepare(
    `INSERT INTO companies (
      id, name, website, domain, industry, city, state, employees, founded, owner_name, owner_title,
      public_phone, description, signal, is_franchise, status, enriched, email, direct_phone, linkedin, owner_tenure, outreach_draft
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 0, ?, ?, ?, ?, '')`,
  ).run(
    company.id,
    company.name,
    company.website,
    company.domain,
    company.industry,
    company.city,
    company.state,
    company.employees,
    company.founded,
    company.ownerName,
    company.ownerTitle,
    company.publicPhone,
    company.description,
    company.signal,
    company.isFranchise ? 1 : 0,
    company.email,
    company.directPhone,
    company.linkedin,
    company.ownerTenure,
  );

  const insertSource = db.prepare(
    `INSERT INTO sources (id, company_id, source, listed_name, position) VALUES (?, ?, ?, ?, ?)`,
  );
  company.sources.forEach((source, index) => {
    insertSource.run(source.id, company.id, source.source, source.listedName, positionStart ?? source.position ?? index);
  });
}

export function seedIfEmpty(db: DatabaseSync) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const row = db.prepare("SELECT COUNT(*) AS n FROM companies").get() as { n: number };
    if (row.n === 0) {
      for (const company of ingest(seedRecords).companies) insertCompany(db, company);
      db.prepare(
        `INSERT INTO settings (key, value) VALUES ('buyBox', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ).run(JSON.stringify(defaultBuyBox));
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function resetDatabase(db: DatabaseSync) {
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec("DELETE FROM sources; DELETE FROM companies;");
    for (const company of ingest(seedRecords).companies) insertCompany(db, company);
    db.prepare(
      `INSERT INTO settings (key, value) VALUES ('buyBox', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ).run(JSON.stringify(defaultBuyBox));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function loadCompanies(db: DatabaseSync): StoredCompany[] {
  const companies = db.prepare("SELECT * FROM companies").all() as CompanyRow[];
  const sources = db.prepare("SELECT * FROM sources ORDER BY position ASC").all() as {
    id: string;
    company_id: string;
    source: string;
    listed_name: string;
    position: number;
  }[];

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    website: company.website,
    domain: company.domain,
    industry: company.industry,
    city: company.city,
    state: company.state,
    employees: company.employees,
    founded: company.founded,
    ownerName: company.owner_name,
    ownerTitle: company.owner_title,
    publicPhone: company.public_phone,
    description: company.description,
    signal: company.signal,
    isFranchise: company.is_franchise === 1,
    email: company.email,
    directPhone: company.direct_phone,
    linkedin: company.linkedin,
    ownerTenure: company.owner_tenure,
    status: company.status as StoredCompany["status"],
    enriched: company.enriched === 1,
    outreachDraft: company.outreach_draft,
    sources: sources
      .filter((source) => source.company_id === company.id)
      .map(
        (source): LeadSource => ({
          id: source.id,
          source: source.source as SourceName,
          listedName: source.listed_name,
          position: source.position,
        }),
      ),
  }));
}

export function loadScrapeOrder(db: DatabaseSync): string[] {
  const rows = db.prepare("SELECT company_id FROM sources ORDER BY position ASC").all() as { company_id: string }[];
  return rows.map((row) => row.company_id);
}

export function nextPosition(db: DatabaseSync): number {
  const row = db.prepare("SELECT COALESCE(MAX(position), -1) AS max FROM sources").get() as { max: number };
  return row.max + 1;
}

export function insertStoredCompany(db: DatabaseSync, company: CompanyFacts) {
  const start = nextPosition(db);
  insertCompany(db, {
    ...company,
    sources: company.sources.map((source, index) => ({ ...source, position: start + index })),
  });
}

export function readSetting(db: DatabaseSync, key: string): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function writeSetting(db: DatabaseSync, key: string, value: string) {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(key, value);
}
