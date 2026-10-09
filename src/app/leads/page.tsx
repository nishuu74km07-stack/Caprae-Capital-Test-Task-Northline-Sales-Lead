"use client";

import { useState } from "react";
import { defaultFilters, filterLeads, filtersAreDefault, sortLeads, uniqueValues } from "@/lib/filters";
import type { LeadFilters } from "@/lib/filters";
import { downloadCsv, leadsToCsv } from "@/lib/csv";
import { countNewInBox } from "@/lib/leads";
import { useWorkspace } from "@/store/useWorkspace";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import { LeadFilters as LeadFiltersBar } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { Button, ButtonGroup, PageHeader } from "@/components/ui";
import { usePageTitle } from "@/components/usePageTitle";

export default function LeadsPage() {
  usePageTitle("Leads");
  const { workspace, selectedId, openLead, pending, shortlistInBox } = useWorkspace();
  const [filters, setFilters] = useState<LeadFilters>(defaultFilters);
  if (!workspace) return null;

  const visible = sortLeads(filterLeads(workspace.leads, filters));
  const active = workspace.leads.filter((lead) => lead.status !== "passed");
  const selected = workspace.leads.find((lead) => lead.id === selectedId) ?? null;
  const newInBox = countNewInBox(workspace.leads);

  return (
    <div>
      <PageHeader
        kicker="Queue"
        title="Ranked companies"
        lede={`${visible.length} showing. Export includes direct contact only after a credit is spent.`}
        actions={
          <ButtonGroup>
            <Button variant="primary" loading={pending} disabled={newInBox === 0} onClick={() => void shortlistInBox()}>
              Shortlist buy box ({newInBox})
            </Button>
            <Button variant="secondary" onClick={() => downloadCsv("northline-filtered.csv", leadsToCsv(visible))}>
              Export filtered
            </Button>
            <Button variant="secondary" onClick={() => downloadCsv("northline-active.csv", leadsToCsv(active))}>
              Export active
            </Button>
          </ButtonGroup>
        }
      />
      <LeadFiltersBar
        filters={filters}
        industries={uniqueValues(workspace.leads, "industry")}
        states={uniqueValues(workspace.leads, "state")}
        onChange={setFilters}
        onClear={() => setFilters(defaultFilters)}
        showClear={!filtersAreDefault(filters)}
      />
      <LeadTable leads={visible} selectedId={selectedId} onOpen={openLead} />
      {selected ? <LeadDrawer lead={selected} /> : null}
    </div>
  );
}
