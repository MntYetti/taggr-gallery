import type { TaggrProfile } from "../../lib/taggr/taggrTypes";
import { Badge } from "../ui/Badge";

export function ProfileHeader({ profile }: { profile: TaggrProfile }) {
  return (
    <section className="grid gap-5 border-b border-[var(--color-border)] p-4 md:grid-cols-[auto_minmax(0,1fr)] md:p-6">
      <div className="h-28 w-28 overflow-hidden border border-[var(--color-border)] bg-[var(--color-panel)]">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={`${profile.handle} avatar`}
            className="h-full w-full object-cover grayscale-[20%]"
            referrerPolicy="no-referrer"
          />
        ) : null}
      </div>
      <div>
        <Badge>{profile.userId}</Badge>
        <h2 className="mt-3 text-3xl text-[var(--color-text)]">
          {profile.handle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          {profile.bio}
        </p>
        <dl className="mt-5 grid max-w-xl grid-cols-4 gap-2">
          {[
            ["posts", profile.stats?.posts ?? profile.posts.length],
            ["comments", profile.stats?.comments ?? 0],
            ["rewards", profile.stats?.rewards ?? 0],
            ["rep", profile.stats?.reputation ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="border border-[var(--color-border)] p-2">
              <dt className="font-mono text-[10px] uppercase text-[var(--color-muted)]">
                {label}
              </dt>
              <dd className="mt-1 text-lg text-[var(--color-text)]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
