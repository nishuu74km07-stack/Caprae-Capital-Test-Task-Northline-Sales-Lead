import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assemble } from "./assemble.ts";
import { defaultBuyBox, normalizeBuyBox } from "./buyBox.ts";
import { checkEmail } from "./emailCheck.ts";
import { csvToRecords, recordsToCsv } from "./csv.ts";
import { planImport } from "./importPlan.ts";
import { ingest } from "./assemble.ts";
import { buildOutreach } from "./outreach.ts";
import { IN_BOX_SCORE } from "./scoring.ts";
import { summarize } from "./stats.ts";
import { makeRecord } from "./record.ts";
import { seedRecords } from "../data/seed.ts";
import type { BuyBox } from "./types.ts";

function box(overrides: Partial<BuyBox> = {}): BuyBox {
  return { ...defaultBuyBox, ...overrides };
}

describe("buy box scoring", () => {
  const { leads } = assemble(seedRecords, defaultBuyBox);

  it("keeps a complete in-box owner at the top of the scale", () => {
    const bramble = leads.find((lead) => lead.name === "Bramble Comfort HVAC");
    assert.ok(bramble);
    assert.equal(bramble.fitScore, 100);
    assert.equal(bramble.sources.length, 3);
  });

  it("drops a franchise under the credit line", () => {
    const franchise = leads.find((lead) => lead.name === "ServRight of Plano");
    assert.ok(franchise);
    assert.ok(franchise.fitScore < IN_BOX_SCORE);
  });

  it("drops a company with no owner when the buy box requires one", () => {
    const keystone = leads.find((lead) => lead.name === "Keystone Relay Electric");
    assert.ok(keystone);
    assert.ok(keystone.fitScore < IN_BOX_SCORE);

    const relaxed = assemble(seedRecords, box({ ownerOnly: false })).leads.find((lead) => lead.id === keystone.id);
    assert.ok(relaxed);
    assert.ok(relaxed.fitScore >= IN_BOX_SCORE);
  });

  it("moves roofing over the line only after the industry is added", () => {
    const thistle = leads.find((lead) => lead.name === "Thistle Roofing");
    assert.ok(thistle);
    assert.ok(thistle.fitScore < IN_BOX_SCORE);
    const withRoofing = assemble(seedRecords, box({ industries: [...defaultBuyBox.industries, "Roofing"] })).leads.find(
      (lead) => lead.id === thistle.id,
    );
    assert.ok(withRoofing);
    assert.ok(withRoofing.fitScore >= IN_BOX_SCORE);
  });
});

describe("credit budget", () => {
  it("reaches more buy-box companies when the same budget is ranked", () => {
    const { leads, scrapeOrder } = assemble(seedRecords, defaultBuyBox);
    const stats = summarize(leads, scrapeOrder, defaultBuyBox.creditAllowance);
    assert.equal(stats.creditComparison.scrapeOrderInBox, 3);
    assert.equal(stats.creditComparison.duplicateSpend, 1);
    assert.ok(stats.creditComparison.rankedInBox > stats.creditComparison.scrapeOrderInBox);
    assert.match(stats.comparisonSentence, /ranked queue reaches/);

    const names = stats.creditComparison.scrapeOrderInBoxIds.map((id) => leads.find((lead) => lead.id === id)?.name);
    assert.deepEqual(names.sort(), ["Bramble Comfort HVAC", "Cinder Electric", "Redbird Air Mechanical"]);
  });
});

describe("import and contact checks", () => {
  it("merges a second listing into the company that is already on file", () => {
    const existing = ingest(seedRecords).companies;
    const incoming = csvToRecords(
      [
        "listed_name,source,domain,industry,city,state,public_phone",
        "Bramble Comfort Heating and Air,Google Maps,bramblecomfort.example,HVAC,Austin,TX,5125550142",
        "Sabine Electrical,Google Maps,sabineelectrical.example,Electrical,Beaumont,TX,4095550173",
        ",Google Maps,,,,,",
      ].join("\n"),
    );
    assert.equal(incoming.skipped.length, 1);
    const plan = planImport(existing, incoming.records);
    assert.equal(plan.merges.length, 1);
    assert.equal(plan.additions.length, 1);
    assert.equal(plan.additions[0].name, "Sabine Electrical");
  });

  it("round-trips a comma inside a description", () => {
    const record = makeRecord({
      id: "csv1",
      listedName: "Example Co",
      industry: "HVAC",
      city: "Austin",
      state: "TX",
      description: "Service, install, and maintenance",
    });
    const parsed = csvToRecords(recordsToCsv([record]));
    assert.equal(parsed.records[0].description, "Service, install, and maintenance");
    assert.equal(parsed.records[0].listedName, "Example Co");
  });

  it("flags a generic inbox and a broken address", () => {
    assert.equal(checkEmail("info@capitolwren.example").roleAccount, true);
    assert.equal(checkEmail("luis.romero@@saltflathvac.example").valid, false);
    assert.equal(checkEmail("dana.ruiz@bramblecomfort.example").valid, true);
  });

  it("writes the owner name into the draft and leaves the email out", () => {
    const { leads } = assemble(seedRecords, defaultBuyBox);
    const bramble = leads.find((lead) => lead.name === "Bramble Comfort HVAC");
    assert.ok(bramble);
    const draft = buildOutreach(bramble, defaultBuyBox);
    assert.match(draft, /^Hi Dana,/);
    assert.match(draft, /Travis County/);
    assert.equal(draft.includes(bramble.email), false);
  });

  it("swaps a reversed revenue range instead of saving it backwards", () => {
    const normalized = normalizeBuyBox({ ...defaultBuyBox, revenueMin: 9_000_000, revenueMax: 2_000_000 });
    assert.equal(normalized.revenueMin, 2_000_000);
    assert.equal(normalized.revenueMax, 9_000_000);
  });
});

describe("credit report", () => {
  it("writes the scrape vs ranked gap into a markdown report", async () => {
    const { assemble } = await import("./assemble.ts");
    const { buildCreditReport } = await import("./report.ts");
    const { leads, scrapeOrder } = assemble(seedRecords, defaultBuyBox);
    const report = buildCreditReport({ buyBox: defaultBuyBox, leads, scrapeOrder, budget: 20 });
    assert.match(report, /Scrape-order in-box hits \| 3/);
    assert.match(report, /Ranked-queue in-box hits \| 19/);
    assert.match(report, /Bramble Comfort HVAC/);
  });
});
