# Northline

Northline is a fit-first lead desk for acquisition entrepreneurs. It sits on top of a SaaSquatch-style scrape. The scrape still finds companies. Northline decides which owners are worth a credit.

SaaSquatch already gathers company and contact data, estimates revenue, and sells enrichment one credit at a time. The expensive mistake is spending those credits, and a caller’s hour, in scrape order. Northline folds duplicate listings, estimates revenue from public headcount before anyone pays, and ranks the file against a buy box.

On the bundled demo list that looks like this:

- 42 scraped rows become 38 companies. 4 duplicate listings are folded in.
- A 20-credit budget spent in scrape order reaches **3** buy-box companies.
- The same 20 credits spent on the ranked queue reach **19**.
- 1 of those scrape-order credits hits a company already in the file.

The people and phone numbers in `data/leads.csv` are fictional. Domains use `.example`.

## Run it

Requires Node.js 22.13 or newer (this project uses Node’s built-in SQLite).

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run dataset` rewrites `data/leads.csv` from the same seed the app loads. Delete `data/northline.db` if you want the next launch to reseed from scratch. The Import page also has **Reset demo**.

## Two-minute demo

1. **Desk.** Drag the credit budget slider. Download the credit savings report. That comparison is the product.
2. **Call these first.** Open Bramble Comfort HVAC. The score is a rubric, not a black box. Listing phone is visible. Direct email is not.
3. **Enrich for 1 credit.** The credit counter drops. The email check tells you whether the address looks direct.
4. Open **Capitol Wren Plumbing** and enrich it. The inbox is generic (`info@`). Open **Saltflat HVAC**. The address is broken. Both are reasons not to trust a raw export.
5. **Write outreach.** The draft uses the owner, the city, the signal, and the name on the buy box. Copy it.
6. **Buy box.** Add Roofing and save. Thistle Roofing should cross the credit line. Turn off “Require an owner” and Keystone Relay Electric should follow. Lower the credit budget to 10 and the gap usually gets wider.
7. **Import.** Use the sample file. Sabine Electrical is added. The extra Bramble listing merges. The blank row is skipped.
8. **Leads.** Filter to the credit line, export the view. Passed companies stay out of the active export.

## Why this feature

Caprae’s users are searchers, cold callers, and operators, not a research desk with unlimited credits. SaaSquatch’s own pricing makes the point: one credit should unlock a full profile, and revenue estimates exist so you enrich the right rows first. Search as a Service then has to call owners, not front desks and not the same company twice under two names.

Northline is the quality-first cut of that workflow, sized for a short build:

| Step | What happens | Credit |
| --- | --- | --- |
| Ingest | Maps, registry, and directory rows land in scrape order | Free |
| Dedupe | Same phone, same domain, or a near-identical name in the same city | Free |
| Revenue estimate | Headcount times an industry benchmark, with a range | Free |
| Fit score | Buy box rubric, shown as points | Free |
| Enrich | Email, direct phone, LinkedIn, tenure, plus an email check | 1 credit |
| Outreach | A letter the caller can see the inputs of | Free |
| Export | CSV for the dialer or CRM. Hidden fields stay blank until enriched | Free |

Fit and quality are separate on purpose. Fit asks “is this the buy box?” Quality asks “is this row complete enough to call?”

## Stack

| Layer | Choice |
| --- | --- |
| UI | Next.js (App Router), React, TypeScript, Tailwind CSS, Redux Toolkit |
| API | Next.js route handlers, Node runtime |
| Database | SQLite through Node’s `node:sqlite`, file at `data/northline.db` |
| Cache | One in-process snapshot of the scored workspace, dropped on every write |
| Tests | `node:test` via `tsx` on the scoring, dedupe, import, and email rules |

Shared UI lives in `src/components/ui`. Every button in the product is the `Button` component. Scoring, dedupe, revenue, email checks, CSV, and outreach each exist once under `src/lib` and are what the API calls. The screens do not reimplement those rules.

### Data model

- `companies` — one row per business after dedupe, including pipeline status and gated contact fields.
- `sources` — every scraped listing, with its original position. That position is the scrape order used in the credit comparison.
- `settings` — the buy box, stored as JSON.

Dedupe runs at ingest, not on every page view. Changing the buy box only rescores. Prepared statements are on; the journal mode is DELETE for simpler serverless/tmp writes. The list is a searcher’s working file, hundreds or a few thousand rows, so the pairwise match is the right tool. A phone and domain index is the next step past that, not a requirement for this size.

### Cache and performance

`getWorkspace()` keeps the last scored payload in memory and rebuilds it only after a save, enrich, import, status change, or reset. The client then filters and exports that payload locally, so search and CSV do not round-trip.

### Hosting and deployment

This is a Node server, not a static export. The desk writes the buy box, credits, and pipeline.

A reviewer can run it locally with `npm run dev`. To put it on a host:

1. `npm install`
2. `npm test`
3. `npm run build`
4. `npm start` (set `PORT` if the host requires it)
5. Persist the `data/` directory so `northline.db` survives restarts.

Sensible hosts are Railway, Fly.io, or AWS App Runner: one container, one disk, one process. On Vercel the desk writes SQLite under `/tmp` (ephemeral; cold starts reseed from the bundled demo). A multi-instance production setup should move SQLite to Turso (libSQL).

There is no separate cache server. The process cache is enough until more than one app instance is writing the same file. At that point the cache should move to the database’s updated timestamp, which the invalidation function already centralizes.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/workspace` | Buy box, ranked leads, stats. Direct contact is null until enriched. |
| POST | `/api/buybox` | Save criteria and rescore. |
| POST | `/api/leads/:id` | `{ "action": "enrich" }`, `{ "action": "draft" }`, or `{ "action": "status", "status": "shortlisted" }` |
| POST | `/api/import` | `{ "csv": "..." }` |
| POST | `/api/reset` | Restore the fictional demo. |
| POST | `/api/leads/bulk` | `{ "action": "shortlist-inbox" }` shortlists every new 75+ company. |

Open **/system** in the app for the reviewer-facing rationale, stack, and curl examples.

```bash
curl http://localhost:3000/api/workspace
curl -X POST http://localhost:3000/api/leads/k1 -H "Content-Type: application/json" -d "{\"action\":\"enrich\"}"
```

`k1` is Bramble Comfort HVAC in the seed.

## Data ethics

The demo does not scrape Apollo, LinkedIn, Google, or any live site. Those sources are named because that is what a real SaaSquatch-style export is built from, and because their terms, rate limits, and the people behind the listings are the constraint. Production should use licensed APIs plus public pages with a rate limit, and it should keep gating personal contact the way this desk does: the revenue estimate is free, the direct line costs a credit, and a generic inbox is labeled before a caller treats it as the owner.

## Project layout

```
src/lib        scoring, dedupe, revenue, outreach, csv
src/server     SQLite and the workspace API
src/store      Redux Toolkit workspace state
src/components shared Button, Field, Drawer, and the screens
src/app        pages and route handlers
data/leads.csv fictional scrape, 42 rows
public/sample-import.csv  the import demo
```

