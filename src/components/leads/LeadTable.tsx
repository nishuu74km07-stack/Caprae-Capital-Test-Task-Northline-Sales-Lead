"use client";

import type { PublicLead } from "@/lib/types";
import { formatRange } from "@/lib/format";
import { priorityLabel, scoreTone, statusLabel, statusTone } from "@/lib/labels";
import { Badge, Button, EmptyState, Surface } from "@/components/ui";

export function LeadTable({
  leads,
  selectedId,
  onOpen,
}: {
  leads: PublicLead[];
  selectedId: string | null;
  onOpen: (id: string) => void;
}) {
  if (leads.length === 0) {
    return (
      <EmptyState
        title="No companies in this view"
        body="Clear a filter or widen the buy box. Passed companies stay hidden until you choose every status."
      />
    );
  }

  return (
    <Surface className="max-h-[calc(100vh-280px)] overflow-auto !p-0">
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr>
            {["Company", "Industry", "Revenue", "Fit", "Quality", "Owner", "Status"].map((heading) => (
              <th
                key={heading}
                className="sticky top-0 z-[1] bg-[#f3f8f9] px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              data-active={selectedId === lead.id}
              className="cursor-pointer border-b border-line transition hover:bg-[#f3fafb] data-[active=true]:bg-[#f3fafb]"
              onClick={() => onOpen(lead.id)}
            >
              <td className="px-4 py-3.5 align-top text-sm">
                <Button variant="link" onClick={() => onOpen(lead.id)}>
                  {lead.name}
                </Button>
                <p className="mt-1 text-xs text-muted">
                  {lead.city}, {lead.state}
                  {lead.sources.length > 1 ? ` · ${lead.sources.length} sources` : ""}
                </p>
              </td>
              <td className="px-4 py-3.5 align-top text-sm">{lead.industry}</td>
              <td className="px-4 py-3.5 align-top text-sm">{formatRange(lead.revenue.low, lead.revenue.high)}</td>
              <td className="px-4 py-3.5 align-top text-sm">
                <Badge tone={scoreTone(lead.fitScore)}>
                  {lead.fitScore} · {priorityLabel(lead.fitScore)}
                </Badge>
              </td>
              <td className="px-4 py-3.5 align-top text-sm">{lead.qualityScore}</td>
              <td className="px-4 py-3.5 align-top text-sm">{lead.ownerName || "—"}</td>
              <td className="px-4 py-3.5 align-top text-sm">
                <Badge tone={statusTone(lead.status)}>
                  {statusLabel(lead.status)}
                  {lead.enriched ? " · enriched" : ""}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Surface>
  );
}
