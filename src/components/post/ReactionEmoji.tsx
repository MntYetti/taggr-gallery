import { cx } from "../../lib/utils/classNames";

const reactionMeta: Record<
  number,
  {
    label: string;
    tone: string;
    path: string;
    detail?: string;
  }
> = {
  1: {
    label: "Downvote",
    tone: "var(--color-danger)",
    path: "M6 4h4v4h4v4h-4v4H6v-4H2V8h4V4Z",
  },
  10: {
    label: "Heart",
    tone: "var(--color-accent)",
    path: "M5 3h3v2h2V3h3v2h2v5h-2v2h-2v2H9v2H7v-2H5v-2H3v-2H1V5h2V3h2Z",
  },
  11: {
    label: "Signal up",
    tone: "var(--color-accent-2)",
    path: "M3 13h3V8H3v5Zm5 0h3V5H8v8Zm5 0h3V2h-3v11Z",
  },
  12: {
    label: "Static tear",
    tone: "var(--color-accent-2)",
    path: "M8 1c2 3 5 6 5 9a5 5 0 0 1-10 0c0-3 3-6 5-9Zm-2 9h2v2H6v-2Zm4-3h2v2h-2V7Z",
  },
  50: {
    label: "Thermal",
    tone: "#ff8f5a",
    path: "M9 1c1 4 5 5 5 10a6 6 0 0 1-12 0c0-3 2-5 4-7 0 2 1 3 2 3 1-2 1-4 1-6Zm-1 9c-2 1-2 2-2 3a2 2 0 0 0 4 0c0-1-1-2-2-3Z",
  },
  51: {
    label: "Laugh mask",
    tone: "#ffbf58",
    path: "M2 4h12v8H2V4Zm3 3h2V6H5v1Zm4 0h2V6H9v1Zm-4 2c1 2 5 2 6 0H5Z",
  },
  52: {
    label: "Burst 100",
    tone: "#d95d8f",
    path: "M8 1l1 4 4-2-2 4 4 1-4 1 2 4-4-2-1 4-1-4-4 2 2-4-4-1 4-1-2-4 4 2 1-4Z",
    detail: "100",
  },
  53: {
    label: "Launch",
    tone: "#8cc8bd",
    path: "M12 1l3 3-4 7-3 1-4 4-2-2 4-4 1-3 5-6Zm-1 3-2 3 2 2 2-3-2-2Z",
  },
  100: {
    label: "Archive star",
    tone: "#ffd86b",
    path: "M8 1l2 5h5l-4 3 2 6-5-3-5 3 2-6-4-3h5l2-5Z",
  },
  101: {
    label: "Black flag",
    tone: "var(--color-soft)",
    path: "M3 2h2v13H3V2Zm3 1h8v6H6V3Zm2 2v2h4V5H8Z",
  },
};

export function ReactionEmoji({
  id,
  className,
}: {
  id: number;
  className?: string;
}) {
  const meta = reactionMeta[id] ?? {
    label: `Reaction ${id}`,
    tone: "var(--color-accent)",
    path: "M3 3h10v10H3V3Z",
  };

  return (
    <span
      aria-label={meta.label}
      className={cx(
        "relative inline-grid h-6 w-6 shrink-0 place-items-center border border-[var(--color-border)] bg-[var(--color-bg)]",
        className,
      )}
      role="img"
      title={meta.label}
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill={meta.tone}
        viewBox="0 0 16 16"
      >
        <path d={meta.path} />
      </svg>
      {meta.detail ? (
        <span className="absolute font-mono text-[6px] font-bold text-[var(--color-bg)]">
          {meta.detail}
        </span>
      ) : null}
    </span>
  );
}

export function reactionEmojiLabel(id: number) {
  return reactionMeta[id]?.label ?? `Reaction ${id}`;
}
