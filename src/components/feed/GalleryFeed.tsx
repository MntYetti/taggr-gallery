import { useEffect, useRef, useState } from "react";
import { taggrClient } from "../../lib/taggr/taggrClient";
import type { TaggrPost, TaggrSort } from "../../lib/taggr/taggrTypes";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";
import { FeedFilters } from "./FeedFilters";
import { ForumPostRow } from "./ForumPostRow";
import { MasonryGrid } from "./MasonryGrid";
import { PostCard } from "./PostCard";

export function GalleryFeed({
  realm,
  query,
  sort,
  imagesOnly,
  density,
  feedMode,
  onSortChange,
  onImagesOnlyChange,
  onOpenPost,
}: {
  realm?: string;
  query: string;
  sort: TaggrSort;
  imagesOnly: boolean;
  density: "compact" | "comfortable" | "large";
  feedMode: "gallery" | "forum";
  onSortChange: (sort: TaggrSort) => void;
  onImagesOnlyChange: (imagesOnly: boolean) => void;
  onOpenPost: (post: TaggrPost) => void;
}) {
  const [posts, setPosts] = useState<TaggrPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  function mergePosts(current: TaggrPost[], incoming: TaggrPost[]) {
    const seen = new Set(current.map((post) => post.id));
    return [...current, ...incoming.filter((post) => !seen.has(post.id))];
  }

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setIsLoadingMore(false);
    setError(null);
    setPage(0);
    setOffset(0);
    setHasMore(true);

    taggrClient
      .getFeed({ realm, query, sort, imagesOnly, page: 0 })
      .then((nextPosts) => {
        if (requestIdRef.current !== requestId) return;
        setPosts(nextPosts);
        setOffset(Number(nextPosts[0]?.id) || 0);
        setHasMore(nextPosts.length > 0);
      })
      .catch((err: Error) => {
        if (requestIdRef.current === requestId) setError(err.message);
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setIsLoading(false);
      });
  }, [realm, query, sort, imagesOnly]);

  async function loadMore() {
    if (isLoading || isLoadingMore || !hasMore || error) return;

    const nextPage = page + 1;
    const requestId = requestIdRef.current;
    setIsLoadingMore(true);

    try {
      const nextPosts = await taggrClient.getFeed({
        realm,
        query,
        sort,
        imagesOnly,
        page: nextPage,
        offset,
      });
      if (requestIdRef.current !== requestId) return;
      setPosts((current) => mergePosts(current, nextPosts));
      setPage(nextPage);
      setHasMore(nextPosts.length > 0);
    } catch (err) {
      if (requestIdRef.current === requestId) {
        setError(err instanceof Error ? err.message : "Could not load more posts");
      }
    } finally {
      if (requestIdRef.current === requestId) setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    const node = loaderRef.current;
    if (!node || !hasMore || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void loadMore();
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [posts.length, hasMore, error, isLoading, isLoadingMore, page, offset]);

  return (
    <section>
      <FeedFilters
        sort={sort}
        imagesOnly={imagesOnly}
        density={density}
        feedMode={feedMode}
        onSortChange={onSortChange}
        onImagesOnlyChange={onImagesOnlyChange}
      />

      {isLoading ? (
        <MasonryGrid density={density}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              key={index}
              className={index % 3 === 0 ? "h-96" : "h-72"}
            />
          ))}
        </MasonryGrid>
      ) : null}

      {!isLoading && error ? (
        <div className="m-6 border border-[var(--color-danger)] p-6">
          <p className="text-lg text-[var(--color-text)]">Feed unavailable</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && posts.length ? (
        <>
          {feedMode === "gallery" ? (
            <MasonryGrid density={density}>
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  priority={index < 6}
                  onOpen={onOpenPost}
                />
              ))}
            </MasonryGrid>
          ) : (
            <div className="grid gap-3 p-4 md:p-6">
              {posts.map((post) => (
                <ForumPostRow key={post.id} post={post} onOpen={onOpenPost} />
              ))}
            </div>
          )}
          <div
            ref={loaderRef}
            className="flex justify-center border-t border-[var(--color-border)] px-4 py-6"
          >
            {hasMore ? (
              <Button
                disabled={isLoadingMore}
                onClick={loadMore}
                variant="secondary"
              >
                {isLoadingMore ? "Loading archive..." : "Load more"}
              </Button>
            ) : (
              <span className="font-mono text-xs uppercase text-[var(--color-muted)]">
                end of archive window
              </span>
            )}
          </div>
        </>
      ) : null}

      {!isLoading && !error && !posts.length ? (
        <div className="m-6 flex min-h-72 flex-col items-start justify-center border border-[var(--color-border)] p-8">
          <p className="font-mono text-xs uppercase text-[var(--color-muted)]">
            no matching artifacts
          </p>
          <h2 className="mt-3 text-2xl text-[var(--color-text)]">
            The archive is quiet here.
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--color-muted)]">
            Try another realm, loosen the search, or include text-only posts in
            the feed.
          </p>
          <Button
            className="mt-5"
            variant="primary"
            onClick={() => onImagesOnlyChange(false)}
          >
            Show all posts
          </Button>
        </div>
      ) : null}
    </section>
  );
}
