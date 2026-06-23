import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { setFollow, getClimbProfile } from "@/lib/climbKv";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { targetId } = (await req.json()) as { targetId?: string };
    if (!targetId || targetId === session.user.id) {
      return NextResponse.json({ error: "Bad target" }, { status: 400 });
    }
    const me = await getClimbProfile(session.user.id);
    const on = !(me?.following ?? []).includes(targetId);
    const profile = await setFollow(session.user.id, targetId, on);
    return NextResponse.json({ profile, following: on });
  } catch (err) {
    console.error("POST /api/climbing/follow", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
