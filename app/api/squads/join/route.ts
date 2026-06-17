import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, saveUserProfile, getSquad, saveSquad, getSquadIdByCode } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profile = await getUserProfile(session.user.id);
    if (!profile) return NextResponse.json({ error: "Set up your profile first" }, { status: 400 });
    const { code, pledged } = (await req.json()) as { code: string; pledged: boolean };
    if (!pledged) return NextResponse.json({ error: "You must pledge to the stakes." }, { status: 400 });
    const id = await getSquadIdByCode((code ?? "").trim().toUpperCase());
    if (!id) return NextResponse.json({ error: "No squad with that code." }, { status: 404 });
    const squad = await getSquad(id);
    if (!squad) return NextResponse.json({ error: "Squad not found." }, { status: 404 });

    // Leave any previous squad first.
    if (profile.squadId && profile.squadId !== id) {
      const old = await getSquad(profile.squadId);
      if (old) { old.memberIds = old.memberIds.filter((m) => m !== profile.id); await saveSquad(old); }
    }
    if (!squad.memberIds.includes(profile.id)) squad.memberIds.push(profile.id);
    await saveSquad(squad);
    profile.squadId = id;
    await saveUserProfile(profile);
    return NextResponse.json({ squad });
  } catch (err) {
    console.error("POST /api/squads/join", err);
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }
}
