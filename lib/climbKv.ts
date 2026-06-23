import { kv } from "@vercel/kv";
import type { ClimbPost, ClimbProfile } from "./climb";

const FEED = "cl:feed";
const POST = (id: string) => `cl:post:${id}`;
const PROFILE = (id: string) => `cl:user:${id}`;

export async function getClimbFeed(limit = 80): Promise<ClimbPost[]> {
  const ids = await kv.lrange<string>(FEED, 0, limit - 1);
  if (!ids || ids.length === 0) return [];
  const posts = await Promise.all(ids.map((id) => kv.get<ClimbPost>(POST(id))));
  return posts.filter(Boolean) as ClimbPost[];
}

export async function createClimbPost(p: ClimbPost): Promise<void> {
  await kv.set(POST(p.id), p);
  await kv.lpush(FEED, p.id);
}

export async function getClimbPost(id: string): Promise<ClimbPost | null> {
  return kv.get<ClimbPost>(POST(id));
}

export async function deleteClimbPost(id: string): Promise<void> {
  await kv.lrem(FEED, 0, id);
  await kv.del(POST(id));
}

export async function getClimbProfile(id: string): Promise<ClimbProfile | null> {
  return kv.get<ClimbProfile>(PROFILE(id));
}

export async function saveClimbProfile(p: ClimbProfile): Promise<void> {
  await kv.set(PROFILE(p.id), p);
}
