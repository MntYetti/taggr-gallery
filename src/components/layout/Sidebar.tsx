import { Box, LogOut } from "lucide-react";
import { navItems, type AppView } from "../../app/routes";
import { Button } from "../ui/Button";
import { cx } from "../../lib/utils/classNames";

export function Sidebar({
  activeView,
  appName,
  isAuthenticated,
  onNavigate,
  onLogout,
}: {
  activeView: AppView;
  appName: string;
  isAuthenticated: boolean;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_90%,transparent)] px-4 py-5 lg:block">
      <button
        type="button"
        className="mb-10 flex w-full items-center gap-3 text-left"
        onClick={() => onNavigate("gallery")}
      >
        <span className="grid h-10 w-10 place-items-center border border-[var(--color-accent)] text-[var(--color-accent)]">
          <Box size={19} />
        </span>
        <span>
          <span className="block text-sm font-semibold uppercase text-[var(--color-text)]">
            {appName}
          </span>
          <span className="font-mono text-[11px] uppercase text-[var(--color-muted)]">
            Taggr visual layer
          </span>
        </span>
      </button>

      <nav className="space-y-1" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cx(
                "flex h-11 w-full items-center gap-3 border px-3 font-mono text-xs uppercase transition",
                active
                  ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-text)]"
                  : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-border)] hover:text-[var(--color-text)]",
              )}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-4 right-4 space-y-3">
        <div className="border border-[var(--color-border)] p-3">
          <p className="font-mono text-[10px] uppercase text-[var(--color-muted)]">
            backend
          </p>
          <p className="mt-1 text-sm text-[var(--color-soft)]">
            {(import.meta.env.VITE_TAGGR_API_MODE ?? "real") === "real"
              ? "ICP canister"
              : "mock adapter"}
          </p>
        </div>
        {isAuthenticated ? (
          <Button className="w-full" variant="ghost" onClick={onLogout}>
            <LogOut size={16} />
            Logout
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
