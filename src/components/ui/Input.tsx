import type { InputHTMLAttributes } from "react";
import { cx } from "../../lib/utils/classNames";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "h-11 w-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 font-mono text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]",
        className,
      )}
      {...props}
    />
  );
}
