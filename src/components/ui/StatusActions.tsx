"use client";

import type { LeadStatus } from "@/lib/types";
import { STATUS_OPTIONS } from "@/lib/labels";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";

/** Reusable status button row for the lead drawer pipeline. */
export function StatusActions({
  value,
  pending,
  onChange,
}: {
  value: LeadStatus;
  pending?: boolean;
  onChange: (status: LeadStatus) => void;
}) {
  return (
    <ButtonGroup>
      {STATUS_OPTIONS.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={value === option.value ? "primary" : "secondary"}
          pressed={value === option.value}
          loading={pending}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
