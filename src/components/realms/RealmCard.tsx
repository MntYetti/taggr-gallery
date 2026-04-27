import { ArrowRight, Users } from "lucide-react";
import type { TaggrRealm } from "../../lib/taggr/taggrTypes";
import { Button } from "../ui/Button";

export function RealmCard({
  realm,
  onEnter,
}: {
  realm: TaggrRealm;
  onEnter: (realm: TaggrRealm) => void;
}) {
  const previews = realm.imagePreviewUrls?.slice(0, 4) ?? [];

  return (
    <article className="grid gap-4 border border-[var(--color-border)] bg-[var(--color-panel)] p-3 transition hover:border-[var(--color-accent)]">
      <div className="grid h-44 grid-cols-2 gap-1 overflow-hidden bg-[var(--color-panel-strong)]">
        {previews.length ? (
          previews.map((url) => (
            <img
              key={url}
              src={url}
              alt={`Recent visual from ${realm.name}`}
              className="h-full w-full object-cover grayscale-[22%]"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ))
        ) : (
          <div className="col-span-2 grid place-items-center font-mono text-xs uppercase text-[var(--color-muted)]">
            no preview
          </div>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            {realm.name}
          </h2>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase text-[var(--color-muted)]">
            <Users size={13} />
            {realm.membersCount ?? 0}
          </span>
        </div>
        <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--color-muted)]">
          {realm.description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
        <span className="font-mono text-[11px] uppercase text-[var(--color-muted)]">
          {realm.postsCount ?? 0} posts
        </span>
        <Button variant="ghost" onClick={() => onEnter(realm)}>
          Enter
          <ArrowRight size={16} />
        </Button>
      </div>
    </article>
  );
}
