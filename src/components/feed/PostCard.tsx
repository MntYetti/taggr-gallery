import { DollarSign, MessageCircle, Sparkles } from "lucide-react";
import type { TaggrPost } from "../../lib/taggr/taggrTypes";
import { formatRelative } from "../../lib/utils/formatDate";
import { imageAlt } from "../../lib/utils/image";
import { formatUsd, postRewardUsd, rewardCreditsLabel } from "../../lib/utils/rewards";
import { MarkdownContent } from "../content/MarkdownContent";
import { Badge } from "../ui/Badge";

export function PostCard({
  post,
  onOpen,
}: {
  post: TaggrPost;
  onOpen: (post: TaggrPost) => void;
}) {
  return (
    <article className="group w-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-panel)] transition hover:border-[var(--color-accent)]">
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => onOpen(post)}
      >
        {post.imageUrl ? (
          <div className="grain relative bg-[var(--color-panel-strong)]">
            <img
              src={post.imageUrl}
              alt={imageAlt(post.authorHandle, post.realm)}
              className="h-auto w-full object-cover grayscale-[18%] transition duration-300 group-hover:grayscale-0"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 hidden bg-[linear-gradient(transparent,rgba(0,0,0,0.76))] p-3 text-white opacity-0 transition group-hover:opacity-100 md:block">
              <Meta post={post} overlay />
            </div>
          </div>
        ) : (
          <div className="min-h-48 border-b border-[var(--color-border)] bg-[var(--color-panel-strong)] p-5">
            <Badge>text signal</Badge>
            <MarkdownContent
              compact
              className="feed-card-copy mt-6"
              disableLinks
              source={post.bodyMarkdown ?? post.text}
            />
          </div>
        )}

        <div className="space-y-3 p-3">
          <div className="md:group-hover:opacity-80">
            <Meta post={post} />
          </div>
          {post.imageUrl ? (
            <MarkdownContent
              compact
              className="feed-card-copy feed-card-copy-small"
              disableLinks
              source={post.bodyMarkdown ?? post.text}
            />
          ) : null}
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase text-[var(--color-muted)]">
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
        </div>
      </button>
    </article>
  );
}

function Meta({ post, overlay = false }: { post: TaggrPost; overlay?: boolean }) {
  return (
    <div
      className={`font-mono text-[11px] uppercase ${
        overlay ? "text-white/84" : "text-[var(--color-muted)]"
      }`}
    >
      <span className={overlay ? "text-white" : "text-[var(--color-accent)]"}>
        {post.realm ?? "taggr"}
      </span>
      <span> / {post.authorHandle}</span>
      <span> / {formatRelative(post.createdAt)}</span>
    </div>
  );
}
