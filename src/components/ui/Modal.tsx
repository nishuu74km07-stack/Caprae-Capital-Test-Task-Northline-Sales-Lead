"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";
import type { ButtonVariant } from "./Button";

type ModalProps = {
  title: string;
  body?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm?: () => void;
  onClose: () => void;
  pending?: boolean;
  open?: boolean;
};

/** Shared modal shell. Cancel / Confirm always use the shared Button component. */
export function Modal({
  title,
  body,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onClose,
  pending = false,
  open = true,
}: ModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 grid place-items-center p-5">
      <div className="absolute inset-0 bg-[rgba(6,38,44,0.48)] backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative w-full max-w-[440px] animate-rise rounded-[18px] border border-line bg-surface p-6 shadow-[var(--shadow-lift)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="text-[30px]">
          {title}
        </h2>
        {body ? <p className="mt-2.5 leading-relaxed text-muted">{body}</p> : null}
        {children}
        <ButtonGroup align="end" className="mt-[18px]">
          <Button ref={closeRef} variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          {onConfirm ? (
            <Button variant={confirmVariant} loading={pending} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          ) : null}
        </ButtonGroup>
      </div>
    </div>
  );
}
