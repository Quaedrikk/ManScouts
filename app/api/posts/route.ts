import { NextRequest, NextResponse } from "next/server";
import { getFeed, createPost, getCheerCount } from "@/lib/kv";
import type { Post } from "@/lib/types";

export async function GET() {
  try {
    const posts = await getFeed(60);
    const cheerCounts: Record<string, number> = {};
    await Promise.all(
      posts.map(async (p) => {
        cheerCounts[p.id] = await getCheerCount(p.id);
      })
    );
    return NextResponse.json({ posts, cheerCounts });
  } catch (err) {
    console.error("GET /api/posts", err);
    return NextResponse.json({ posts: [], cheerCounts: {} });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<Post, "cheerCount">;
    const post: Post = { ...body, cheerCount: 0 };
    await createPost(post);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/posts", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}
