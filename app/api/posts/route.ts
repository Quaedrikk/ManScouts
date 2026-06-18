import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getFeed, createPost, getCheerCount, getUserProfile, getWitnessSession, getPost, deletePost, getSquad } from "@/lib/kv";
import type { Post, WitnessEntry } from "@/lib/types";

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
      "challengeId" | "proofs" | "place" | "lat" | "lng" | "note"
    > & { witnessToken?: string; adminSkip?: boolean };
    const proofs = Array.isArray(body.proofs) ? body.proofs : [];

    // Admins can bypass witness verification (testing only).
    const adminSkip = body.adminSkip && isAdmin(session);

    let ws: WitnessEntry[];
    if (adminSkip) {
      ws = [{ id: profile.id, name: "Admin skip (test)", handle: "" }];
    } else {
      // A badge can't be self-awarded: require a confirmed witness session that
      // belongs to this earner. Witness identity is taken from the server record.
      if (!body.witnessToken) {
        return NextResponse.json({ error: "A witness is required" }, { status: 400 });
      }
      const witness = await getWitnessSession(body.witnessToken);
      if (!witness || witness.witnesses.length === 0 || witness.earnerId !== profile.id) {
        return NextResponse.json({ error: "Witness not verified" }, { status: 400 });
      }
      ws = witness.witnesses;
    }

    // Snapshot the poster's squad (coat + name) for display on the post.
    const squad = profile.squadId ? await getSquad(profile.squadId) : null;

    const post: Post = {
      id: `p${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: profile.id,
      userName: profile.name,
      userHandle: profile.handle,
      userAvatarUrl: profile.avatarUrl,
      challengeId: body.challengeId,
      proofUrl: proofs[0]?.url ?? "",
      proofType: proofs[0]?.type ?? "photo",
      proofs,
      place: body.place,
      lat: body.lat,
      lng: body.lng,
      note: body.note,
      witnessName: ws.map((w) => w.name).join(", "),
      witnessHandle: ws[0]?.handle ?? "",
      witnessPhotoUrl: ws[0]?.photoUrl,
      witnesses: ws,
      squad: squad ? { id: squad.id, name: squad.name, coat: squad.coat } : undefined,
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

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });
    const post = await getPost(id);
    if (!post) return NextResponse.json({ ok: true }); // already gone
    // Owner can delete their own; admins can delete anyone's.
    if (post.userId !== session.user.id && !isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await deletePost(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/posts", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
