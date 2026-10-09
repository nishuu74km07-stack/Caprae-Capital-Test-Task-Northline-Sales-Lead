"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { INDUSTRIES, STATES } from "@/lib/buyBox";
import { dollarsToMillions, millionsToDollars } from "@/lib/format";
import { toggleValue } from "@/lib/leads";
import type { BuyBox } from "@/lib/types";
import { useWorkspace } from "@/store/useWorkspace";
import { Button, CheckField, Field, OptionChips, PageHeader, Surface, TextInput } from "@/components/ui";
import { usePageTitle } from "@/components/usePageTitle";

export function BuyBoxForm() {
  usePageTitle("Buy box");
  const { workspace, pending, saveBuyBox } = useWorkspace();
  const [draft, setDraft] = useState<BuyBox | null>(workspace?.buyBox ?? null);
  const signature = JSON.stringify(workspace?.buyBox ?? null);

  useEffect(() => {
    if (!workspace) return;
    setDraft(workspace.buyBox);
  }, [signature, workspace]);

  if (!workspace || !draft) return null;

  function update(patch: Partial<BuyBox>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (draft) void saveBuyBox(draft);
  }

  return (
    <form onSubmit={onSubmit}>
      <PageHeader
        kicker="Criteria"
        title="Draw the buy box"
        lede="Scores update when you save. Credits already spent stay spent. A company at 75 or above is worth a credit."
        actions={
          <Button type="submit" loading={pending}>
            Save buy box
          </Button>
        }
      />
      <Surface className="mb-4 grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Field label="Your name" hint="This name signs the outreach draft.">
          <TextInput value={draft.searcherName} onChange={(event) => update({ searcherName: event.target.value })} />
        </Field>
        <Field label="Firm name">
          <TextInput value={draft.firmName} onChange={(event) => update({ firmName: event.target.value })} />
        </Field>
        <Field label="Minimum revenue ($M)">
          <TextInput
            type="number"
            min={0}
            step={0.5}
            value={dollarsToMillions(draft.revenueMin)}
            onChange={(event) => update({ revenueMin: millionsToDollars(Number(event.target.value)) })}
          />
        </Field>
        <Field label="Maximum revenue ($M)">
          <TextInput
            type="number"
            min={0}
            step={0.5}
            value={dollarsToMillions(draft.revenueMax)}
            onChange={(event) => update({ revenueMax: millionsToDollars(Number(event.target.value)) })}
          />
        </Field>
        <Field label="Minimum employees">
          <TextInput
            type="number"
            min={1}
            value={draft.employeesMin}
            onChange={(event) => update({ employeesMin: Number(event.target.value) })}
          />
        </Field>
        <Field label="Maximum employees">
          <TextInput
            type="number"
            min={1}
            value={draft.employeesMax}
            onChange={(event) => update({ employeesMax: Number(event.target.value) })}
          />
        </Field>
        <Field label="Minimum years operating">
          <TextInput
            type="number"
            min={0}
            value={draft.minYears}
            onChange={(event) => update({ minYears: Number(event.target.value) })}
          />
        </Field>
        <Field label="Credit budget" hint="5 to 100. The desk comparison uses this number.">
          <TextInput
            type="number"
            min={5}
            max={100}
            value={draft.creditAllowance}
            onChange={(event) => update({ creditAllowance: Number(event.target.value) })}
          />
        </Field>
      </Surface>
      <CheckField
        label="Require an owner on the public record"
        checked={draft.ownerOnly}
        onChange={(ownerOnly) => update({ ownerOnly })}
      />
      <Surface className="mt-[18px] grid gap-4">
        <OptionChips
          label="Industries"
          options={INDUSTRIES}
          selected={draft.industries}
          onToggle={(industry) => update({ industries: toggleValue(draft.industries, industry) })}
        />
        <OptionChips
          label="States"
          options={STATES}
          selected={draft.states}
          onToggle={(state) => update({ states: toggleValue(draft.states, state) })}
        />
      </Surface>
      <p className="mt-[18px] max-w-[70ch] rounded-[14px] border border-teal/20 bg-teal-soft px-4 py-3.5 leading-relaxed text-teal-ink">
        {workspace.stats.inBox} companies currently clear the credit line. Add Roofing and Thistle Roofing should cross
        it. Turn off the owner requirement and Keystone Relay Electric should follow.
      </p>
    </form>
  );
}
