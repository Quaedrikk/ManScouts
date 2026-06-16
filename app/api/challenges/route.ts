import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getCustomChallenges, addCustomChallenge, deleteCustomChallenge } from "@/lib/kv";
import type { Challenge } from "@/lib/types";

export async function GET() {
  try {
    const challenges = await getCustomChallenges();
    return NextResponse.json({ challenges });
  } catch (err) {
    console.error("GET /api/challenges", err);
    return NextResponse.json({ challenges: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const b = (await req.json()) as Partial<Challenge>;
    if (!b.nm?.trim() || !b.cat?.trim()) {
      return NextResponse.json({ error: "Name and category required" }, { status: 400 });
    }
    const challenge: Challenge = {
      id: b.id?.trim() || `c${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nm: b.nm.trim(),
      cat: b.cat.trim(),
      df: b.df ?? "Frontiersman",
      ico: b.ico || "stars",
      an: b.an || "rays",
      pts: typeof b.pts === "number" ? b.pts : 50,
      blurb: b.blurb?.trim() || "",
      how: Array.isArray(b.how) ? b.how.filter(Boolean) : [],
      care: b.care?.trim() || undefined,
      imageUrl: b.imageUrl || undefined,
      color: b.color || undefined,
      shape: b.shape || "circle",
      effects: Array.isArray(b.effects) ? b.effects : (b.effect && b.effect !== "none" ? [b.effect] : []),
      effectColors: b.effectColors || undefined,
      proofMedia: b.proofMedia || "either",
      custom: true,
    };
    await addCustomChallenge(challenge);
    return NextResponse.json({ challenge });
  } catch (err) {
    console.error("POST /api/challenges", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });
    await deleteCustomChallenge(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/challenges", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
