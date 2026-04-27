import { useEffect, useMemo, useState } from "react";
import { Bell, MonitorCog, Save } from "lucide-react";
import { BottomNav } from "../components/layout/BottomNav";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";
import { CreatePostForm } from "../components/create/CreatePostForm";
import { GalleryFeed } from "../components/feed/GalleryFeed";
import { PostDetail } from "../components/post/PostDetail";
import { ProfileGrid } from "../components/profile/ProfileGrid";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { RealmsGrid } from "../components/realms/RealmsGrid";
import { Button } from "../components/ui/Button";
import { Toggle } from "../components/ui/Toggle";
import { taggrClient } from "../lib/taggr/taggrClient";
import type {
  TaggrPost,
  TaggrProfile,
  TaggrRealm,
  TaggrSort,
} from "../lib/taggr/taggrTypes";
import { identityAdapter } from "../lib/icp/identity";
import type { AppView } from "./routes";

type Theme = "noir" | "amber" | "paper";
type Density = "compact" | "comfortable" | "large";
type FeedMode = "gallery" | "forum";

const appName = import.meta.env.VITE_APP_NAME ?? "Taggr Gallery";
const apiMode = import.meta.env.VITE_TAGGR_API_MODE ?? "real";
const configuredDefaultRealm = import.meta.env.VITE_DEFAULT_REALM || undefined;

function readSetting<T extends string>(key: string, fallback: T) {
  return (localStorage.getItem(key) as T | null) ?? fallback;
}

export function App() {
  const [activeView, setActiveView] = useState<AppView>("gallery");
  const [theme, setTheme] = useState<Theme>(() =>
    readSetting<Theme>("taggr-gallery-theme", "noir"),
  );
  const [density, setDensity] = useState<Density>(() =>
    readSetting<Density>("taggr-gallery-density", "comfortable"),
  );
  const [feedMode, setFeedMode] = useState<FeedMode>(() =>
    readSetting<FeedMode>("taggr-gallery-feed-mode", "gallery"),
  );
  const [defaultRealm, setDefaultRealm] = useState<string | undefined>(() =>
    localStorage.getItem("taggr-gallery-default-realm") ||
    configuredDefaultRealm,
  );
  const [imagesOnlyDefault, setImagesOnlyDefault] = useState(
    () => localStorage.getItem("taggr-gallery-images-only") !== "false",
  );
  const [imagesOnly, setImagesOnly] = useState(imagesOnlyDefault);
  const [query, setQuery] = useState("");
  const [realm, setRealm] = useState<string | undefined>(defaultRealm);
  const [sort, setSort] = useState<TaggrSort>("latest");
  const [realms, setRealms] = useState<TaggrRealm[]>([]);
  const [selectedPost, setSelectedPost] = useState<TaggrPost | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<TaggrProfile | null>(null);
  const [profileTarget, setProfileTarget] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("taggr-gallery-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("taggr-gallery-density", density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem("taggr-gallery-feed-mode", feedMode);
  }, [feedMode]);

  useEffect(() => {
    localStorage.setItem("taggr-gallery-images-only", String(imagesOnlyDefault));
  }, [imagesOnlyDefault]);

  useEffect(() => {
    if (defaultRealm) {
      localStorage.setItem("taggr-gallery-default-realm", defaultRealm);
    } else {
      localStorage.removeItem("taggr-gallery-default-realm");
    }
  }, [defaultRealm]);

  useEffect(() => {
    taggrClient.getRealms().then(setRealms);
    refreshAuthState();
  }, []);

  useEffect(() => {
    if (activeView !== "profile") return;
    if (apiMode === "real" && !profileTarget && !isAuthenticated) {
      setProfile(null);
      return;
    }

    const profileId = profileTarget ?? (apiMode === "real" ? "" : "user-orbit");
    setProfile(null);
    taggrClient
      .getProfile(profileId)
      .then(setProfile)
      .catch((error) => {
        setStatus(
          error instanceof Error ? error.message : "Profile could not be loaded",
        );
      });
  }, [activeView, isAuthenticated, profileTarget]);

  const settingsSummary = useMemo(
    () => [
      ["theme", theme],
      ["feed", feedMode],
      ["density", density],
      ["realm", defaultRealm ?? "all"],
      ["images", imagesOnlyDefault ? "only" : "all"],
    ],
    [theme, feedMode, density, defaultRealm, imagesOnlyDefault],
  );

  async function login() {
    setStatus(null);
    if (apiMode === "mock") {
      setIsAuthenticated(true);
      setStatus("Mock session active. Real mode uses Internet Identity.");
      return;
    }

    try {
      const identity = await identityAdapter.login();
      if (identity) await refreshAuthState();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed");
    }
  }

  async function refreshAuthState() {
    try {
      const hasIdentity = await identityAdapter.isAuthenticated();
      if (!hasIdentity) {
        setIsAuthenticated(false);
        return;
      }

      if (apiMode === "real") {
        await taggrClient.getProfile("");
      }

      setIsAuthenticated(true);
      setStatus(null);
    } catch {
      setIsAuthenticated(false);
      await identityAdapter.logout().catch(() => undefined);
      setStatus(
        "Taggr identity was present, but Taggr could not resolve it to a user. Existing Taggr accounts only work through Taggr's canonical canister frontend or a custom domain registered in Taggr's domain registry.",
      );
    }
  }

  async function logout() {
    await identityAdapter.logout().catch(() => undefined);
    setIsAuthenticated(false);
    setProfileTarget(null);
    setStatus(null);
  }

  function navigate(view: AppView) {
    if (view === "profile") setProfileTarget(null);
    setActiveView(view);
  }

  function openProfile(handle: string) {
    setSelectedPost(null);
    setProfileTarget(handle);
    setActiveView("profile");
  }

  return (
    <div className="archive-shell flex min-h-screen">
      <Sidebar
        activeView={activeView}
        appName={appName}
        isAuthenticated={isAuthenticated}
        onNavigate={navigate}
        onLogout={logout}
      />

      <div className="min-w-0 flex-1 pb-20 lg:pb-0">
        <Header
          activeView={activeView}
          appName={appName}
          query={query}
          realm={realm}
          realms={realms}
          isAuthenticated={isAuthenticated}
          onQueryChange={setQuery}
          onRealmChange={setRealm}
          onLogin={login}
          onProfile={() => {
            setProfileTarget(null);
            setActiveView("profile");
          }}
        />

        {status ? (
          <div className="border-b border-[var(--color-border)] px-4 py-2 font-mono text-xs uppercase text-[var(--color-muted)] md:px-6">
            {status}
          </div>
        ) : null}

        {activeView === "gallery" ? (
          <GalleryFeed
            realm={realm}
            query={query}
            sort={sort}
            imagesOnly={imagesOnly}
            density={density}
            feedMode={feedMode}
            onSortChange={setSort}
            onImagesOnlyChange={setImagesOnly}
            onOpenPost={setSelectedPost}
          />
        ) : null}

        {activeView === "realms" ? (
          <RealmsGrid
            realms={realms}
            onEnterRealm={(nextRealm) => {
              setRealm(nextRealm.id);
              setActiveView("gallery");
            }}
          />
        ) : null}

        {activeView === "create" ? (
          <CreatePostForm
            realms={realms}
            defaultRealm={realm ?? defaultRealm}
            isAuthenticated={isAuthenticated}
            onCreated={(post) => {
              setSelectedPost(post);
              setActiveView("gallery");
            }}
          />
        ) : null}

        {activeView === "notifications" ? <NotificationsPlaceholder /> : null}

        {activeView === "profile" ? (
          apiMode === "real" && !profileTarget && !isAuthenticated ? (
            <ProfileUnavailable onLogin={login} />
          ) : profile ? (
            <>
              <ProfileHeader profile={profile} />
              <ProfileGrid posts={profile.posts} onOpenPost={setSelectedPost} />
            </>
          ) : (
            <div className="p-6 font-mono text-xs uppercase text-[var(--color-muted)]">
              loading profile archive
            </div>
          )
        ) : null}

        {activeView === "settings" ? (
          <SettingsView
            theme={theme}
            feedMode={feedMode}
            density={density}
            realms={realms}
            defaultRealm={defaultRealm}
            imagesOnlyDefault={imagesOnlyDefault}
            summary={settingsSummary}
            onThemeChange={setTheme}
            onFeedModeChange={setFeedMode}
            onDensityChange={setDensity}
            onDefaultRealmChange={(value) => {
              setDefaultRealm(value);
              setRealm(value);
            }}
            onImagesOnlyDefaultChange={(value) => {
              setImagesOnlyDefault(value);
              setImagesOnly(value);
            }}
          />
        ) : null}
      </div>

      <BottomNav activeView={activeView} onNavigate={navigate} />

      {selectedPost ? (
        <PostDetail
          post={selectedPost}
          isAuthenticated={isAuthenticated}
          onClose={() => setSelectedPost(null)}
          onOpenPost={setSelectedPost}
          onOpenProfile={openProfile}
        />
      ) : null}
    </div>
  );
}

function ProfileUnavailable({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="grid min-h-[60vh] place-items-center p-4 md:p-6">
      <div className="max-w-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <p className="font-mono text-xs uppercase text-[var(--color-accent)]">
          profile archive unavailable
        </p>
        <h2 className="mt-4 text-2xl text-[var(--color-text)]">
          Profile view is waiting for a registered Taggr domain.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          This public IPFS preview can browse the Taggr feed, but it cannot load
          your logged-in profile until the frontend is served from a stable
          custom domain registered in Taggr's domain registry. Once that
          delegation domain is available, this view will resolve to the logged-in
          user's profile instead of a placeholder account.
        </p>
        <Button className="mt-5" onClick={onLogin} variant="secondary">
          Check login availability
        </Button>
      </div>
    </section>
  );
}

function NotificationsPlaceholder() {
  return (
    <section className="grid min-h-[60vh] place-items-center p-4 md:p-6">
      <div className="max-w-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <span className="grid h-12 w-12 place-items-center border border-[var(--color-border)] text-[var(--color-accent)]">
          <Bell size={20} />
        </span>
        <h2 className="mt-5 text-2xl text-[var(--color-text)]">
          Notification relay pending.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          This client can display notifications once the Taggr canister methods
          for mentions, replies, and reactions are mapped into the adapter.
        </p>
      </div>
    </section>
  );
}

function SettingsView({
  theme,
  density,
  feedMode,
  realms,
  defaultRealm,
  imagesOnlyDefault,
  summary,
  onThemeChange,
  onFeedModeChange,
  onDensityChange,
  onDefaultRealmChange,
  onImagesOnlyDefaultChange,
}: {
  theme: Theme;
  density: Density;
  feedMode: FeedMode;
  realms: TaggrRealm[];
  defaultRealm?: string;
  imagesOnlyDefault: boolean;
  summary: string[][];
  onThemeChange: (theme: Theme) => void;
  onFeedModeChange: (mode: FeedMode) => void;
  onDensityChange: (density: Density) => void;
  onDefaultRealmChange: (realm?: string) => void;
  onImagesOnlyDefaultChange: (value: boolean) => void;
}) {
  return (
    <section className="grid gap-5 p-4 md:p-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.38fr)]">
      <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-4 md:p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center border border-[var(--color-accent)] text-[var(--color-accent)]">
            <MonitorCog size={18} />
          </span>
          <div>
            <p className="font-mono text-xs uppercase text-[var(--color-muted)]">
              local preferences
            </p>
            <h2 className="text-2xl text-[var(--color-text)]">Settings</h2>
          </div>
        </div>

        <div className="grid gap-5">
          <SettingBlock label="Theme">
            <Segmented
              value={theme}
              options={[
                ["noir", "Noir"],
                ["amber", "Amber Terminal"],
                ["paper", "Paper Archive"],
              ]}
              onChange={(value) => onThemeChange(value as Theme)}
            />
          </SettingBlock>

          <SettingBlock label="Feed density">
            <Segmented
              value={density}
              options={[
                ["compact", "Compact"],
                ["comfortable", "Comfortable"],
                ["large", "Large gallery"],
              ]}
              onChange={(value) => onDensityChange(value as Density)}
            />
          </SettingBlock>

          <SettingBlock label="Feed style">
            <Segmented
              value={feedMode}
              options={[
                ["gallery", "Gallery"],
                ["forum", "Forum"],
              ]}
              onChange={(value) => onFeedModeChange(value as FeedMode)}
            />
          </SettingBlock>

          <SettingBlock label="Default realm">
            <select
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 font-mono text-sm text-[var(--color-text)]"
              value={defaultRealm ?? ""}
              onChange={(event) =>
                onDefaultRealmChange(event.target.value || undefined)
              }
            >
              <option value="">All realms</option>
              {realms.map((realm) => (
                <option key={realm.id} value={realm.id}>
                  {realm.name}
                </option>
              ))}
            </select>
          </SettingBlock>

          <SettingBlock label="Feed default">
            <Toggle
              checked={imagesOnlyDefault}
              label="Images-only default"
              onChange={onImagesOnlyDefaultChange}
            />
          </SettingBlock>
        </div>
      </div>

      <aside className="border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
        <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase text-[var(--color-muted)]">
          <Save size={14} />
          Saved locally
        </div>
        <dl className="grid gap-2">
          {summary.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border border-[var(--color-border)] px-3 py-2"
            >
              <dt className="font-mono text-[11px] uppercase text-[var(--color-muted)]">
                {label}
              </dt>
              <dd className="text-sm text-[var(--color-soft)]">{value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}

function SettingBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase text-[var(--color-muted)]">
        {label}
      </p>
      {children}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className={`grid gap-2 ${
        options.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
      }`}
    >
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`border px-3 py-3 font-mono text-xs uppercase transition ${
            value === optionValue
              ? "border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[var(--color-text)]"
              : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
