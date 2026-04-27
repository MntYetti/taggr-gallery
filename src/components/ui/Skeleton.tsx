export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse border border-[var(--color-border)] bg-[linear-gradient(90deg,var(--color-panel),var(--color-panel-strong),var(--color-panel))] ${className}`}
    />
  );
}
