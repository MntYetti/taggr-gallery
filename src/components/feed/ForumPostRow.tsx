import { DollarSign, MessageCircle, Sparkles } from "lucide-react";
import type { TaggrPost } from "../../lib/taggr/taggrTypes";
import { formatRelative } from "../../lib/utils/formatDate";
import { imageAlt } from "../../lib/utils/image";
import { formatUsd, postRewardUsd, rewardCreditsLabel } from "../../lib/utils/rewards";
import { MarkdownContent } from "../content/MarkdownContent";
import { Badge } from "../ui/Badge";

export function ForumPostRow({
  post,
  onOpen,
}: {
  post: TaggrPost;
  onOpen: (post: TaggrPost) => void;
}) {
  const source = post.bodyMarkdown ?? post.text;

  return (
    <article className="forum-row border border-[var(--color-border)] bg-[var(--color-panel)] transition hover:border-[var(--color-accent)]">
      <div className="grid gap-0 md:grid-cols-[4.5rem_minmax(0,1fr)_10rem]">
        <div className="hidden border-r border-[var(--color-border)] p-3 md:grid md:content-start md:justify-items-center md:gap-3">
          <span className="font-mono text-[10px] uppercase text-[var(--color-muted)]">
            signal
          </span>
          <span className="text-xl text-[var(--color-accent)]">
            {post.reactionsCount}
          </span>
        </div>

        <button
          className="min-w-0 p-4 text-left"
          onClick={() => onOpen(post)}
          type="button"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge>{post.realm ?? "taggr"}</Badge>
            <span className="font-mono text-[11px] uppercase text-[var(--color-muted)]">
              {post.authorHandle} / {formatRelative(post.createdAt)}
            </span>
          </div>
          <MarkdownContent
            compact
            disableLinks
            className="forum-row-copy"
            source={source}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={13} />
              {post.commentsCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Sparkles size={13} />
              {post.reactionsCount}
            </span>
            <span
              className="inline-flex items-center gap-1"
              title={rewardCreditsLabel(post.rewardsAmount ?? 0)}
            >
              <DollarSign size={13} />
              {formatUsd(postRewardUsd(post))}
            </span>
          </div>
        </button>

        <button
          aria-label={`Open post by ${post.authorHandle}`}
          className="hidden border-l border-[var(--color-border)] bg-[var(--color-panel-strong)] md:block"
          onClick={() => onOpen(post)}
          type="button"
        >
          {post.imageUrl ? (
            <img
              alt={imageAlt(post.authorHandle, post.realm)}
              className="h-full max-h-40 w-full object-cover grayscale-[18%] transition hover:grayscale-0"
              loading="lazy"
              src={post.imageUrl}
            />
          ) : (
            <span className="grid h-full min-h-32 place-items-center font-mono text-[10px] uppercase text-[var(--color-muted)]">
              text
            </span>
          )}
        </button>
      </div>
    </article>
  );
}
