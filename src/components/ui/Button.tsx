import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/utils/classNames";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
  children: ReactNode;
};

const variants = {
  primary:
    "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)] hover:brightness-110",
  secondary:
    "border-[var(--color-border)] bg-[var(--color-panel-strong)] text-[var(--color-text)] hover:border-[var(--color-accent)]",
  ghost:
    "border-transparent bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-panel)]",
  danger:
    "border-[var(--color-danger)] bg-transparent text-[var(--color-danger)] hover:bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]",
};

const sizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  icon: "h-10 w-10 p-0",
};

export function Button({
  className,
  variant = "secondary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex shrink-0 items-center justify-center gap-2 border font-mono uppercase tracking-normal transition disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
