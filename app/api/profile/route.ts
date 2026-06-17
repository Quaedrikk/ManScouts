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
    // id is always taken from the session — never trusted from the client.
    const profile: UserProfile = {
      id: session.user.id,
      name,
      handle,
      bio: (body.bio ?? "").trim(),
      avatarUrl: body.avatarUrl ?? "",
      featured: Array.isArray(body.featured) ? body.featured.slice(0, 3) : undefined,
    };
    await saveUserProfile(profile);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("POST /api/profile", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
