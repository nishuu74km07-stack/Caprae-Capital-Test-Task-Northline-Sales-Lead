"use client";

import { useMemo, useState } from "react";
import { useWorkspace } from "@/store/useWorkspace";
import { formatMoney, formatRange, plural } from "@/lib/format";
import { countNewInBox } from "@/lib/leads";
import { priorityLabel, scoreTone, statusLabel, statusTone } from "@/lib/labels";
import { buildCreditReport, downloadText } from "@/lib/report";
import { compareCredits, comparisonSentence } from "@/lib/stats";
import {
  Badge,
  Button,
  ButtonGroup,
  CompareCard,
  Meter,
  PageHeader,
  PanelHead,
  Stat,
  Surface,
} from "@/components/ui";
import { usePageTitle } from "@/components/usePageTitle";

export function Dashboard() {
  usePageTitle("Desk");
  const { workspace, pending, openLead, setStatus, shortlistInBox } = useWorkspace();
  const [budget, setBudget] = useState<number | null>(null);

  const activeBudget = budget ?? workspace?.buyBox.creditAllowance ?? 20;
  const comparison = useMemo(() => {
    if (!workspace) {
      return { budget: activeBudget, scrapeOrderInBox: 0, rankedInBox: 0, duplicateSpend: 0, scrapeOrderInBoxIds: [] as string[] };
    }
    return compareCredits(workspace.simulation.companies, workspace.simulation.scrapeOrder, activeBudget);
  }, [workspace, activeBudget]);

  if (!workspace) return null;

  const { stats, buyBox, simulation, leads } = workspace;
  const sentence = comparisonSentence(comparison);
  const visibleIndustries = stats.byIndustry.filter((row) => row.inBox > 0);
  const maxIndustry = Math.max(1, ...visibleIndustries.map((row) => row.inBox));
  const gap = comparison.rankedInBox - comparison.scrapeOrderInBox;
  const newInBox = countNewInBox(leads);

  function exportReport() {
    downloadText(
      `northline-credit-report-${activeBudget}.md`,
      buildCreditReport({
        buyBox,
        leads,
        scrapeOrder: simulation.scrapeOrder,
        budget: activeBudget,
      }),
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        kicker={buyBox.firmName}
        title="Spend the credit on the right owner"
        lede="SaaSquatch finds the list. Northline decides who is worth a credit — fold duplicates, estimate revenue for free, then call the buy-box first."
        actions={
          <ButtonGroup>
            <Button variant="secondary" onClick={exportReport}>
              Download credit report
            </Button>
            <Button variant="primary" loading={pending} disabled={newInBox === 0} onClick={() => void shortlistInBox()}>
              Shortlist buy box ({newInBox})
            </Button>
          </ButtonGroup>
        }
      />

      <section className="relative mb-4 grid overflow-hidden rounded-[22px] border border-teal/20 bg-[linear-gradient(135deg,rgba(14,124,134,0.12),transparent_42%),linear-gradient(180deg,#fff_0%,#f3fafb_100%)] p-[26px] shadow-[var(--shadow-lift)] lg:grid-cols-[0.95fr_1.2fr] lg:gap-5">
        <div className="relative z-[1]">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-teal">Credit impact</p>
          <p className="mt-2 bg-gradient-to-br from-ink to-teal bg-clip-text font-display text-[clamp(64px,8vw,88px)] leading-[0.88] tracking-tight text-transparent">
            {gap > 0 ? `+${gap}` : gap}
          </p>
          <p className="mt-2.5 max-w-[28ch] text-[15px] leading-snug text-muted">
            more buy-box companies inside the same {activeBudget}-credit budget
          </p>
          <label className="mt-4 grid max-w-xs gap-2 text-[13px] font-bold text-teal-ink">
            <span>Simulate budget: {activeBudget} credits</span>
            <input
              type="range"
              min={5}
              max={40}
              value={activeBudget}
              className="w-full accent-teal"
              onChange={(event) => setBudget(Number(event.target.value))}
            />
          </label>
          <p className="mt-4 max-w-[42ch] rounded-xl border border-line bg-white/70 px-3.5 py-3 text-sm leading-relaxed text-ink">
            {sentence}
          </p>
        </div>

        <div className="relative z-[1] mt-5 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr] lg:mt-0">
          <CompareCard
            label="Scrape order"
            value={comparison.scrapeOrderInBox}
            hint="in-box hits if you enrich down the file"
            budget={activeBudget}
            tone="flat"
          />
          <p
            className="place-self-center text-[11px] font-bold uppercase tracking-[0.14em] text-teal"
            aria-hidden
          >
            vs
          </p>
          <CompareCard
            label="Ranked queue"
            value={comparison.rankedInBox}
            hint="in-box hits when fit comes first"
            budget={activeBudget}
            tone="strong"
            win
          />
        </div>
      </section>

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Companies on file"
          value={String(stats.companyCount)}
          detail={`${stats.duplicatesRemoved} duplicates folded from ${stats.rawCount} scraped rows`}
        />
        <Stat
          label="Inside the buy box"
          value={String(stats.inBox)}
          detail={`${stats.withOwner} of ${stats.inBox} have an owner listed`}
        />
        <Stat
          label="Still to call"
          value={String(stats.stillToCall)}
          detail={`${stats.conversations} talking · ${stats.outreach} in outreach`}
        />
        <Stat
          label="Credits left"
          value={String(stats.credits.remaining)}
          detail={`${stats.credits.used} of ${stats.credits.allowance} spent · ${plural(stats.enriched, "profile")} enriched`}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <Surface className="rounded-[20px]">
          <PanelHead title="Call these first" lede="Top fits still waiting for a dial or a shortlist." />
          <ul className="m-0 grid list-none gap-2.5 p-0">
            {stats.queue.length === 0 ? (
              <li className="text-[13px] leading-snug text-muted">
                Nothing in the call queue. Widen the buy box or move a passed company back.
              </li>
            ) : null}
            {stats.queue.map((lead, index) => (
              <li
                key={lead.id}
                className="grid animate-rise grid-cols-[34px_1fr] items-center gap-3 rounded-[14px] border border-transparent bg-[#f7fbfc] p-3 hover:border-line hover:bg-white sm:grid-cols-[34px_1fr_auto]"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-ink text-[13px] font-extrabold text-white">
                  {index + 1}
                </div>
                <div>
                  <Button variant="link" onClick={() => openLead(lead.id)}>
                    {lead.name}
                  </Button>
                  <p className="mt-1 text-[13px] leading-snug text-muted">
                    {lead.city}, {lead.state} · {formatRange(lead.revenue.low, lead.revenue.high)} ·{" "}
                    {lead.ownerName || "Owner missing"}
                  </p>
                </div>
                <div className="col-start-2 flex flex-wrap items-center justify-start gap-2 sm:col-start-auto sm:justify-end">
                  <Badge tone={scoreTone(lead.fitScore)}>
                    {lead.fitScore} · {priorityLabel(lead.fitScore)}
                  </Badge>
                  {lead.status === "new" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={pending}
                      onClick={() => void setStatus(lead.id, "shortlisted")}
                    >
                      Shortlist
                    </Button>
                  ) : (
                    <Badge tone={statusTone(lead.status)}>{statusLabel(lead.status)}</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface className="rounded-[20px]">
          <PanelHead title="Where the box is full" lede="Live coverage by industry against your criteria." />
          <ul className="m-0 grid list-none gap-2.5 p-0">
            {visibleIndustries.map((row) => (
              <li key={row.industry}>
                <div className="mb-1.5 flex justify-between text-[13px] font-semibold">
                  <span>{row.industry}</span>
                  <span>
                    {row.inBox} in box / {row.total}
                  </span>
                </div>
                <Meter value={row.inBox} max={maxIndustry} tone="strong" />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] leading-snug text-muted">
            Revenue is headcount × an industry benchmark, from {formatMoney(buyBox.revenueMin)} to{" "}
            {formatMoney(buyBox.revenueMax)}. Free — no credit spent.
          </p>
        </Surface>
      </section>
    </div>
  );
}
