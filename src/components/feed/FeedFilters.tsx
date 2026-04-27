import type { TaggrSort } from "../../lib/taggr/taggrTypes";
import { Toggle } from "../ui/Toggle";

const sortOptions: Array<{ value: TaggrSort; label: string }> = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending" },
  { value: "comments", label: "Most commented" },
  { value: "rewards", label: "Most rewarded" },
];

export function FeedFilters({
  sort,
  imagesOnly,
  density,
  feedMode,
  onSortChange,
  onImagesOnlyChange,
}: {
  sort: TaggrSort;
  imagesOnly: boolean;
  density: "compact" | "comfortable" | "large";
  feedMode: "gallery" | "forum";
  onSortChange: (sort: TaggrSort) => void;
  onImagesOnlyChange: (imagesOnly: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSortChange(option.value)}
            className={`border px-3 py-2 font-mono text-xs uppercase transition ${
              sort === option.value
                ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-text)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 md:justify-end">
        <span className="font-mono text-[11px] uppercase text-[var(--color-muted)]">
          {feedMode} / density: {density}
        </span>
        <Toggle
          checked={imagesOnly}
          label="Images only"
          onChange={onImagesOnlyChange}
        />
      </div>
    </div>
  );
}
