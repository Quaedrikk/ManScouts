import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, saveUserProfile } from "@/lib/kv";
import type { UserProfile } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const profile = await getUserProfile(session.user.id);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("GET /api/profile", err);
    return NextResponse.json({ profile: null });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Partial<UserProfile>;
    const name = (body.name ?? "").trim();
    let handle = (body.handle ?? "").trim();
    if (!name || !handle) {
      return NextResponse.json({ error: "Name and handle required" }, { status: 400 });
    }
    if (!handle.startsWith("@")) handle = "@" + handle;
    // Merge with the existing record so saving the profile never clobbers
    // server-managed fields like squad membership.
    const existing = await getUserProfile(session.user.id);
    const profile: UserProfile = {
      id: session.user.id,
      name,
      handle,
      bio: (body.bio ?? "").trim(),
      avatarUrl: body.avatarUrl ?? "",
      featured: Array.isArray(body.featured) ? body.featured.slice(0, 3) : existing?.featured,
      pinnedPostId: body.pinnedPostId !== undefined ? (body.pinnedPostId || undefined) : existing?.pinnedPostId,
      squadId: existing?.squadId, // never trust the client for squad membership
    };
    await saveUserProfile(profile);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("POST /api/profile", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
