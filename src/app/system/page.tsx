"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Surface } from "@/components/ui/Surface";
import { usePageTitle } from "@/components/usePageTitle";

const STACK = [
  { layer: "UI", choice: "Next.js App Router, React, TypeScript, Tailwind CSS, Redux Toolkit" },
  { layer: "API", choice: "Route handlers on the Node runtime" },
  { layer: "Database", choice: "SQLite via node:sqlite · data/northline.db" },
  { layer: "Cache", choice: "In-process workspace snapshot, dropped on every write" },
  { layer: "Tests", choice: "node:test for scoring, dedupe, credits, import, email checks" },
];

const PIPELINE = [
  "Ingest scrape rows",
  "Dedupe by phone / domain / name+city",
  "Estimate revenue (free)",
  "Score against buy box",
  "Rank before credit spend",
  "Enrich → validate email → outreach → export",
];

export default function SystemPage() {
  usePageTitle("System");

  return (
    <div className="animate-rise">
      <PageHeader
        kicker="For reviewers"
        title="Why Northline exists"
        lede="SaaSquatch already scrapes and enriches. The expensive mistake is spending credits in scrape order. Northline is the fit-first layer in front of that credit."
      />

      <section className="mb-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Surface>
          <h2 className="mb-2.5 text-[28px]">Business problem</h2>
          <p className="text-sm leading-relaxed text-muted">
            Searchers and cold callers work with limited enrichment budgets. A Maps + registry export is noisy:
            franchises, wrong industries, missing owners, and the same company listed twice. Enriching down the file
            burns money before the right owner appears.
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            Northline keeps the SaaSquatch motion — scrape wide, estimate revenue early, enrich only what you want —
            and adds the missing decision: <strong className="text-ink">who is worth the credit?</strong>
          </p>
        </Surface>

        <Surface>
          <h2 className="mb-2.5 text-[28px]">What is new vs SaaSquatch</h2>
          <ul className="m-0 grid list-disc gap-2 pl-[18px] text-sm leading-relaxed text-muted">
            <li>Buy-box fit score with visible point reasons</li>
            <li>Multi-source dedupe before enrichment</li>
            <li>Scrape-order vs ranked credit proof (+ interactive budget)</li>
            <li>Fit score separate from data-quality score</li>
            <li>Email validation after enrich (generic / broken)</li>
            <li>Credit savings report for the searcher / reviewer</li>
          </ul>
        </Surface>

        <Surface>
          <h2 className="mb-2.5 text-[28px]">Pipeline</h2>
          <ol className="m-0 grid list-decimal gap-2 pl-[18px] text-sm leading-relaxed text-muted">
            {PIPELINE.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Surface>

        <Surface>
          <h2 className="mb-2.5 text-[28px]">Stack</h2>
          <table className="w-full border-collapse">
            <tbody>
              {STACK.map((row) => (
                <tr key={row.layer} className="border-b border-line last:border-0">
                  <th className="w-[110px] py-2 pr-2.5 text-left align-top text-[13px] text-ink">{row.layer}</th>
                  <td className="py-2 text-sm text-muted">{row.choice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Surface>
      </section>

      <Surface>
        <h2 className="mb-2.5 text-[28px]">API demo</h2>
        <p className="text-sm leading-relaxed text-muted">Run the app, then try:</p>
        <pre className="my-3 overflow-auto rounded-xl bg-sidebar p-3.5 text-xs leading-relaxed text-teal-soft">{`curl http://localhost:3001/api/workspace
curl -X POST http://localhost:3001/api/leads/k1 -H "Content-Type: application/json" -d "{\\"action\\":\\"enrich\\"}"
curl -X POST http://localhost:3001/api/leads/bulk -H "Content-Type: application/json" -d "{\\"action\\":\\"shortlist-inbox\\"}"`}</pre>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">
          Dataset is fictional on purpose. No live scrape of Apollo, LinkedIn, or Google. The pipeline is real; the
          people are demo records.
        </p>
      </Surface>
    </div>
  );
}
