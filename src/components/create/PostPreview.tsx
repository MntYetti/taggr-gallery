import { Eye } from "lucide-react";
import type { CreatePostInput } from "../../lib/taggr/taggrTypes";
import { Badge } from "../ui/Badge";

export function PostPreview({ input }: { input: CreatePostInput }) {
  return (
    <aside className="border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
      <div className="mb-3 flex items-center justify-between">
        <Badge>{input.realm || "no realm"}</Badge>
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase text-[var(--color-muted)]">
          <Eye size={13} />
          preview
        </span>
      </div>
      {input.imageUrl ? (
        <img
          src={input.imageUrl}
          alt="Post preview"
          className="mb-3 max-h-96 w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="mb-3 grid h-56 place-items-center border border-[var(--color-border)] font-mono text-xs uppercase text-[var(--color-muted)]">
          image placeholder
        </div>
      )}
      <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-soft)]">
        {input.text || "Compose text to preview the post body."}
      </p>
    </aside>
  );
}
