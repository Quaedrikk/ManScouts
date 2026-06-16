import { NextRequest, NextResponse } from "next/server";
import { getWitnessSession } from "@/lib/kv";

// Polled by both the earner (waiting for confirmation) and the witness page
// (to show who/what they're vouching for). Token is unguessable, so no auth.
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });
  try {
    const s = await getWitnessSession(token);
    if (!s) return NextResponse.json({ found: false });
    return NextResponse.json({
      found: true,
      status: s.status,
      earnerName: s.earnerName,
      challengeName: s.challengeName,
      witnessName: s.witnessName,
      witnessHandle: s.witnessHandle,
    });
  } catch (err) {
    console.error("GET /api/witness/status", err);
    return NextResponse.json({ found: false });
  }
}
