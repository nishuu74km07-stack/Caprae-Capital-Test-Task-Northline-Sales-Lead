# Northline

Northline is a fit-first lead desk for acquisition entrepreneurs. A SaaSquatch-style scrape still finds the companies. Northline decides which owners are worth a credit.

It folds duplicate listings, estimates revenue from public headcount before anyone pays, and ranks the file against a buy box. Direct email, mobile, and LinkedIn stay hidden until that credit is spent.

On the bundled demo list:
- 42 scraped rows become 38 companies. 4 duplicate listings are folded in.
- A 20-credit budget spent in scrape order reaches **3** buy-box companies.
- The same 20 credits spent on the ranked queue reach **19**.
- 1 of those scrape-order credits hits a company already in the file.

People and phone numbers in `data/leads.csv` are fictional. Domains use `.example`. The demo does not scrape Apollo, LinkedIn, Google, or any live site.

Live demo: https://caprae-capital-test-task-northline-kappa.vercel.app/

## Run it

Requires Node.js 22.13 or newer (this project uses Node’s built-in SQLite).

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run dataset` rewrites `data/leads.csv` from the same seed the app loads. Delete `data/northline.db` to reseed on the next launch, or use **Reset demo** on the Import page.

To run a production build: `npm run build`, then `npm start`. Persist the `data/` directory so `northline.db` survives restarts.

## About the project

Northline cleans a scraped list, scores it against a buy box, and ranks the owners worth a credit.

- **Desk** compares scrape order with the ranked queue, and downloads the credit report.
- **Leads** shows fit and quality, enriches for 1 credit, checks the email, drafts outreach, and exports CSV.
- **Buy box** sets industry, location, revenue, and owner rules, then rescores the file.
- **Import** adds a CSV and folds duplicate listings into the company already on file.

Fit is the buy-box match. Quality is whether the row is complete enough to call. The same notes are on **/system**.

## Pipeline

| Step | What happens | Credit |
| --- | --- | --- |
| Ingest | Maps, registry, and directory rows land in scrape order | Free |
| Dedupe | Same phone, same domain, or a near-identical name in the same city | Free |
| Revenue estimate | Headcount times an industry benchmark, with a range | Free |
| Fit score | Buy box rubric, shown as points | Free |
| Enrich | Email, direct phone, LinkedIn, tenure, plus an email check | 1 credit |
| Outreach | A letter the caller can see the inputs of | Free |
| Export | CSV for the dialer or CRM. Hidden fields stay blank until enriched | Free |

## Stack
| Layer | Choice |
| --- | --- |
| UI | Next.js (App Router), React, TypeScript, Tailwind CSS, Redux Toolkit |
| API | Next.js route handlers, Node runtime |
| Database | SQLite through Node’s `node:sqlite`, file at `data/northline.db` |
| Tests | `node:test` via `tsx` on scoring, dedupe, import, and email rules |

Scoring, dedupe, revenue, email checks, CSV, and outreach each live once under `src/lib`. The screens call those through the API.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/workspace` | Buy box, ranked leads, stats. Direct contact is null until enriched. |
| POST | `/api/buybox` | Save criteria and rescore. |
| POST | `/api/leads/:id` | `{ "action": "enrich" }`, `{ "action": "draft" }`, or `{ "action": "status", "status": "shortlisted" }` |
| POST | `/api/import` | `{ "csv": "..." }` |
| POST | `/api/reset` | Restore the fictional demo. |
| POST | `/api/leads/bulk` | `{ "action": "shortlist-inbox" }` shortlists every new 75+ company. |

```bash
curl http://localhost:3000/api/workspace
curl -X POST http://localhost:3000/api/leads/k1 -H "Content-Type: application/json" -d "{\"action\":\"enrich\"}"
```

`k1` is Bramble Comfort HVAC in the seed.

## Layout

```
src/lib        scoring, dedupe, revenue, outreach, csv
src/server     SQLite and the workspace API
src/store      Redux Toolkit workspace state
src/components shared Button, Field, Drawer, and the screens
src/app        pages and route handlers
data/leads.csv fictional scrape, 42 rows
public/sample-import.csv  the import demo
```
