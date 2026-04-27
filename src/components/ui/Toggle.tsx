import { cx } from "../../lib/utils/classNames";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 font-mono text-xs uppercase text-[var(--color-muted)]"
    >
      <span
        className={cx(
          "relative h-5 w-9 border transition",
          checked
            ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_22%,transparent)]"
            : "border-[var(--color-border)] bg-[var(--color-panel)]",
        )}
      >
        <span
          className={cx(
            "absolute top-1/2 h-3 w-3 -translate-y-1/2 bg-[var(--color-text)] transition",
            checked ? "left-5 bg-[var(--color-accent)]" : "left-1",
          )}
        />
      </span>
      {label}
    </button>
  );
}
