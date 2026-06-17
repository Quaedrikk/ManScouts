import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, saveUserProfile, getSquad, saveSquad } from "@/lib/kv";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profile = await getUserProfile(session.user.id);
    if (!profile?.squadId) return NextResponse.json({ ok: true });
    const squad = await getSquad(profile.squadId);
    if (squad) {
      squad.memberIds = squad.memberIds.filter((m) => m !== profile.id);
      await saveSquad(squad);
    }
    profile.squadId = undefined;
    await saveUserProfile(profile);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/squads/leave", err);
    return NextResponse.json({ error: "Failed to leave" }, { status: 500 });
  }
}
