"use client";

import { useState } from "react";
import type { PublicLead } from "@/lib/types";
import { confidenceLabel, formatRange, websiteHref } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { IN_BOX_SCORE } from "@/lib/scoring";
import { priorityLabel, scoreTone, statusLabel, statusTone } from "@/lib/labels";
import { useWorkspace } from "@/store/useWorkspace";
import {
  Badge,
  Button,
  ButtonGroup,
  Drawer,
  FactList,
  FactRow,
  ScoreTile,
  SectionHeading,
  StatusActions,
} from "@/components/ui";
import { cx } from "@/lib/cx";

export function LeadDrawer({ lead }: { lead: PublicLead }) {
  const { closeLead, pending, setStatus, enrich, draft, workspace } = useWorkspace();
  const [copied, setCopied] = useState(false);
  const remaining = workspace?.stats.credits.remaining ?? 0;
  const href = websiteHref(lead.website, lead.domain);

  async function copyDraft() {
    if (!lead.outreachDraft) return;
    try {
      await navigator.clipboard.writeText(lead.outreachDraft);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Drawer title={lead.name} subtitle={`${lead.city}, ${lead.state} · ${lead.industry}`} onClose={closeLead}>
      <div className="grid grid-cols-3 gap-2.5">
        <ScoreTile value={String(lead.fitScore)} label={`Fit · ${priorityLabel(lead.fitScore)}`} />
        <ScoreTile value={String(lead.qualityScore)} label="Data quality" />
        <ScoreTile
          value={formatRange(lead.revenue.low, lead.revenue.high)}
          label={`${confidenceLabel(lead.revenue.confidence)} revenue`}
          large={false}
        />
      </div>
      <p className="text-sm leading-relaxed text-muted">
        Fit is the buy box. Quality is whether the row is complete enough to call. {IN_BOX_SCORE}+ is the credit line.
      </p>

      <section>
        <SectionHeading>Why this score</SectionHeading>
        <ul className="m-0 grid list-none gap-2 p-0">
          {lead.fitReasons.map((reason) => (
            <li key={reason.label} className="grid grid-cols-[42px_1fr] gap-2 rounded-[10px] bg-[#f7fbfc] px-2.5 py-2 text-sm">
              <span
                className={cx(
                  "font-extrabold text-muted",
                  reason.applied && reason.points >= 0 && "text-good",
                  reason.applied && reason.points < 0 && "text-bad",
                )}
              >
                {reason.applied ? (reason.points > 0 ? `+${reason.points}` : reason.points) : "0"}
              </span>
              <span>{reason.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <FactList>
        <FactRow label="Owner" value={`${lead.ownerName || "Not listed"}${lead.ownerTitle ? ` · ${lead.ownerTitle}` : ""}`} />
        <FactRow label="Listing phone" value={formatPhone(lead.publicPhone)} />
        <FactRow label="Headcount" value={String(lead.employees ?? "Unknown")} />
        <FactRow label="Operating" value={lead.yearsOperating == null ? "Unknown" : `${lead.yearsOperating} years`} />
        <FactRow
          label="Website"
          value={
            href ? (
              <a className="font-semibold text-teal" href={href} target="_blank" rel="noreferrer">
                {lead.domain || href}
              </a>
            ) : (
              "None"
            )
          }
        />
      </FactList>

      {lead.description ? <p>{lead.description}</p> : null}
      {lead.signal ? <p className="text-sm leading-relaxed text-muted">{lead.signal}</p> : null}

      <section>
        <SectionHeading>Sources folded together</SectionHeading>
        <ul className="m-0 grid list-none gap-2 p-0">
          {lead.sources.map((source) => (
            <li key={source.id} className="flex items-center gap-2 text-sm">
              <Badge>{source.source}</Badge>
              <span>{source.listedName}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading>Before you call</SectionHeading>
        {lead.qualityNotes.length === 0 ? (
          <p>Public record is complete enough to call.</p>
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0">
            {lead.qualityNotes.map((note) => (
              <li key={note} className="text-sm leading-snug">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeading>Pipeline</SectionHeading>
        <StatusActions value={lead.status} pending={pending} onChange={(status) => void setStatus(lead.id, status)} />
        <p className="mt-2.5 flex items-center gap-2 text-[13px] text-muted">
          Current status <Badge tone={statusTone(lead.status)}>{statusLabel(lead.status)}</Badge>
          <Badge tone={scoreTone(lead.fitScore)}>{lead.fitScore}</Badge>
        </p>
      </section>

      <section
        className={cx(
          "grid gap-2.5 rounded-2xl p-4",
          lead.enriched
            ? "border border-[#bfe3cd] bg-gradient-to-b from-[#e8f7f0] to-[#dff3e8]"
            : "border border-dashed border-[#b9cbd1] bg-gradient-to-b from-[#f7fbfc] to-[#eef5f6]",
        )}
      >
        <SectionHeading className="mb-0">Direct contact</SectionHeading>
        {lead.enriched ? (
          <FactList>
            <FactRow label="Email" value={lead.email || "None returned"} />
            <FactRow label="Direct phone" value={lead.directPhone ? formatPhone(lead.directPhone) : "None returned"} />
            <FactRow
              label="LinkedIn"
              value={
                lead.linkedin ? (
                  <a className="font-semibold text-teal" href={lead.linkedin} target="_blank" rel="noreferrer">
                    Profile
                  </a>
                ) : (
                  "None returned"
                )
              }
            />
            <FactRow label="Tenure" value={lead.ownerTenure == null ? "Unknown" : `${lead.ownerTenure} years`} />
            {lead.emailCheck ? (
              <p className="mt-1">
                <Badge tone={lead.emailCheck.valid ? (lead.emailCheck.roleAccount ? "warn" : "good") : "bad"}>
                  {lead.emailCheck.note}
                </Badge>
              </p>
            ) : null}
          </FactList>
        ) : (
          <>
            <p>
              Direct email, mobile, and LinkedIn stay hidden until you spend 1 credit. {remaining} left. The listing phone
              above is already public.
            </p>
            <Button loading={pending} disabled={remaining === 0} onClick={() => void enrich(lead.id)}>
              Enrich for 1 credit
            </Button>
          </>
        )}
      </section>

      <section>
        <SectionHeading>Outreach</SectionHeading>
        <ButtonGroup>
          <Button variant="secondary" loading={pending} onClick={() => void draft(lead.id)}>
            Write outreach
          </Button>
          {lead.outreachDraft ? (
            <Button variant="ghost" onClick={() => void copyDraft()}>
              {copied ? "Copied" : "Copy draft"}
            </Button>
          ) : null}
        </ButtonGroup>
        {lead.outreachDraft ? (
          <pre className="mt-3 whitespace-pre-wrap rounded-[14px] border border-line bg-[#f7fbfc] p-3.5 font-sans text-sm leading-relaxed">
            {lead.outreachDraft}
          </pre>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The draft uses the public record and the name on the buy box. It does not call a model.
          </p>
        )}
      </section>
    </Drawer>
  );
}
