"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function Drawer({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-20">
      <div className="absolute inset-0 animate-[riseIn_180ms_ease_both] bg-[rgba(6,38,44,0.48)] backdrop-blur-[2px]" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-[480px] animate-drawer flex-col bg-surface shadow-[-20px_0_60px_rgba(6,38,44,0.18)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line bg-gradient-to-b from-[#f3fafb] to-white px-6 pb-3.5 pt-6">
          <div>
            <h2 id="drawer-title" className="text-[32px] leading-tight">
              {title}
            </h2>
            {subtitle ? <p className="mt-1.5 text-sm text-muted">{subtitle}</p> : null}
          </div>
          <Button ref={closeRef} variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </header>
        <div className="grid gap-[18px] overflow-auto px-6 pb-9 pt-[18px]">{children}</div>
      </aside>
    </div>
  );
}
