import { navItems, type AppView } from "../../app/routes";
import { cx } from "../../lib/utils/classNames";

export function BottomNav({
  activeView,
  onNavigate,
}: {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_94%,transparent)] backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={cx(
              "flex h-16 flex-col items-center justify-center gap-1 font-mono text-[10px] uppercase",
              active
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted)]",
            )}
          >
            <Icon size={18} />
            <span className="max-w-full truncate px-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
