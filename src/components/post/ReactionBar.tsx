import { Copy, DollarSign, ExternalLink, MessageCircle, Pencil } from "lucide-react";
import type { TaggrPost } from "../../lib/taggr/taggrTypes";
import { formatUsd, postRewardUsd, rewardCreditsLabel } from "../../lib/utils/rewards";
import { Button } from "../ui/Button";
import { ReactionEmoji, reactionEmojiLabel } from "./ReactionEmoji";

export function ReactionBar({
  post,
  isAuthenticated,
  canEdit,
  onReact,
  onEditPost,
  onQuotePost,
  onCopyLink,
}: {
  post: TaggrPost;
  isAuthenticated: boolean;
  canEdit?: boolean;
  onReact: (reactionId: number) => void;
  onEditPost: () => void;
  onQuotePost: () => void;
  onCopyLink: () => void;
}) {
  const reactions = post.reactionOptions ?? [];

  return (
    <div className="space-y-3 border-y border-[var(--color-border)] py-3">
      <div className="flex flex-wrap items-center gap-2">
        {reactions.map((reaction) => (
          <Button
            key={reaction.id}
            disabled={!isAuthenticated}
            onClick={() => onReact(reaction.id)}
            size="sm"
            title={`${reactionEmojiLabel(reaction.id)}; reward points: ${
              reaction.reward
            }`}
            variant={reaction.count ? "secondary" : "ghost"}
          >
            <ReactionEmoji id={reaction.id} />
            <span>{reaction.count}</span>
            <span className="text-[10px] opacity-70">
              {reaction.reward > 0 ? `+${reaction.reward}` : reaction.reward}
            </span>
          </Button>
        ))}
        {!reactions.length ? (
          <span className="font-mono text-xs uppercase text-[var(--color-muted)]">
            {post.reactionsCount} reactions
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-11 items-center gap-2 border border-[var(--color-border)] px-3 font-mono text-xs uppercase text-[var(--color-muted)]">
          <MessageCircle size={15} />
          {post.commentsCount}
        </span>
        <span
          className="inline-flex h-11 items-center gap-2 border border-[var(--color-border)] px-3 font-mono text-xs uppercase text-[var(--color-muted)]"
          title={rewardCreditsLabel(post.rewardsAmount ?? 0)}
        >
          <DollarSign size={15} />
          {formatUsd(postRewardUsd(post))}
        </span>
        <Button variant="ghost" onClick={onCopyLink}>
          <Copy size={16} />
          Copy
        </Button>
        <Button variant="ghost" onClick={onQuotePost}>
          Quote
        </Button>
        {canEdit ? (
          <Button variant="ghost" onClick={onEditPost}>
            <Pencil size={16} />
            Edit
          </Button>
        ) : null}
        {post.canonicalUrl ? (
          <a
            className="inline-flex h-11 items-center justify-center gap-2 border border-transparent px-4 font-mono text-sm uppercase text-[var(--color-muted)] transition hover:bg-[var(--color-panel)] hover:text-[var(--color-text)]"
            href={post.canonicalUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink size={16} />
            Canonical
          </a>
        ) : null}
      </div>
    </div>
  );
}
