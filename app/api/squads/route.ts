import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, saveUserProfile, getSquad, saveSquad } from "@/lib/kv";
import type { Squad, CoatOfArms } from "@/lib/types";

function code6() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });
  try {
    const squad = await getSquad(id);
    if (!squad) return NextResponse.json({ squad: null, members: [] });
    const members = (await Promise.all(squad.memberIds.map((m) => getUserProfile(m)))).filter(Boolean);
    return NextResponse.json({ squad, members });
  } catch (err) {
    console.error("GET /api/squads", err);
    return NextResponse.json({ squad: null, members: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profile = await getUserProfile(session.user.id);
    if (!profile) return NextResponse.json({ error: "Set up your profile first" }, { status: 400 });
    const { name, stakes, coat } = (await req.json()) as { name: string; stakes: string; coat: CoatOfArms };
    if (!name?.trim() || !stakes?.trim()) {
      return NextResponse.json({ error: "Name and stakes required" }, { status: 400 });
    }
    const id = `s${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const squad: Squad = {
      id, name: name.trim(), stakes: stakes.trim(), coat,
      memberIds: [profile.id], createdBy: profile.id, createdAt: new Date().toISOString(), code: code6(),
    };
    await saveSquad(squad);
    profile.squadId = id;
    await saveUserProfile(profile);
    return NextResponse.json({ squad });
  } catch (err) {
    console.error("POST /api/squads", err);
    return NextResponse.json({ error: "Failed to create squad" }, { status: 500 });
  }
}
