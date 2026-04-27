import { Eye } from "lucide-react";
import type { CreatePostInput } from "../../lib/taggr/taggrTypes";
import { Badge } from "../ui/Badge";
import { PollPanel } from "../post/PollPanel";

export function PostPreview({ input }: { input: CreatePostInput }) {
  const previewImageUrl = input.attachment?.previewUrl ?? input.imageUrl;
  const poll = input.poll
    ? {
        options: input.poll.options.map((option) => option.trim()).filter(Boolean),
        votes: {},
        voters: [],
        deadline: input.poll.deadline,
        weighted_by_karma: {},
        weighted_by_tokens: {},
      }
    : undefined;

  return (
    <aside className="border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
      <div className="mb-3 flex items-center justify-between">
        <Badge>{input.realm || "no realm"}</Badge>
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase text-[var(--color-muted)]">
          <Eye size={13} />
          preview
        </span>
      </div>
      {previewImageUrl ? (
        <img
          src={previewImageUrl}
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
      {input.repostId ? (
        <p className="border border-[var(--color-border)] bg-[var(--color-panel-strong)] px-3 py-2 font-mono text-[11px] uppercase text-[var(--color-muted)]">
          Repost target: #{input.repostId}
        </p>
      ) : null}
      {poll?.options.length ? <PollPanel poll={poll} preview /> : null}
    </aside>
  );
}
