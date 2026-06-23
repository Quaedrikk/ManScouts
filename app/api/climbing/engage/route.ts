import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getClimbPost, updateClimbPost, getClimbProfile } from "@/lib/climbKv";

function toggle(arr: string[] | undefined, id: string): string[] {
  const a = arr ?? [];
  return a.includes(id) ? a.filter((x) => x !== id) : [...a, id];
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = session.user.id;
  try {
    const b = (await req.json()) as { postId: string; action: "like" | "super" | "react" | "comment"; emoji?: string; text?: string };
    const post = await getClimbPost(b.postId);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (b.action === "like") post.likes = toggle(post.likes, uid);
    else if (b.action === "super") post.superLikes = toggle(post.superLikes, uid);
    else if (b.action === "react" && b.emoji) {
      const r = post.reactions ?? {};
      r[b.emoji] = toggle(r[b.emoji], uid);
      if (r[b.emoji].length === 0) delete r[b.emoji];
      post.reactions = r;
    } else if (b.action === "comment" && b.text?.trim()) {
      const profile = await getClimbProfile(uid);
      post.comments = [...(post.comments ?? []), {
        id: `cm${Date.now()}`, userId: uid,
        name: profile?.name ?? session.user.name ?? "Climber",
        avatarUrl: profile?.avatarUrl ?? "",
        text: b.text.trim().slice(0, 500), createdAt: new Date().toISOString(),
      }];
    }
    await updateClimbPost(post);
    return NextResponse.json({ post });
  } catch (err) {
    console.error("POST /api/climbing/engage", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
