import { kv } from "@vercel/kv";
import type { Post } from "./types";

const FEED_KEY = "ms:feed";
const POST_KEY = (id: string) => `ms:post:${id}`;
const CHEERS_KEY = (id: string) => `ms:cheers:${id}`;

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
