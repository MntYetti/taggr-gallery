import { LogIn, Search, UserRound } from "lucide-react";
import type { AppView } from "../../app/routes";
import type { TaggrRealm } from "../../lib/taggr/taggrTypes";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function Header({
  activeView,
  appName,
  query,
  realm,
  realms,
  isAuthenticated,
  onQueryChange,
  onRealmChange,
  onLogin,
  onProfile,
}: {
  activeView: AppView;
  appName: string;
  query: string;
  realm?: string;
  realms: TaggrRealm[];
  isAuthenticated: boolean;
  onQueryChange: (query: string) => void;
  onRealmChange: (realm?: string) => void;
  onLogin: () => void;
  onProfile: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_88%,transparent)] px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase text-[var(--color-muted)]">
            {activeView} / {import.meta.env.VITE_TAGGR_API_MODE ?? "real"}
          </p>
          <h1 className="text-xl font-semibold uppercase text-[var(--color-text)] md:text-2xl">
            {activeView === "gallery" ? appName : activeView}
          </h1>
        </div>

        <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_180px_auto] xl:w-[740px]">
          <label className="relative block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              size={16}
            />
            <Input
              aria-label="Search Taggr posts"
              className="pl-9"
              placeholder="search posts, users, tags, realms"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>

          <select
            aria-label="Filter by realm"
            className="h-11 border border-[var(--color-border)] bg-[var(--color-panel)] px-3 font-mono text-sm text-[var(--color-text)]"
            value={realm ?? ""}
            onChange={(event) => onRealmChange(event.target.value || undefined)}
          >
            <option value="">All realms</option>
            {realms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {isAuthenticated ? (
            <Button onClick={onProfile} variant="secondary">
              <UserRound size={16} />
              Profile
            </Button>
          ) : (
            <Button onClick={onLogin} variant="primary">
              <LogIn size={16} />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
