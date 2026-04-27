import { useEffect, useRef } from "react";
import type { TaggrPost } from "../../lib/taggr/taggrTypes";
import { PostCard } from "../feed/PostCard";
import { Button } from "../ui/Button";

export function ProfileGrid({
  posts,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onOpenPost,
}: {
  posts: TaggrPost[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onOpenPost: (post: TaggrPost) => void;
}) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = loaderRef.current;
    if (!node || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMore();
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, posts.length]);

  return (
    <section className="p-4 md:p-6">
      <h3 className="mb-4 font-mono text-xs uppercase text-[var(--color-muted)]">
        user archive
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onOpen={onOpenPost} />
        ))}
      </div>
      <div
        ref={loaderRef}
        className="mt-6 flex justify-center border-t border-[var(--color-border)] pt-6"
      >
        {hasMore ? (
          <Button
            disabled={isLoadingMore}
            onClick={onLoadMore}
            variant="secondary"
          >
            {isLoadingMore ? "Loading profile..." : "Load more"}
          </Button>
        ) : (
          <span className="font-mono text-xs uppercase text-[var(--color-muted)]">
            end of user archive
          </span>
        )}
      </div>
    </section>
  );
}
