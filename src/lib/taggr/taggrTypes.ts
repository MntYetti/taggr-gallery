export type TaggrSort = "latest" | "trending" | "comments" | "rewards";

export type TaggrPost = {
  id: string;
  authorId: string;
  authorHandle: string;
  realm?: string;
  text: string;
  bodyMarkdown?: string;
  imageUrl?: string;
  mediaUrls?: string[];
  createdAt: string;
  commentsCount: number;
  reactionsCount: number;
  /** Raw Taggr reward credits. 1000 credits = 1 XDR. */
  rewardsAmount?: number;
  rewardsUsd?: number;
  reactionOptions?: TaggrReaction[];
  canonicalUrl?: string;
};

export type TaggrReaction = {
  id: number;
  label: string;
  reward: number;
  count: number;
};

export type TaggrRealm = {
  id: string;
  name: string;
  description?: string;
  imagePreviewUrls?: string[];
  postsCount?: number;
  membersCount?: number;
};

export type TaggrComment = {
  id: string;
  postId: string;
  parentId?: string;
  authorHandle: string;
  text: string;
  bodyMarkdown?: string;
  createdAt: string;
};

export type TaggrProfile = {
  userId: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  posts: TaggrPost[];
  stats?: {
    posts?: number;
    comments?: number;
    rewards?: number;
    reputation?: number;
  };
};

export type FeedParams = {
  realm?: string;
  sort?: TaggrSort;
  imagesOnly?: boolean;
  query?: string;
  page?: number;
};

export type CreatePostInput = {
  text: string;
  realm?: string;
  imageUrl?: string;
};

export type CreateCommentInput = {
  postId: string;
  parentId?: string;
  text: string;
};

export interface TaggrClient {
  getFeed(params: FeedParams): Promise<TaggrPost[]>;
  getPost(id: string): Promise<TaggrPost | null>;
  getComments(postId: string): Promise<TaggrComment[]>;
  getRealms(): Promise<TaggrRealm[]>;
  getProfile(userId: string): Promise<TaggrProfile>;
  createPost(input: CreatePostInput): Promise<TaggrPost>;
  createComment(input: CreateCommentInput): Promise<TaggrComment>;
  reactToPost(postId: string, reactionId?: number): Promise<void>;
}
