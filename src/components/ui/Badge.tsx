import type { ReactNode } from "react";
import { cx } from "../../lib/utils/classNames";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-panel)_80%,transparent)] px-2 py-1 font-mono text-[11px] uppercase tracking-normal text-[var(--color-muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
