import type {
  CreateCommentInput,
  CreatePostInput,
  EditPostInput,
  FeedParams,
  TaggrClient,
  TaggrComment,
  TaggrPoll,
  TaggrPost,
  TaggrProfile,
  TaggrRealm,
} from "./taggrTypes";

const now = new Date();
const mockFeedPageSize = 8;

function profilePostsFor(userIdOrHandle: string) {
  return posts.filter(
    (post) => post.authorId === userIdOrHandle || post.authorHandle === userIdOrHandle,
  );
}

function createPoll(poll?: CreatePostInput["poll"]): TaggrPoll | undefined {
  if (!poll) return undefined;

  return {
    options: poll.options,
    votes: {},
    voters: [],
    deadline: poll.deadline,
    weighted_by_karma: {},
    weighted_by_tokens: {},
  };
}

function daysAgo(days: number, hours = 0) {
  const date = new Date(now);
  date.setDate(now.getDate() - days);
  date.setHours(now.getHours() - hours);
  return date.toISOString();
}

const posts: TaggrPost[] = [
  {
    id: "post-001",
    authorId: "user-orbit",
    authorHandle: "orbit.cache",
    realm: "meme-machines",
    text: "Low fidelity market omen, archived from a midnight scroll. The compression is the point.",
    imageUrl:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=78",
    mediaUrls: [
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=78",
    ],
    createdAt: daysAgo(0, 2),
    commentsCount: 18,
    reactionsCount: 91,
    rewardsAmount: 4200,
    canonicalUrl: "https://taggr.link/#/post/post-001",
  },
  {
    id: "post-002",
    authorId: "user-linea",
    authorHandle: "linea.null",
    realm: "generative-art",
    text: "A study in grid fatigue. Each cell drifts from the last like a bad memory of a terminal window.",
    imageUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=78",
    createdAt: daysAgo(0, 8),
    commentsCount: 7,
    reactionsCount: 46,
    rewardsAmount: 1100,
    canonicalUrl: "https://taggr.link/#/post/post-002",
  },
  {
    id: "post-003",
    authorId: "user-needle",
    authorHandle: "needle.market",
    realm: "trading-floor",
    text: "Thin order books, thick folklore. The desk says wait; the chart says whisper.",
    imageUrl:
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=900&q=78",
    createdAt: daysAgo(1, 1),
    commentsCount: 32,
    reactionsCount: 118,
    rewardsAmount: 8800,
    canonicalUrl: "https://taggr.link/#/post/post-003",
  },
  {
    id: "post-004",
    authorId: "user-ana",
    authorHandle: "ana.log",
    realm: "archive-room",
    text: "No image today. Just a note: index your fragments before the context disappears.",
    createdAt: daysAgo(1, 5),
    commentsCount: 5,
    reactionsCount: 22,
    rewardsAmount: 200,
    canonicalUrl: "https://taggr.link/#/post/post-004",
  },
  {
    id: "post-005",
    authorId: "user-circuit",
    authorHandle: "circuit.garden",
    realm: "icp-builders",
    text: "Canister dashboards should feel less like airplane cockpits and more like archival instruments.",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=78",
    createdAt: daysAgo(2, 2),
    commentsCount: 12,
    reactionsCount: 64,
    rewardsAmount: 2700,
    canonicalUrl: "https://taggr.link/#/post/post-005",
  },
  {
    id: "post-006",
    authorId: "user-vanta",
    authorHandle: "vanta.page",
    realm: "cyber-zine",
    text: "Issue 12 cover test. Washed magenta, old glass, no hero copy.",
    imageUrl:
      "https://images.unsplash.com/photo-1544894079-e81a9eb1da8b?auto=format&fit=crop&w=900&q=78",
    createdAt: daysAgo(3, 4),
    commentsCount: 24,
    reactionsCount: 104,
    rewardsAmount: 6500,
    canonicalUrl: "https://taggr.link/#/post/post-006",
  },
  {
    id: "post-007",
    authorId: "user-choir",
    authorHandle: "choir.vault",
    realm: "collectors",
    text: "The object is not rare because it is scarce. It is rare because everyone forgot how to look at it.",
    imageUrl:
      "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=900&q=78",
    createdAt: daysAgo(4, 6),
    commentsCount: 9,
    reactionsCount: 39,
    rewardsAmount: 3400,
    canonicalUrl: "https://taggr.link/#/post/post-007",
  },
  {
    id: "post-008",
    authorId: "user-faye",
    authorHandle: "faye.signal",
    realm: "meme-machines",
    text: "Reaction image taxonomy: expressive, cursed, financially unsound.",
    imageUrl:
      "https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=900&q=78",
    createdAt: daysAgo(5, 2),
    commentsCount: 41,
    reactionsCount: 202,
    rewardsAmount: 11800,
    canonicalUrl: "https://taggr.link/#/post/post-008",
  },
  {
    id: "post-009",
    authorId: "user-sable",
    authorHandle: "sable.terminal",
    realm: "archive-room",
    text: "Recovered palette from an abandoned forum skin. Someone cared about the hover state.",
    imageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=78",
    createdAt: daysAgo(6, 9),
    commentsCount: 13,
    reactionsCount: 80,
    rewardsAmount: 5900,
    canonicalUrl: "https://taggr.link/#/post/post-009",
  },
  {
    id: "post-010",
    authorId: "user-plot",
    authorHandle: "plot.device",
    realm: "generative-art",
    text: "Plotter output made from stale notifications and one very patient noise function.",
    imageUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=78",
    createdAt: daysAgo(7, 3),
    commentsCount: 16,
    reactionsCount: 72,
    rewardsAmount: 4700,
    canonicalUrl: "https://taggr.link/#/post/post-010",
  },
  {
    id: "post-011",
    authorId: "user-ada",
    authorHandle: "ada.protocol",
    realm: "icp-builders",
    text: "Adapter boundary draft: keep the UI honest, keep the canister swappable.",
    createdAt: daysAgo(8, 1),
    commentsCount: 11,
    reactionsCount: 57,
    rewardsAmount: 1800,
    canonicalUrl: "https://taggr.link/#/post/post-011",
  },
  {
    id: "post-012",
    authorId: "user-mara",
    authorHandle: "mara.frame",
    realm: "collectors",
    text: "Physical cataloging notes for digital things. Labels are tiny rituals.",
    imageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=78",
    createdAt: daysAgo(9, 10),
    commentsCount: 6,
    reactionsCount: 34,
    rewardsAmount: 2200,
    canonicalUrl: "https://taggr.link/#/post/post-012",
  },
];

const realms: TaggrRealm[] = [
  {
    id: "meme-machines",
    name: "meme-machines",
    description: "Compressed folklore, reaction artifacts, markets as performance.",
    imagePreviewUrls: posts
      .filter((post) => post.realm === "meme-machines")
      .map((post) => post.imageUrl)
      .filter(Boolean) as string[],
    postsCount: 338,
    membersCount: 1204,
  },
  {
    id: "generative-art",
    name: "generative-art",
    description: "Procedural images, plotter studies, code-native editions.",
    imagePreviewUrls: posts
      .filter((post) => post.realm === "generative-art")
      .map((post) => post.imageUrl)
      .filter(Boolean) as string[],
    postsCount: 192,
    membersCount: 840,
  },
  {
    id: "trading-floor",
    name: "trading-floor",
    description: "Charts, rumors, collector liquidity, and market field notes.",
    imagePreviewUrls: posts
      .filter((post) => post.realm === "trading-floor")
      .map((post) => post.imageUrl)
      .filter(Boolean) as string[],
    postsCount: 414,
    membersCount: 1798,
  },
  {
    id: "archive-room",
    name: "archive-room",
    description: "Fragments, bookmarks, forum ghosts, and careful indexing.",
    imagePreviewUrls: posts
      .filter((post) => post.realm === "archive-room")
      .map((post) => post.imageUrl)
      .filter(Boolean) as string[],
    postsCount: 89,
    membersCount: 326,
  },
  {
    id: "icp-builders",
    name: "icp-builders",
    description: "Canister UX, protocol notes, product patterns, shipping logs.",
    imagePreviewUrls: posts
      .filter((post) => post.realm === "icp-builders")
      .map((post) => post.imageUrl)
      .filter(Boolean) as string[],
    postsCount: 247,
    membersCount: 954,
  },
  {
    id: "cyber-zine",
    name: "cyber-zine",
    description: "Editorial experiments, net culture, and handmade digital publishing.",
    imagePreviewUrls: posts
      .filter((post) => post.realm === "cyber-zine")
      .map((post) => post.imageUrl)
      .filter(Boolean) as string[],
    postsCount: 128,
    membersCount: 612,
  },
];

let comments: TaggrComment[] = [
  {
    id: "comment-001",
    postId: "post-001",
    authorHandle: "sable.terminal",
    text: "The artifact label is doing real work here.",
    createdAt: daysAgo(0, 1),
  },
  {
    id: "comment-002",
    postId: "post-001",
    authorHandle: "faye.signal",
    text: "Saving this to the cursed liquidity folder.",
    createdAt: daysAgo(0, 1),
  },
  {
    id: "comment-003",
    postId: "post-006",
    authorHandle: "vanta.page",
    text: "Cover crop is final unless someone finds a better ruined monitor.",
    createdAt: daysAgo(2, 7),
  },
];

function sortPosts(input: TaggrPost[], sort: FeedParams["sort"] = "latest") {
  return [...input].sort((a, b) => {
    if (sort === "comments") return b.commentsCount - a.commentsCount;
    if (sort === "rewards")
      return (b.rewardsAmount ?? 0) - (a.rewardsAmount ?? 0);
    if (sort === "trending")
      return (
        b.reactionsCount +
        b.commentsCount * 2 +
        (b.rewardsAmount ?? 0) * 8 -
        (a.reactionsCount + a.commentsCount * 2 + (a.rewardsAmount ?? 0) * 8)
      );

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function matchesQuery(post: TaggrPost, query?: string) {
  if (!query) return true;
  const needle = query.toLowerCase();
  return [post.text, post.authorHandle, post.realm, post.id]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(needle));
}

export const mockTaggrClient: TaggrClient = {
  async getFeed(params) {
    const filtered = posts.filter((post) => {
      const realmMatch = params.realm ? post.realm === params.realm : true;
      const imageMatch = params.imagesOnly ? Boolean(post.imageUrl) : true;
      return realmMatch && imageMatch && matchesQuery(post, params.query);
    });

    const page = params.page ?? 0;
    return sortPosts(filtered, params.sort).slice(
      page * mockFeedPageSize,
      (page + 1) * mockFeedPageSize,
    );
  },

  async getPost(id) {
    return posts.find((post) => post.id === id) ?? null;
  },

  async getComments(postId) {
    return comments.filter((comment) => comment.postId === postId);
  },

  async getRealms() {
    return realms;
  },

  async getProfile(userId) {
    const profilePosts = profilePostsFor(userId);
    const firstPost = profilePosts[0] ?? posts[0];

    return {
      userId,
      handle: firstPost.authorHandle,
      bio: "Visual archivist, occasional canister note-taker, collector of abandoned interface moods.",
      avatarUrl: firstPost.imageUrl,
      posts: profilePosts.length ? profilePosts : posts.slice(0, 6),
      stats: {
        posts: profilePosts.length || 6,
        comments: 128,
        rewards: 42,
        reputation: 804,
      },
    } satisfies TaggrProfile;
  },

  async getProfilePosts(handle, page) {
    const profilePosts = profilePostsFor(handle);
    return profilePosts.slice(
      page * mockFeedPageSize,
      (page + 1) * mockFeedPageSize,
    );
  },

  async createPost(input: CreatePostInput) {
    const post: TaggrPost = {
      id: `post-${crypto.randomUUID()}`,
      authorId: "mock-principal",
      authorHandle: "you.archive",
      realm: input.realm,
      text: input.text,
      bodyMarkdown: input.text,
      imageUrl: input.attachment?.previewUrl ?? input.imageUrl,
      mediaUrls:
        input.attachment?.previewUrl || input.imageUrl
          ? [input.attachment?.previewUrl ?? input.imageUrl ?? ""]
          : [],
      poll: createPoll(input.poll),
      repostId: input.repostId,
      createdAt: new Date().toISOString(),
      commentsCount: 0,
      reactionsCount: 0,
      rewardsAmount: 0,
      canonicalUrl: undefined,
    };

    posts.unshift(post);
    return post;
  },

  async editPost(input: EditPostInput) {
    const post = posts.find((item) => item.id === input.postId);
    if (!post) throw new Error("Post not found");

    post.realm = input.realm;
    post.text = input.text;
    post.bodyMarkdown = input.text;
    post.imageUrl = input.attachment?.previewUrl ?? input.imageUrl ?? post.imageUrl;
    post.mediaUrls = post.imageUrl ? [post.imageUrl] : [];
    post.repostId = input.repostId ?? post.repostId;
    return post;
  },

  async createComment(input: CreateCommentInput) {
    const comment: TaggrComment = {
      id: `comment-${crypto.randomUUID()}`,
      postId: input.postId,
      authorHandle: "you.archive",
      text: input.text,
      bodyMarkdown: input.text,
      createdAt: new Date().toISOString(),
    };

    comments = [comment, ...comments];
    return comment;
  },

  async reactToPost(postId) {
    const post = posts.find((item) => item.id === postId);
    if (post) post.reactionsCount += 1;
  },

  async voteOnPoll(postId, option, anonymously = false) {
    const post = posts.find((item) => item.id === postId);
    if (!post?.poll) throw new Error("Poll not found");
    if (option < 0 || option >= post.poll.options.length) {
      throw new Error("Invalid poll option");
    }

    const voterId = 9999;
    if (!post.poll.voters.includes(voterId)) {
      post.poll.voters.push(voterId);
    }
    if (!anonymously) {
      const key = String(option);
      const list = post.poll.votes[key] ?? [];
      if (!list.includes(voterId)) {
        post.poll.votes[key] = [...list, voterId];
      }
    }
  },
};
