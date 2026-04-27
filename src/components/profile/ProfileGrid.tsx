import type { TaggrPost } from "../../lib/taggr/taggrTypes";
import { PostCard } from "../feed/PostCard";

export function ProfileGrid({
  posts,
  onOpenPost,
}: {
  posts: TaggrPost[];
  onOpenPost: (post: TaggrPost) => void;
}) {
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
    </section>
  );
}
