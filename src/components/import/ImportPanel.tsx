"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { RAW_COLUMNS } from "@/lib/csv";
import { useWorkspace } from "@/store/useWorkspace";
import { Button, ButtonGroup, Field, Modal, PageHeader, Surface, TextArea, useConfirmModal } from "@/components/ui";
import { usePageTitle } from "@/components/usePageTitle";

export function ImportPanel() {
  usePageTitle("Import");
  const { pending, importCsv, resetDemo } = useWorkspace();
  const [csv, setCsv] = useState("");
  const resetConfirm = useConfirmModal();

  async function loadSample() {
    const response = await fetch("/sample-import.csv");
    const text = await response.text();
    setCsv(text);
    await importCsv(text);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void importCsv(csv);
  }

  return (
    <div>
      <PageHeader
        kicker="Ingest"
        title="Bring in a list"
        lede="Paste a scrape export. Rows that share a phone, a domain, or a near-identical name in the same city fold into the company already on file."
        actions={
          <ButtonGroup>
            <Button variant="secondary" loading={pending} onClick={() => void loadSample()}>
              Use sample file
            </Button>
            <Button variant="danger" onClick={resetConfirm.ask}>
              Reset demo
            </Button>
          </ButtonGroup>
        }
      />
      <Surface>
        <form onSubmit={onSubmit} className="grid gap-3">
          <Field label="CSV" hint={RAW_COLUMNS.join(", ")}>
            <TextArea
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              placeholder="Paste rows here, or use the sample file."
            />
          </Field>
          <ButtonGroup align="between">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void file.text().then(setCsv);
              }}
            />
            <Button type="submit" loading={pending} disabled={!csv.trim()}>
              Import rows
            </Button>
          </ButtonGroup>
        </form>
      </Surface>
      <p className="mt-3.5 max-w-[70ch] leading-relaxed text-muted">
        The sample adds Sabine Electrical and a second Bramble Comfort listing. The blank row is skipped. Contact fields
        in the file stay hidden until you enrich.
      </p>
      <Modal
        open={resetConfirm.open}
        title="Restore the demo list?"
        body="This clears shortlists, enrichment, imports, and buy-box edits, then reloads the fictional records."
        confirmLabel="Restore demo"
        pending={pending}
        onClose={resetConfirm.close}
        onConfirm={() => {
          void resetDemo().then(resetConfirm.close);
        }}
      />
    </div>
  );
}
