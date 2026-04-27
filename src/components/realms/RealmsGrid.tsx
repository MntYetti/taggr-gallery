import type { TaggrRealm } from "../../lib/taggr/taggrTypes";
import { RealmCard } from "./RealmCard";

export function RealmsGrid({
  realms,
  onEnterRealm,
}: {
  realms: TaggrRealm[];
  onEnterRealm: (realm: TaggrRealm) => void;
}) {
  return (
    <section className="p-4 md:p-6">
      <div className="mb-5 max-w-2xl">
        <p className="font-mono text-xs uppercase text-[var(--color-muted)]">
          realm index
        </p>
        <h2 className="mt-2 text-2xl text-[var(--color-text)]">
          Community rooms as visual shelves.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {realms.map((realm) => (
          <RealmCard key={realm.id} realm={realm} onEnter={onEnterRealm} />
        ))}
      </div>
    </section>
  );
}
