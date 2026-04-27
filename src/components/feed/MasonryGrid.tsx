import { Children, type ReactNode } from "react";
import { cx } from "../../lib/utils/classNames";

export function MasonryGrid({
  children,
  density,
}: {
  children: ReactNode;
  density: "compact" | "comfortable" | "large";
}) {
  const itemClass = cx(
    "inline-block w-full break-inside-avoid align-top",
    density === "compact" && "mb-3",
    density === "comfortable" && "mb-4",
    density === "large" && "mb-5",
  );

  return (
    <div
      className={cx(
        "px-4 py-5 md:px-6",
        density === "compact" &&
          "columns-2 gap-3 md:columns-3 xl:columns-5",
        density === "comfortable" &&
          "columns-1 gap-4 sm:columns-2 xl:columns-4",
        density === "large" && "columns-1 gap-5 md:columns-2 2xl:columns-3",
      )}
    >
      {Children.map(children, (child) =>
        child ? <div className={itemClass}>{child}</div> : null,
      )}
    </div>
  );
}
