import {
  Certificate,
  HttpAgent,
  lookupResultToBuffer,
  polling,
} from "@dfinity/agent";
import type { Identity } from "@dfinity/agent";
import { bufFromBufLike, IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { identityAdapter } from "../icp/identity";
import { creditsToUsd } from "../utils/rewards";
import type {
  CreateCommentInput,
  CreatePostInput,
  FeedParams,
  TaggrClient,
  TaggrComment,
  TaggrPost,
  TaggrProfile,
  TaggrRealm,
} from "./taggrTypes";

const TAGGR_CANISTER_ID =
  import.meta.env.VITE_TAGGR_CANISTER_ID || "6qfxa-ryaaa-aaaai-qbhsq-cai";
const TAGGR_DOMAIN = import.meta.env.VITE_TAGGR_DOMAIN || "taggr.link";
const AGENT_HOST = import.meta.env.VITE_ICP_HOST || "https://icp-api.io";
const CANONICAL_BASE =
  import.meta.env.VITE_TAGGR_CANONICAL_URL || "https://taggr.link";

type TaggrMeta = {
  author_name?: string;
  realm_color?: string;
  nsfw?: boolean;
};

type TaggrNativePost = {
  id: number;
  parent?: number;
  children?: number[];
  user: number;
  body: string;
  effBody?: string;
  reactions?: Record<string, number[]>;
  files?: Record<string, [number, number]>;
  tips?: Array<[number, number | string]>;
  realm?: string;
  timestamp: number | string;
  patches?: Array<[number | string, string]>;
  tree_size?: number;
  meta?: TaggrMeta;
  encrypted?: boolean;
  hidden_for?: number[];
};

type TaggrNativeRealm = {
  description?: string;
  logo?: string;
  num_posts?: number;
  num_members?: number;
  posts?: number[];
  last_update?: number;
};

type TaggrNativeUser = {
  id: number;
  name: string;
  about?: string;
  num_posts?: number;
  rewards?: number;
  followers?: number[];
  balance?: number;
  pfp?: unknown;
};

type TaggrStats = {
  buckets?: Array<[string, number]>;
  canister_id?: string;
};

type TaggrConfig = {
  reactions?: Array<[number, number]>;
  token_decimals?: number;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

let statsCache: Promise<TaggrStats> | null = null;
let configCache: Promise<TaggrConfig> | null = null;

function getEffParams(args: unknown[]) {
  const values = args.filter((value) => typeof value !== "undefined");
  if (values.length === 0) return null;
  return values.length === 1 ? values[0] : values;
}

function normalizeJsonValue(value: unknown): unknown {
  if (typeof value === "bigint") return Number(value);
  if (Array.isArray(value)) return value.map(normalizeJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        normalizeJsonValue(entry),
      ]),
    );
  }

  return value;
}

function toArrayBuffer(value: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (value instanceof ArrayBuffer) return value;
  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset + value.byteLength,
  ) as ArrayBuffer;
}

async function createAgent(identity?: Identity) {
  const agent = new HttpAgent({ host: AGENT_HOST, identity });

  if (AGENT_HOST.includes("localhost")) {
    await agent.fetchRootKey();
  }

  return agent;
}

async function queryRaw(
  methodName: string,
  params?: unknown[],
  identity?: Identity,
) {
  const agent = await createAgent(identity);
  const arg = textEncoder.encode(
    JSON.stringify(getEffParams(params ?? [])),
  ).buffer as ArrayBuffer;
  const response = await agent.query(
    TAGGR_CANISTER_ID,
    { methodName, arg },
    identity,
  );

  if (response.status !== "replied") {
    throw new Error(`Taggr query ${methodName} did not reply.`);
  }

  return response.reply.arg;
}

async function queryJson<T>(
  methodName: string,
  params: unknown[] = [],
  identity?: Identity,
): Promise<T> {
  const bytes = await queryRaw(methodName, params, identity);
  return JSON.parse(textDecoder.decode(bytes)) as T;
}

async function callRawCandid(
  methodName: string,
  arg: ArrayBuffer,
  identity: Identity,
) {
  const agent = await createAgent(identity);
  const canister = Principal.fromText(TAGGR_CANISTER_ID);
  const { response, requestId } = await agent.call(canister, {
    methodName,
    arg,
    callSync: true,
  });

  if (!response.ok) {
    throw new Error(`Taggr call ${methodName} failed: ${response.statusText}`);
  }

  if (response.body && "certificate" in response.body) {
    const certificate = await Certificate.create({
      certificate: bufFromBufLike(response.body.certificate),
      rootKey: agent.rootKey || new ArrayBuffer(0),
      canisterId: canister,
    });
    const path: Array<string | ArrayBuffer> = [
      toArrayBuffer(textEncoder.encode("request_status")),
      toArrayBuffer(requestId as unknown as Uint8Array),
    ];
    const status = textDecoder.decode(
      lookupResultToBuffer(certificate.lookup([...path, "status"])),
    );

    if (status === "replied") {
      const reply = lookupResultToBuffer(certificate.lookup([...path, "reply"]));
      if (!reply) throw new Error(`Taggr call ${methodName} had no reply.`);
      return reply;
    }
  }

  const polled = (
    await polling.pollForResponse(
      agent,
      canister,
      requestId,
      polling.defaultStrategy(),
    )
  ).reply;
  if (!polled) throw new Error(`Taggr call ${methodName} had no reply.`);
  return polled;
}

async function callJson<T>(
  methodName: string,
  params: unknown[],
  identity: Identity,
): Promise<T | null> {
  const agent = await createAgent(identity);
  const canister = Principal.fromText(TAGGR_CANISTER_ID);
  const arg = textEncoder.encode(
    JSON.stringify(normalizeJsonValue(getEffParams(params))),
  ).buffer as ArrayBuffer;
  const { response, requestId } = await agent.call(canister, {
    methodName,
    arg,
    callSync: true,
  });

  if (!response.ok) {
    throw new Error(`Taggr call ${methodName} failed: ${response.statusText}`);
  }

  const reply = (
    await polling.pollForResponse(
      agent,
      canister,
      requestId,
      polling.defaultStrategy(),
    )
  ).reply;

  if (!reply || !reply.byteLength) return null;
  return JSON.parse(textDecoder.decode(reply)) as T;
}

async function getIdentityOrThrow() {
  const identity = await identityAdapter.getIdentity();
  if (!identity) {
    throw new Error("Login with Internet Identity before writing to Taggr.");
  }
  return identity;
}

async function getStats() {
  if (!statsCache) statsCache = queryJson<TaggrStats>("stats");
  return statsCache;
}

async function getConfig() {
  if (!configCache) configCache = queryJson<TaggrConfig>("config");
  return configCache;
}

function createdAt(timestamp: number | string) {
  const numeric = Number(timestamp);
  if (!Number.isFinite(numeric)) return new Date().toISOString();
  const millis = numeric > 10_000_000_000_000 ? numeric / 1_000_000 : numeric;
  return new Date(millis).toISOString();
}

function reactionCount(post: TaggrNativePost) {
  return Object.values(post.reactions ?? {}).reduce(
    (total, users) => total + users.length,
    0,
  );
}

function reactionLabel(id: number) {
  const labels: Record<number, string> = {
    1: "x",
    10: "heart",
    11: "up",
    12: "sad",
    50: "flame",
    51: "joy",
    52: "100",
    53: "rocket",
    100: "star",
    101: "pirate",
  };
  return labels[id] ?? `reaction ${id}`;
}

function reactionGlyph(id: number) {
  const glyphs: Record<number, string> = {
    1: "x",
    10: "heart",
    11: "+1",
    12: "sad",
    50: "fire",
    51: "joy",
    52: "100",
    53: "rocket",
    100: "star",
    101: "flag",
  };
  return glyphs[id] ?? String(id);
}

function reactionOptions(post: TaggrNativePost, config?: TaggrConfig) {
  const reactions = post.reactions ?? {};
  const configured = config?.reactions ?? [
    [11, 1],
    [10, 1],
    [12, 1],
    [53, 5],
    [52, 5],
    [51, 5],
    [50, 5],
    [100, 10],
    [101, 10],
  ];
  const configuredIds = new Set(configured.map(([id]) => String(id)));
  const unknown = Object.keys(reactions)
    .filter((id) => !configuredIds.has(id))
    .map((id) => [Number(id), 0] as [number, number]);

  return [...configured, ...unknown].map(([id, reward]) => ({
    id,
    label: reactionLabel(id),
    reward,
    count: reactions[String(id)]?.length ?? 0,
  }));
}

function reactionRewardTotal(post: TaggrNativePost, config?: TaggrConfig) {
  return reactionOptions(post, config).reduce(
    (total, reaction) => total + reaction.count * reaction.reward,
    0,
  );
}

function rewardsAmount(post: TaggrNativePost, config?: TaggrConfig) {
  const tips = (post.tips ?? []).reduce(
    (total, [, amount]) => total + Number(amount || 0),
    0,
  );
  return tips + reactionRewardTotal(post, config);
}

function textExcerpt(post: TaggrNativePost) {
  return (post.effBody || post.body || "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .trim();
}

function bucketImageUrl(bucketId: string, offset: number, len: number) {
  return `https://${bucketId}.raw.icp0.io/image?offset=${offset}&len=${len}`;
}

function firstFileImage(post: TaggrNativePost) {
  const files = post.files ?? {};
  const first = Object.entries(files)[0];
  if (!first) return undefined;
  const [fileKey, [offset, len]] = first;
  const [, bucketId] = fileKey.split("@");
  return bucketId ? bucketImageUrl(bucketId, offset, len) : undefined;
}

function firstBodyImage(post: TaggrNativePost) {
  const body = post.effBody || post.body || "";
  const markdown = body.match(/!\[[^\]]*]\((https?:\/\/[^)]+)\)/i)?.[1];
  if (markdown) return markdown;
  return body.match(
    /(https?:\/\/[^\s)]+\.(?:png|jpe?g|gif|webp|avif)(?:\?[^\s)]*)?)/i,
  )?.[1];
}

function toPost(post: TaggrNativePost, config?: TaggrConfig): TaggrPost {
  const author = post.meta?.author_name || `user-${post.user}`;
  const imageUrl = firstFileImage(post) || firstBodyImage(post);
  const rewards = rewardsAmount(post, config);
  const bodyMarkdown = post.effBody || post.body || "";

  return {
    id: String(post.id),
    authorId: String(post.user),
    authorHandle: author,
    realm: post.realm,
    text: textExcerpt(post) || post.body || "",
    bodyMarkdown,
    imageUrl,
    mediaUrls: imageUrl ? [imageUrl] : [],
    createdAt: createdAt(post.patches?.[0]?.[0] ?? post.timestamp),
    commentsCount: Math.max((post.tree_size ?? 1) - 1, post.children?.length ?? 0),
    reactionsCount: reactionCount(post),
    rewardsAmount: rewards,
    rewardsUsd: creditsToUsd(rewards),
    reactionOptions: reactionOptions(post, config),
    canonicalUrl: `${CANONICAL_BASE}/#/post/${post.id}`,
  };
}

function expandMeta([post, meta]: [TaggrNativePost, TaggrMeta]) {
  return { ...post, meta };
}

async function loadPosts(ids: number[]) {
  if (!ids.length) return [];
  const response = await queryJson<Array<[TaggrNativePost, TaggrMeta]>>(
    "posts",
    [ids],
  );
  return response.map(expandMeta);
}

async function loadCommentTree(rootId: number) {
  const root = (await loadPosts([rootId]))[0];
  if (!root?.children?.length) return [];

  const comments: TaggrNativePost[] = [];
  let queue = [...root.children];

  while (queue.length) {
    const batch = await loadPosts(queue);
    comments.push(...batch);
    queue = batch.flatMap((post) => post.children ?? []);
  }

  return comments;
}

function sortMappedPosts(posts: TaggrPost[], sort: FeedParams["sort"]) {
  return [...posts].sort((a, b) => {
    if (sort === "comments") return b.commentsCount - a.commentsCount;
    if (sort === "rewards")
      return (b.rewardsAmount ?? 0) - (a.rewardsAmount ?? 0);
    if (sort === "trending")
      return (
        b.reactionsCount +
        b.commentsCount * 2 +
        (b.rewardsAmount ?? 0) -
        (a.reactionsCount + a.commentsCount * 2 + (a.rewardsAmount ?? 0))
      );
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

async function feedQuery(params: FeedParams) {
  const realm = params.realm ?? "";
  const method = params.sort === "trending" ? "hot_posts" : "last_posts";
  const response = await queryJson<Array<[TaggrNativePost, TaggrMeta]>>(method, [
    TAGGR_DOMAIN,
    realm,
    params.page ?? 0,
    0,
    true,
  ]);
  return response.map(expandMeta);
}

async function searchPosts(query: string, paramsPage = 0) {
  type SearchResult = {
    id: number;
    result: string;
  };
  const results = await queryJson<SearchResult[]>("search", [
    TAGGR_DOMAIN,
    query,
  ]);
  const page = Math.max(paramsPage, 0);
  const pageSize = 30;
  const ids = results
    .filter((result) => result.result === "post")
    .map((result) => result.id)
    .slice(page * pageSize, (page + 1) * pageSize);
  return loadPosts(ids);
}

export const realTaggrClient: TaggrClient = {
  async getFeed(params: FeedParams): Promise<TaggrPost[]> {
    await getStats().catch(() => undefined);
    const config = await getConfig().catch(() => undefined);
    const nativePosts =
      params.query && params.query.trim().length >= 2
        ? await searchPosts(params.query.trim(), params.page)
        : await feedQuery(params);
    const mapped = nativePosts.map((post) => toPost(post, config)).filter((post) => {
      if (params.realm && post.realm !== params.realm) return false;
      if (params.imagesOnly && !post.imageUrl) return false;
      return true;
    });
    return sortMappedPosts(mapped, params.sort);
  },

  async getPost(id: string): Promise<TaggrPost | null> {
    const config = await getConfig().catch(() => undefined);
    const posts = await loadPosts([Number(id)]);
    return posts[0] ? toPost(posts[0], config) : null;
  },

  async getComments(postId: string): Promise<TaggrComment[]> {
    const comments = await loadCommentTree(Number(postId));

    return comments
      .map((post) => ({
        id: String(post.id),
        postId,
        parentId: post.parent ? String(post.parent) : undefined,
        authorHandle: post.meta?.author_name || `user-${post.user}`,
        text: textExcerpt(post) || post.body,
        bodyMarkdown: post.effBody || post.body || "",
        createdAt: createdAt(post.patches?.[0]?.[0] ?? post.timestamp),
      }));
  },

  async getRealms(): Promise<TaggrRealm[]> {
    const realms = await queryJson<Array<[string, TaggrNativeRealm]>>(
      "all_realms",
      [TAGGR_DOMAIN, "popularity", 0],
    );

    return Promise.all(
      realms.map(async ([id, realm]) => {
        let imagePreviewUrls: string[] = [];
        try {
          const realmPosts = await queryJson<Array<[TaggrNativePost, TaggrMeta]>>(
            "last_posts",
            [TAGGR_DOMAIN, id, 0, 0, true],
          );
          imagePreviewUrls = realmPosts
            .map(([post, meta]) => toPost({ ...post, meta }).imageUrl)
            .filter(Boolean)
            .slice(0, 4) as string[];
        } catch {
          imagePreviewUrls = [];
        }

        if (realm.logo) {
          imagePreviewUrls.unshift(`data:image/png;base64,${realm.logo}`);
        }

        return {
          id,
          name: id,
          description: realm.description,
          imagePreviewUrls,
          postsCount: realm.num_posts ?? realm.posts?.length,
          membersCount: realm.num_members,
        };
      }),
    );
  },

  async getProfile(userId: string): Promise<TaggrProfile> {
    const identity = userId ? undefined : await identityAdapter.getIdentity();
    const profile = await queryJson<TaggrNativeUser | null>("user", [
      TAGGR_DOMAIN,
      userId ? [userId] : [],
    ], identity ?? undefined);

    if (!profile) {
      throw new Error("Taggr profile not found.");
    }

    const postsResponse = await queryJson<Array<[TaggrNativePost, TaggrMeta]>>(
      "user_posts",
      [TAGGR_DOMAIN, profile.name, 0, 0],
      identity ?? undefined,
    );
    const config = await getConfig().catch(() => undefined);
    const posts = postsResponse.map(expandMeta).map((post) => toPost(post, config));

    return {
      userId: String(profile.id),
      handle: profile.name,
      bio: profile.about,
      posts,
      stats: {
        posts: profile.num_posts ?? posts.length,
        rewards: profile.rewards,
        reputation: profile.balance,
        comments: profile.followers?.length,
      },
    };
  },

  async createPost(input: CreatePostInput): Promise<TaggrPost> {
    const identity = await getIdentityOrThrow();
    const text = [input.text.trim(), input.imageUrl?.trim()]
      .filter(Boolean)
      .join("\n\n");
    const arg = IDL.encode(
      [
        IDL.Text,
        IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Nat8))),
        IDL.Opt(IDL.Nat64),
        IDL.Opt(IDL.Text),
        IDL.Opt(IDL.Vec(IDL.Nat8)),
      ],
      [text, [], [], input.realm ? [input.realm] : [], []],
    );
    const response = await callRawCandid("add_post", arg, identity);
    const result = IDL.decode(
      [IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })],
      response,
    )[0] as { Ok?: bigint; Err?: string };

    if (result.Err) throw new Error(result.Err);
    const post = await this.getPost(String(result.Ok));
    if (!post) throw new Error("Taggr post was created but could not be loaded.");
    return post;
  },

  async createComment(input: CreateCommentInput): Promise<TaggrComment> {
    const identity = await getIdentityOrThrow();
    const parentId = input.parentId ?? input.postId;
    const arg = IDL.encode(
      [
        IDL.Text,
        IDL.Vec(IDL.Tuple(IDL.Text, IDL.Vec(IDL.Nat8))),
        IDL.Opt(IDL.Nat64),
        IDL.Opt(IDL.Text),
        IDL.Opt(IDL.Vec(IDL.Nat8)),
      ],
      [input.text.trim(), [], [BigInt(parentId)], [], []],
    );
    const response = await callRawCandid("add_post", arg, identity);
    const result = IDL.decode(
      [IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })],
      response,
    )[0] as { Ok?: bigint; Err?: string };

    if (result.Err) throw new Error(result.Err);

    return {
      id: String(result.Ok),
      postId: input.postId,
      parentId,
      authorHandle: "you",
      text: input.text,
      bodyMarkdown: input.text,
      createdAt: new Date().toISOString(),
    };
  },

  async reactToPost(postId: string, reactionId?: number): Promise<void> {
    const identity = await getIdentityOrThrow();
    const config: TaggrConfig = await getConfig().catch(() => ({}));
    const effReactionId =
      reactionId ??
      config.reactions?.find(([, reward]: [number, number]) => reward > 0)?.[0] ??
      10;
    const result = await callJson<{ Ok?: unknown; Err?: string }>(
      "react",
      [Number(postId), effReactionId],
      identity,
    );

    if (result && "Err" in result) throw new Error(result.Err);
  },
};
