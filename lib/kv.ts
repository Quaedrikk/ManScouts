import { kv } from "@vercel/kv";
import type { Post, UserProfile, Challenge, Category, WitnessSession, SashLayout } from "./types";

const FEED_KEY = "ms:feed";
const POST_KEY = (id: string) => `ms:post:${id}`;
const CHEERS_KEY = (id: string) => `ms:cheers:${id}`;
const USER_KEY = (id: string) => `ms:user:${id}`;
const CUSTOM_CHALLENGES_KEY = "ms:custom:challenges";
const CUSTOM_CATS_KEY = "ms:custom:categories";
const SASH_KEY = (id: string) => `ms:sash:${id}`;
const WITNESS_KEY = (token: string) => `ms:witness:${token}`;
const FAVS_KEY = (id: string) => `ms:favs:${id}`;

// ---- Favourite (starred) passages, per user ----
export async function getFavourites(userId: string): Promise<string[]> {
  return (await kv.get<string[]>(FAVS_KEY(userId))) ?? [];
}

export async function toggleFavourite(userId: string, challengeId: string): Promise<string[]> {
  const list = await getFavourites(userId);
  const next = list.includes(challengeId) ? list.filter((x) => x !== challengeId) : [...list, challengeId];
  await kv.set(FAVS_KEY(userId), next);
  return next;
}

// ---- Admin-created badges / Rights of Passage ----
export async function getCustomChallenges(): Promise<Challenge[]> {
  return (await kv.get<Challenge[]>(CUSTOM_CHALLENGES_KEY)) ?? [];
}

export async function addCustomChallenge(ch: Challenge): Promise<void> {
  const list = await getCustomChallenges();
  await kv.set(CUSTOM_CHALLENGES_KEY, [...list.filter((c) => c.id !== ch.id), ch]);
}

export async function deleteCustomChallenge(id: string): Promise<void> {
  const list = await getCustomChallenges();
  await kv.set(CUSTOM_CHALLENGES_KEY, list.filter((c) => c.id !== id));
}

// ---- Custom categories ----
export async function getCustomCategories(): Promise<Category[]> {
  return (await kv.get<Category[]>(CUSTOM_CATS_KEY)) ?? [];
}

export async function saveCustomCategory(cat: Category): Promise<void> {
  const list = await getCustomCategories();
  await kv.set(CUSTOM_CATS_KEY, [...list.filter((c) => c.name !== cat.name), cat]);
}

// ---- Sash (per user): badge positions + chosen theme ----
export interface SashData { layout: SashLayout; style: string; }

export async function getSashData(userId: string): Promise<SashData> {
  return (await kv.get<SashData>(SASH_KEY(userId))) ?? { layout: {}, style: "forest" };
}

export async function saveSashData(userId: string, data: SashData): Promise<void> {
  await kv.set(SASH_KEY(userId), data);
}

// ---- QR witness sessions ----
export async function createWitnessSession(s: WitnessSession): Promise<void> {
  // Expire after 30 minutes so stale QR codes can't be used later.
  await kv.set(WITNESS_KEY(s.token), s, { ex: 1800 });
}

export async function getWitnessSession(token: string): Promise<WitnessSession | null> {
  return kv.get<WitnessSession>(WITNESS_KEY(token));
}

export async function updateWitnessSession(s: WitnessSession): Promise<void> {
  await kv.set(WITNESS_KEY(s.token), s, { ex: 1800 });
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  return kv.get<UserProfile>(USER_KEY(id));
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await kv.set(USER_KEY(profile.id), profile);
}

export async function getFeed(limit = 50): Promise<Post[]> {
  const ids = await kv.lrange<string>(FEED_KEY, 0, limit - 1);
  if (!ids || ids.length === 0) return [];
  const posts = await Promise.all(
    ids.map((id) => kv.get<Post>(POST_KEY(id)))
  );
  return posts.filter(Boolean) as Post[];
}

export async function createPost(post: Post): Promise<void> {
  await kv.set(POST_KEY(post.id), post);
  await kv.lpush(FEED_KEY, post.id);
}

export async function getPost(id: string): Promise<Post | null> {
  return kv.get<Post>(POST_KEY(id));
}

export async function deletePost(id: string): Promise<void> {
  await kv.lrem(FEED_KEY, 0, id);
  await kv.del(POST_KEY(id));
  await kv.del(CHEERS_KEY(id));
}

export async function getCheerCount(postId: string): Promise<number> {
  return (await kv.scard(CHEERS_KEY(postId))) ?? 0;
}

export async function hasUserCheered(postId: string, userId: string): Promise<boolean> {
  return !!(await kv.sismember(CHEERS_KEY(postId), userId));
}

export async function toggleCheer(postId: string, userId: string): Promise<{ count: number; cheered: boolean }> {
  const already = await hasUserCheered(postId, userId);
  if (already) {
    await kv.srem(CHEERS_KEY(postId), userId);
  } else {
    await kv.sadd(CHEERS_KEY(postId), userId);
  }
  const count = await getCheerCount(postId);
  return { count, cheered: !already };
}
