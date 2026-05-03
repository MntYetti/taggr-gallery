import { Children, type ReactNode, useEffect, useMemo, useState } from "react";
import { cx } from "../../lib/utils/classNames";

function getColumnCount(
  density: "compact" | "comfortable" | "large",
  width: number,
) {
  if (density === "compact") {
    if (width >= 1280) return 5;
    if (width >= 768) return 3;
    return 2;
  }

  if (density === "comfortable") {
    if (width >= 1280) return 4;
    if (width >= 640) return 2;
    return 1;
  }

  if (width >= 1536) return 3;
  if (width >= 768) return 2;
  return 1;
}

function useMasonryColumnCount(density: "compact" | "comfortable" | "large") {
  const [columnCount, setColumnCount] = useState(() =>
    getColumnCount(
      density,
      typeof window === "undefined" ? 0 : window.innerWidth,
    ),
  );

  useEffect(() => {
    function updateColumnCount() {
      setColumnCount(getColumnCount(density, window.innerWidth));
    }

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, [density]);

  return columnCount;
}

export function MasonryGrid({
  children,
  density,
}: {
  children: ReactNode;
  density: "compact" | "comfortable" | "large";
}) {
  const columnCount = useMasonryColumnCount(density);
  const childArray = Children.toArray(children).filter(Boolean);
  const columns = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, columnIndex) =>
        childArray.filter(
          (_, itemIndex) => itemIndex % columnCount === columnIndex,
        ),
      ),
    [childArray, columnCount],
  );
  const gapClass = cx(
    density === "compact" && "gap-3",
    density === "comfortable" && "gap-4",
    density === "large" && "gap-5",
  );

  return (
    <div
      className={cx(
        "grid items-start px-4 py-5 md:px-6",
        gapClass,
      )}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {columns.map((column, columnIndex) =>
        column.length ? (
          <div key={columnIndex} className={cx("grid min-w-0", gapClass)}>
            {column.map((child) => child)}
          </div>
        ) : null,
      )}
    </div>
  );
}
