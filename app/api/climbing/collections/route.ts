import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getClimbProfile, saveClimbProfile } from "@/lib/climbKv";
import type { ClimbCollection } from "@/lib/climb";

// Save the current user's full collections array.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { collections } = (await req.json()) as { collections: ClimbCollection[] };
    const profile = await getClimbProfile(session.user.id);
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 400 });
    const clean: ClimbCollection[] = (Array.isArray(collections) ? collections : []).map((c) => ({
      id: String(c.id), name: String(c.name ?? "").slice(0, 60),
      coverUrl: c.coverUrl ? String(c.coverUrl) : undefined,
      postIds: Array.isArray(c.postIds) ? c.postIds.map(String) : [],
    }));
    const next = { ...profile, collections: clean };
    await saveClimbProfile(next);
    return NextResponse.json({ profile: next });
  } catch (err) {
    console.error("POST /api/climbing/collections", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
