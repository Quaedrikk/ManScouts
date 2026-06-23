import { kv } from "@vercel/kv";
import type { ClimbPost, ClimbProfile, FacilityBox, Route } from "./climb";

const FEED = "cl:feed";
const POST = (id: string) => `cl:post:${id}`;
const PROFILE = (id: string) => `cl:user:${id}`;
const FACILITY = (gym: string) => `cl:facility:${gym}`;
const ROUTES = (gym: string) => `cl:routes:${gym}`;

export async function getRoutes(gym: string): Promise<Route[]> {
  return (await kv.get<Route[]>(ROUTES(gym))) ?? [];
}
export async function addRoute(r: Route): Promise<void> {
  const list = await getRoutes(r.gym);
  await kv.set(ROUTES(r.gym), [r, ...list]);
}
export async function deleteRoute(gym: string, id: string): Promise<void> {
  const list = await getRoutes(gym);
  await kv.set(ROUTES(gym), list.filter((r) => r.id !== id));
}

export async function getFacility(gym: string): Promise<FacilityBox[]> {
  return (await kv.get<FacilityBox[]>(FACILITY(gym))) ?? [];
}
export async function saveFacility(gym: string, boxes: FacilityBox[]): Promise<void> {
  await kv.set(FACILITY(gym), boxes);
}
export async function updateClimbPost(p: ClimbPost): Promise<void> {
  await kv.set(POST(p.id), p);
}

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
  await kv.sadd("cl:users", p.id);
}

export async function setFollow(uid: string, targetId: string, on: boolean): Promise<ClimbProfile | null> {
  const me = await getClimbProfile(uid);
  if (!me) return null;
  const set = new Set(me.following ?? []);
  if (on) set.add(targetId); else set.delete(targetId);
  set.delete(uid); // never follow yourself
  const next = { ...me, following: [...set] };
  await saveClimbProfile(next);
  return next;
}

export async function getClimbUsers(): Promise<ClimbProfile[]> {
  const ids = (await kv.smembers<string[]>("cl:users")) ?? [];
  if (ids.length === 0) return [];
  const ps = await Promise.all(ids.map((id) => kv.get<ClimbProfile>(PROFILE(id))));
  return ps.filter(Boolean) as ClimbProfile[];
}
