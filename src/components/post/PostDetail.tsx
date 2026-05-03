import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { taggrClient } from "../../lib/taggr/taggrClient";
import type { TaggrComment, TaggrPost } from "../../lib/taggr/taggrTypes";
import { formatDate } from "../../lib/utils/formatDate";
import { imageAlt } from "../../lib/utils/image";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { PostCard } from "../feed/PostCard";
import { MarkdownContent } from "../content/MarkdownContent";
import { CommentThread } from "./CommentThread";
import { PollPanel } from "./PollPanel";
import { ReactionBar } from "./ReactionBar";

export function PostDetail({
  post,
  isAuthenticated,
  canEdit,
  onClose,
  onEditPost,
  onOpenPost,
  onOpenProfile,
  onQuotePost,
}: {
  post: TaggrPost;
  isAuthenticated: boolean;
  canEdit?: boolean;
  onClose: () => void;
  onEditPost: (post: TaggrPost) => void;
  onOpenPost: (post: TaggrPost) => void;
  onOpenProfile: (handle: string) => void;
  onQuotePost: (post: TaggrPost) => void;
}) {
  const [comments, setComments] = useState<TaggrComment[]>([]);
  const [related, setRelated] = useState<TaggrPost[]>([]);
  const [repost, setRepost] = useState<TaggrPost | null>(null);
  const [activePost, setActivePost] = useState(post);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActivePost(post);
    setActiveMediaIndex(0);
    setRepost(null);
    taggrClient.getComments(post.id).then(setComments);
    taggrClient
      .getFeed({ realm: post.realm, imagesOnly: true, sort: "trending" })
      .then((items) => setRelated(items.filter((item) => item.id !== post.id).slice(0, 3)));
  }, [post]);

  useEffect(() => {
    if (!activePost.repostId) {
      setRepost(null);
      return;
    }

    taggrClient.getPost(activePost.repostId).then(setRepost).catch(() => setRepost(null));
  }, [activePost.repostId]);

  async function react(reactionId: number) {
    setError(null);
    try {
      await taggrClient.reactToPost(activePost.id, reactionId);
      const nextPost = await taggrClient.getPost(activePost.id);
      if (nextPost) setActivePost(nextPost);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not react to post");
    }
  }

  async function copyLink() {
    const link = activePost.canonicalUrl ?? `${window.location.origin}/?post=${activePost.id}`;
    await navigator.clipboard.writeText(link);
  }

  async function voteOnPoll(option: number, anonymously: boolean) {
    setError(null);
    try {
      await taggrClient.voteOnPoll(activePost.id, option, anonymously);
      const nextPost = await taggrClient.getPost(activePost.id);
      if (nextPost) setActivePost(nextPost);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not vote on poll");
    }
  }

  const body = activePost.bodyMarkdown ?? activePost.text;
  const mediaUrls =
    activePost.mediaUrls?.length
      ? activePost.mediaUrls
      : activePost.imageUrl
        ? [activePost.imageUrl]
        : [];
  const hasImage = mediaUrls.length > 0;

  return (
    <Modal title={`post ${activePost.id}`} onClose={onClose}>
      <div
        className={
          hasImage
            ? "grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]"
            : "grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)]"
        }
      >
        <div className="border-b border-[var(--color-border)] bg-black/20 lg:border-b-0 lg:border-r">
          {hasImage ? (
            <PostImageGallery
              activeIndex={activeMediaIndex}
              aspectRatios={activePost.mediaAspectRatios}
              authorHandle={activePost.authorHandle}
              realm={activePost.realm}
              urls={mediaUrls}
              onActiveIndexChange={setActiveMediaIndex}
            />
          ) : (
            <div className="p-5 md:p-8">
              <MarkdownContent className="post-detail-primary-copy" source={body} />
            </div>
          )}
        </div>

        <aside className="space-y-5 p-4 md:p-6">
          <div className="space-y-3">
            <Badge>{activePost.realm ?? "taggr"}</Badge>
            <div>
              <button
                className="font-mono text-xs uppercase text-[var(--color-accent)] hover:underline"
                onClick={() => onOpenProfile(activePost.authorHandle)}
                type="button"
              >
                {activePost.authorHandle}
              </button>
              <time
                className="font-mono text-[11px] uppercase text-[var(--color-muted)]"
                dateTime={activePost.createdAt}
              >
                {formatDate(activePost.createdAt)}
              </time>
            </div>
            {hasImage ? <MarkdownContent source={body} /> : null}
          </div>

          {activePost.poll ? (
            <PollPanel
              poll={activePost.poll}
              createdAt={activePost.createdAt}
              isAuthenticated={isAuthenticated}
              onVote={voteOnPoll}
            />
          ) : null}

          {repost ? (
            <section className="space-y-3 border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
              <p className="font-mono text-xs uppercase text-[var(--color-muted)]">
                Quoted fragment
              </p>
              <PostCard post={repost} onOpen={onOpenPost} />
            </section>
          ) : null}

          <ReactionBar
            post={activePost}
            isAuthenticated={isAuthenticated}
            canEdit={canEdit}
            onReact={react}
            onEditPost={() => onEditPost(activePost)}
            onQuotePost={() => onQuotePost(activePost)}
            onCopyLink={copyLink}
          />

          {error ? (
            <p className="border border-[var(--color-danger)] p-3 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          ) : null}

          <CommentThread
            postId={activePost.id}
            comments={comments}
            isAuthenticated={isAuthenticated}
            onCommentCreated={(comment) => setComments((items) => [comment, ...items])}
            onOpenProfile={onOpenProfile}
          />

          {related.length ? (
            <section>
              <h3 className="mb-3 font-mono text-xs uppercase text-[var(--color-muted)]">
                Related fragments
              </h3>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {related.map((item) => (
                  <PostCard
                    key={item.id}
                    post={item}
                    onOpen={(nextPost) => {
                      onOpenPost(nextPost);
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </Modal>
  );
}

function PostImageGallery({
  activeIndex,
  aspectRatios,
  authorHandle,
  realm,
  urls,
  onActiveIndexChange,
}: {
  activeIndex: number;
  aspectRatios?: number[];
  authorHandle: string;
  realm?: string;
  urls: string[];
  onActiveIndexChange: (index: number) => void;
}) {
  const activeUrl = urls[activeIndex] ?? urls[0];
  const hasMultipleImages = urls.length > 1;
  const aspectRatio = aspectRatios?.[activeIndex] || undefined;

  function move(step: number) {
    onActiveIndexChange((activeIndex + step + urls.length) % urls.length);
  }

  return (
    <div className="grid min-h-[42vh] content-between gap-3 p-3">
      <div
        className="relative grid place-items-center overflow-hidden bg-black/30"
        style={{ aspectRatio: aspectRatio ?? 4 / 3 }}
      >
        <button
          aria-label={
            hasMultipleImages ? "Show next image" : "Open image in a new tab"
          }
          className="h-full max-h-[78vh] w-full"
          onClick={() => {
            if (hasMultipleImages) move(1);
            else window.open(activeUrl, "_blank", "noopener,noreferrer");
          }}
          type="button"
        >
          <img
            src={activeUrl}
            alt={imageAlt(authorHandle, realm)}
            className="h-full max-h-[78vh] w-full object-contain"
            referrerPolicy="no-referrer"
          />
        </button>

        {hasMultipleImages ? (
          <>
            <button
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center border border-white/20 bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
              onClick={() => move(-1)}
              type="button"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center border border-white/20 bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
              onClick={() => move(1)}
              type="button"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 border border-white/20 bg-black/60 px-2 py-1 font-mono text-[10px] uppercase text-white">
              {activeIndex + 1} / {urls.length}
            </span>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="grid grid-flow-col auto-cols-[5.5rem] gap-2 overflow-x-auto pb-1">
          {urls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              aria-label={`Show image ${index + 1}`}
              className={`h-20 overflow-hidden border bg-[var(--color-panel-strong)] ${
                index === activeIndex
                  ? "border-[var(--color-accent)]"
                  : "border-[var(--color-border)]"
              }`}
              onClick={() => onActiveIndexChange(index)}
              type="button"
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
