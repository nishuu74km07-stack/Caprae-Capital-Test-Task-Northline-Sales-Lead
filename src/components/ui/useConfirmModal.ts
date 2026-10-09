"use client";

import { useCallback, useState } from "react";

/** Keeps confirm-modal open/close state in one place so screens stay clean. */
export function useConfirmModal() {
  const [open, setOpen] = useState(false);
  const ask = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  return { open, ask, close };
}
