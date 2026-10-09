import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  pressed?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled" | "onClick" | "className" | "aria-label">;

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-gradient-to-b from-[#14929d] to-teal text-[#f4fcfd] shadow-[0_8px_18px_rgba(14,124,134,0.28)] hover:enabled:from-[#0f838d] hover:enabled:to-teal-ink hover:enabled:-translate-y-px",
  secondary: "border-line bg-surface text-ink hover:enabled:border-[#b9cbd1] hover:enabled:bg-[#f7fbfc]",
  ghost: "border-transparent bg-transparent text-ink hover:enabled:bg-ink/5",
  danger: "border-[#efc4bf] bg-transparent text-bad hover:enabled:bg-bad-bg",
  link: "min-h-0 justify-start rounded-none border-0 bg-transparent p-0 text-ink shadow-none hover:enabled:translate-y-0 hover:enabled:text-teal",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-[42px] px-4 text-sm",
  sm: "min-h-[34px] px-3 text-[13px]",
};

/** Single shared button used across Desk, Leads, Buy box, Import, Drawer, and Modal. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    pressed = false,
    fullWidth = false,
    icon,
    children,
    type = "button",
    disabled,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-[11px] border font-semibold leading-none transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        variant !== "link" && sizes[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || loading}
      aria-pressed={pressed ? true : undefined}
      onClick={onClick}
      {...rest}
    >
      {icon}
      {loading ? "Working…" : children}
    </button>
  );
});
