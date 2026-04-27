import { CornerDownRight, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { taggrClient } from "../../lib/taggr/taggrClient";
import type { TaggrComment } from "../../lib/taggr/taggrTypes";
import { formatDate } from "../../lib/utils/formatDate";
import { MarkdownContent } from "../content/MarkdownContent";
import { Button } from "../ui/Button";

type CommentNode = TaggrComment & { replies: CommentNode[] };

export function CommentThread({
  postId,
  comments,
  isAuthenticated,
  onCommentCreated,
  onOpenProfile,
}: {
  postId: string;
  comments: TaggrComment[];
  isAuthenticated: boolean;
  onCommentCreated: (comment: TaggrComment) => void;
  onOpenProfile: (handle: string) => void;
}) {
  const [text, setText] = useState("");
  const [replyTarget, setReplyTarget] = useState<TaggrComment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roots = useMemo(
    () => buildCommentTree(comments, postId),
    [comments, postId],
  );

  async function submitComment() {
    if (!text.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const comment = await taggrClient.createComment({
        postId,
        parentId: replyTarget?.id,
        text,
      });
      onCommentCreated(comment);
      setReplyTarget(null);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase text-[var(--color-muted)]">
          Comments
        </h3>
        <span className="font-mono text-xs text-[var(--color-muted)]">
          {comments.length}
        </span>
      </div>

      {isAuthenticated ? (
        <div className="mb-5 grid gap-2">
          {replyTarget ? (
            <div className="flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 font-mono text-[11px] uppercase text-[var(--color-muted)]">
              <span className="inline-flex items-center gap-2">
                <CornerDownRight size={13} />
                Replying to {replyTarget.authorHandle}
              </span>
              <button
                aria-label="Cancel reply"
                className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                onClick={() => setReplyTarget(null)}
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          ) : null}
          <textarea
            className="min-h-24 border border-[var(--color-border)] bg-[var(--color-panel)] p-3 text-sm leading-6 text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
            placeholder="Add a quiet note to the thread"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <Button
            className="justify-self-start"
            disabled={isSubmitting || !text.trim()}
            onClick={submitComment}
            variant="primary"
          >
            <Send size={16} />
            Send
          </Button>
        </div>
      ) : (
        <p className="mb-5 border border-[var(--color-border)] p-3 font-mono text-xs uppercase text-[var(--color-muted)]">
          Login through a registered Taggr delegation domain to comment.
        </p>
      )}

      {error ? (
        <p className="mb-5 border border-[var(--color-danger)] p-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        {roots.map((comment) => (
          <CommentNodeView
            key={comment.id}
            comment={comment}
            isAuthenticated={isAuthenticated}
            level={0}
            onOpenProfile={onOpenProfile}
            onReply={setReplyTarget}
          />
        ))}
      </div>
    </section>
  );
}

function buildCommentTree(comments: TaggrComment[], postId: string) {
  const nodes = new Map<string, CommentNode>();
  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, replies: [] });
  });

  const roots: CommentNode[] = [];
  nodes.forEach((node) => {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function CommentNodeView({
  comment,
  isAuthenticated,
  level,
  onOpenProfile,
  onReply,
}: {
  comment: CommentNode;
  isAuthenticated: boolean;
  level: number;
  onOpenProfile: (handle: string) => void;
  onReply: (comment: TaggrComment) => void;
}) {
  return (
    <div className="space-y-3">
      <article
        className="border border-[var(--color-border)] bg-[var(--color-panel)] p-3"
        style={{ marginLeft: `${Math.min(level, 4) * 18}px` }}
      >
        <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase text-[var(--color-muted)]">
          <button
            className="text-[var(--color-accent)] hover:underline"
            onClick={() => onOpenProfile(comment.authorHandle)}
            type="button"
          >
            {comment.authorHandle}
          </button>
          <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
        </div>
        <div className="mt-2">
          <MarkdownContent
            compact
            source={comment.bodyMarkdown ?? comment.text}
          />
        </div>
        {isAuthenticated ? (
          <button
            className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase text-[var(--color-muted)] hover:text-[var(--color-accent)]"
            onClick={() => onReply(comment)}
            type="button"
          >
            <CornerDownRight size={13} />
            Reply
          </button>
        ) : null}
      </article>

      {comment.replies.map((reply) => (
        <CommentNodeView
          key={reply.id}
          comment={reply}
          isAuthenticated={isAuthenticated}
          level={level + 1}
          onOpenProfile={onOpenProfile}
          onReply={onReply}
        />
      ))}
    </div>
  );
}
