import type { TaggrPost } from "../taggr/taggrTypes";

export const CREDITS_PER_XDR = 1000;
export const USD_PER_XDR = Number(import.meta.env.VITE_USD_PER_XDR ?? "1.37");

export function creditsToUsd(credits = 0) {
  return (credits / CREDITS_PER_XDR) * USD_PER_XDR;
}

export function postRewardUsd(post: Pick<TaggrPost, "rewardsAmount" | "rewardsUsd">) {
  return post.rewardsUsd ?? creditsToUsd(post.rewardsAmount ?? 0);
}

export function formatUsd(value = 0) {
  if (value > 0 && value < 0.01) return "<$0.01";

  return new Intl.NumberFormat(undefined, {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

export function rewardCreditsLabel(credits = 0) {
  return `${credits.toLocaleString()} credits`;
}
