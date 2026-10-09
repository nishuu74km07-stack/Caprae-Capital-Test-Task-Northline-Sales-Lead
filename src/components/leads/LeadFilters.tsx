"use client";

import type { LeadFilters as Filters } from "@/lib/filters";
import { SCORE_BANDS, STATUS_FILTERS } from "@/lib/labels";
import { Button, ButtonGroup, Field, SelectInput, Surface, TextInput } from "@/components/ui";

export function LeadFilters({
  filters,
  industries,
  states,
  onChange,
  onClear,
  showClear,
}: {
  filters: Filters;
  industries: string[];
  states: string[];
  onChange: (filters: Filters) => void;
  onClear: () => void;
  showClear: boolean;
}) {
  return (
    <Surface className="mb-4 grid grid-cols-1 items-end gap-3 !p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
      <Field label="Search">
        <TextInput
          value={filters.query}
          placeholder="Company, owner, city"
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </Field>
      <Field label="Industry">
        <SelectInput value={filters.industry} onChange={(event) => onChange({ ...filters, industry: event.target.value })}>
          <option value="">All industries</option>
          {industries.map((industry) => (
            <option key={industry}>{industry}</option>
          ))}
        </SelectInput>
      </Field>
      <Field label="State">
        <SelectInput value={filters.state} onChange={(event) => onChange({ ...filters, state: event.target.value })}>
          <option value="">All states</option>
          {states.map((state) => (
            <option key={state}>{state}</option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Score">
        <SelectInput
          value={String(filters.minScore)}
          onChange={(event) => onChange({ ...filters, minScore: Number(event.target.value) })}
        >
          {SCORE_BANDS.map((band) => (
            <option key={band.value} value={band.value}>
              {band.label}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Status">
        <SelectInput
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value as Filters["status"] })}
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
      </Field>
      <ButtonGroup className="col-span-full">
        <Button
          size="sm"
          variant={filters.ownerOnly ? "primary" : "secondary"}
          pressed={filters.ownerOnly}
          onClick={() => onChange({ ...filters, ownerOnly: !filters.ownerOnly })}
        >
          Owner on file
        </Button>
        <Button
          size="sm"
          variant={filters.hideThin ? "primary" : "secondary"}
          pressed={filters.hideThin}
          onClick={() => onChange({ ...filters, hideThin: !filters.hideThin })}
        >
          Hide thin rows
        </Button>
        {showClear ? (
          <Button size="sm" variant="ghost" onClick={onClear}>
            Clear filters
          </Button>
        ) : null}
      </ButtonGroup>
    </Surface>
  );
}
