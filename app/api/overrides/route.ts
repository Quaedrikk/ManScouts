import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getOverrides, setOverrides } from "@/lib/kv";
import type { ChallengeOverride } from "@/lib/types";

// Admin: set a season override for any passage (built-in, generated, or custom).
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = (await req.json()) as { challengeId: string } & ChallengeOverride;
    if (!b.challengeId) return NextResponse.json({ error: "No challenge" }, { status: 400 });
    const overrides = await getOverrides();
    const o = overrides[b.challengeId] ?? {};
    if (typeof b.pts === "number") o.pts = b.pts;
    if (Array.isArray(b.how)) o.how = b.how;
    if (b.proofMedia) o.proofMedia = b.proofMedia;
    if (typeof b.needsWitness === "boolean") o.needsWitness = b.needsWitness;
    overrides[b.challengeId] = o;
    await setOverrides(overrides);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/overrides", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
