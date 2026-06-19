import { kv } from "@vercel/kv";
import type { Post, UserProfile, Challenge, Category, WitnessSession, SashLayout, Squad, SeasonState, Proposal, ChallengeOverride } from "./types";

const FEED_KEY = "ms:feed";
const POST_KEY = (id: string) => `ms:post:${id}`;
const CHEERS_KEY = (id: string) => `ms:cheers:${id}`;
const USER_KEY = (id: string) => `ms:user:${id}`;
const CUSTOM_CHALLENGES_KEY = "ms:custom:challenges";
const CUSTOM_CATS_KEY = "ms:custom:categories";
const HIDDEN_CH_KEY = "ms:hidden:challenges";
const HIDDEN_CAT_KEY = "ms:hidden:categories";

// ---- Hidden built-in challenges / categories (soft-delete of code-defined ones) ----
export async function getHiddenChallenges(): Promise<string[]> {
  return (await kv.get<string[]>(HIDDEN_CH_KEY)) ?? [];
}
export async function hideChallenge(id: string): Promise<void> {
  const list = await getHiddenChallenges();
  if (!list.includes(id)) await kv.set(HIDDEN_CH_KEY, [...list, id]);
}
export async function unhideAllChallenges(): Promise<void> {
  await kv.set(HIDDEN_CH_KEY, []);
}
export async function getHiddenCategories(): Promise<string[]> {
  return (await kv.get<string[]>(HIDDEN_CAT_KEY)) ?? [];
}
export async function hideCategory(name: string): Promise<void> {
  const list = await getHiddenCategories();
  if (!list.includes(name)) await kv.set(HIDDEN_CAT_KEY, [...list, name]);
}
export async function unhideAllCategories(): Promise<void> {
  await kv.set(HIDDEN_CAT_KEY, []);
}
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

export async function deleteAllCustomChallenges(): Promise<void> {
  await kv.set(CUSTOM_CHALLENGES_KEY, []);
}

// ---- Custom categories ----
export async function getCustomCategories(): Promise<Category[]> {
  return (await kv.get<Category[]>(CUSTOM_CATS_KEY)) ?? [];
}

export async function saveCustomCategory(cat: Category): Promise<void> {
  const list = await getCustomCategories();
  await kv.set(CUSTOM_CATS_KEY, [...list.filter((c) => c.name !== cat.name), cat]);
}

export async function deleteCustomCategory(name: string): Promise<void> {
  const list = await getCustomCategories();
  await kv.set(CUSTOM_CATS_KEY, list.filter((c) => c.name !== name));
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

// ---- Squads ----
const SQUAD_KEY = (id: string) => `ms:squad:${id}`;
const SQUAD_CODE_KEY = (code: string) => `ms:squadcode:${code}`;

export async function getSquad(id: string): Promise<Squad | null> {
  return kv.get<Squad>(SQUAD_KEY(id));
}
export async function saveSquad(s: Squad): Promise<void> {
  await kv.set(SQUAD_KEY(s.id), s);
  await kv.set(SQUAD_CODE_KEY(s.code), s.id);
}
export async function getSquadIdByCode(code: string): Promise<string | null> {
  return kv.get<string>(SQUAD_CODE_KEY(code.toUpperCase()));
}

// ---- Pre-season voting ----
const SEASON_KEY = "ms:season";
const PROPOSALS_KEY = "ms:proposals";
const PROPVOTES_KEY = "ms:propvotes";
const OVERRIDES_KEY = "ms:overrides";

export async function getSeason(): Promise<SeasonState> {
  return (await kv.get<SeasonState>(SEASON_KEY)) ?? { phase: "off" };
}
export async function setSeason(s: SeasonState): Promise<void> {
  await kv.set(SEASON_KEY, { ...s, updatedAt: new Date().toISOString() });
}

export async function getProposals(): Promise<Proposal[]> {
  return (await kv.get<Proposal[]>(PROPOSALS_KEY)) ?? [];
}
export async function addProposal(p: Proposal): Promise<void> {
  const list = await getProposals();
  await kv.set(PROPOSALS_KEY, [...list, p]);
}
export async function clearProposals(): Promise<void> {
  await kv.set(PROPOSALS_KEY, []);
  await kv.set(PROPVOTES_KEY, {});
}

export async function getPropVotes(): Promise<Record<string, Record<string, "yes" | "no">>> {
  return (await kv.get<Record<string, Record<string, "yes" | "no">>>(PROPVOTES_KEY)) ?? {};
}
export async function setPropVote(proposalId: string, userId: string, vote: "yes" | "no"): Promise<void> {
  const all = await getPropVotes();
  all[proposalId] = { ...(all[proposalId] ?? {}), [userId]: vote };
  await kv.set(PROPVOTES_KEY, all);
}

export async function getOverrides(): Promise<Record<string, ChallengeOverride>> {
  return (await kv.get<Record<string, ChallengeOverride>>(OVERRIDES_KEY)) ?? {};
}
export async function setOverrides(o: Record<string, ChallengeOverride>): Promise<void> {
  await kv.set(OVERRIDES_KEY, o);
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
