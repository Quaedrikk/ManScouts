import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getClimbFeed, createClimbPost, getClimbProfile, getClimbPost, deleteClimbPost } from "@/lib/climbKv";
import type { ClimbPost } from "@/lib/climb";

export async function GET() {
  try {
    return NextResponse.json({ posts: await getClimbFeed(80) });
  } catch (err) {
    console.error("GET /api/climbing/posts", err);
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profile = await getClimbProfile(session.user.id);
    if (!profile) return NextResponse.json({ error: "Set up your climber profile first" }, { status: 400 });
    const b = (await req.json()) as Pick<ClimbPost, "gym" | "wall" | "routeId" | "color" | "grade" | "videoUrl" | "startSec" | "note" | "visibility">;
    if (!b.videoUrl) return NextResponse.json({ error: "A video is required" }, { status: 400 });
    const visibility = b.visibility === "followers" || b.visibility === "me" ? b.visibility : "everyone";
    const post: ClimbPost = {
      id: `c${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: profile.id,
      userName: profile.name,
      userHandle: profile.handle,
      userAvatarUrl: profile.avatarUrl,
      gym: b.gym,
      wall: b.wall,
      routeId: b.routeId,
      color: b.color,
      grade: b.grade,
      visibility,
      videoUrl: b.videoUrl,
      startSec: b.startSec,
      note: b.note,
      createdAt: new Date().toISOString(),
    };
    await createClimbPost(post);
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    console.error("POST /api/climbing/posts", err);
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });
    const post = await getClimbPost(id);
    if (!post) return NextResponse.json({ ok: true });
    if (post.userId !== session.user.id && !isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await deleteClimbPost(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/climbing/posts", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
