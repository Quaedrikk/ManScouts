import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, createWitnessSession } from "@/lib/kv";
import type { WitnessSession } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { challengeId, challengeName } = (await req.json()) as { challengeId: string; challengeName: string };
    const profile = await getUserProfile(session.user.id);
    const token = `w${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
    const s: WitnessSession = {
      token,
      earnerId: session.user.id,
      earnerName: profile?.name ?? session.user.name ?? "A scout",
      challengeId,
      challengeName,
      witnesses: [],
      createdAt: new Date().toISOString(),
    };
    await createWitnessSession(s);
    return NextResponse.json({ token });
  } catch (err) {
    console.error("POST /api/witness/start", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
