import { NextRequest, NextResponse } from "next/server";
import { getWitnessSession } from "@/lib/kv";

// Polled by the earner (to list witnesses) and the witness page (to show what
// they're vouching for). Token is unguessable, so no auth.
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });
  try {
    const s = await getWitnessSession(token);
    if (!s) return NextResponse.json({ found: false });
    return NextResponse.json({
      found: true,
      earnerName: s.earnerName,
      challengeName: s.challengeName,
      witnesses: s.witnesses,
    });
  } catch (err) {
    console.error("GET /api/witness/status", err);
    return NextResponse.json({ found: false });
  }
}
