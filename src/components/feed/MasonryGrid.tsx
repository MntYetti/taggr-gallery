import type { ReactNode } from "react";
import { cx } from "../../lib/utils/classNames";

export function MasonryGrid({
  children,
  density,
}: {
  children: ReactNode;
  density: "compact" | "comfortable" | "large";
}) {
  return (
    <div
      className={cx(
        "gallery-grid px-4 py-5 md:px-6",
        density === "compact" &&
          "grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5",
        density === "comfortable" &&
          "grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
        density === "large" && "grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}
