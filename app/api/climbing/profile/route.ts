import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getClimbProfile, saveClimbProfile } from "@/lib/climbKv";
import type { ClimbProfile } from "@/lib/climb";

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    return NextResponse.json({ profile: await getClimbProfile(id) });
  }
  const session = await auth();
  if (!session?.user) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile: await getClimbProfile(session.user.id) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = (await req.json()) as Partial<ClimbProfile>;
    const name = (b.name ?? "").trim();
    let handle = (b.handle ?? "").trim();
    if (!name || !handle) return NextResponse.json({ error: "Name and handle required" }, { status: 400 });
    if (!handle.startsWith("@")) handle = "@" + handle;
    const existing = await getClimbProfile(session.user.id);
    const profile: ClimbProfile = {
      id: session.user.id,
      name,
      handle,
      bio: (b.bio ?? "").trim(),
      avatarUrl: b.avatarUrl ?? "",
      holdColor: b.holdColor ?? existing?.holdColor ?? "#2f6fe0",
      wall: b.wall ?? existing?.wall,
    };
    await saveClimbProfile(profile);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("POST /api/climbing/profile", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
