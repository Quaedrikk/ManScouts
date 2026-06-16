import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFeed, createPost, getCheerCount, getUserProfile } from "@/lib/kv";
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
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const profile = await getUserProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: "Set up your profile first" }, { status: 400 });
    }
    // Identity fields come from the session/profile, not the request body, so a
    // user can't post as someone else.
    const body = (await req.json()) as Pick<
      Post,
      "challengeId" | "proofUrl" | "proofType" | "place" | "note" | "witnessName" | "witnessHandle"
    >;
    const post: Post = {
      id: `p${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: profile.id,
      userName: profile.name,
      userHandle: profile.handle,
      userAvatarUrl: profile.avatarUrl,
      challengeId: body.challengeId,
      proofUrl: body.proofUrl,
      proofType: body.proofType,
      place: body.place,
      note: body.note,
      witnessName: body.witnessName,
      witnessHandle: body.witnessHandle,
      cheerCount: 0,
      createdAt: new Date().toISOString(),
    };
    await createPost(post);
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    console.error("POST /api/posts", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}
