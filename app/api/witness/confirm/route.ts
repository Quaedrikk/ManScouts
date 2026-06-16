import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, getWitnessSession, updateWitnessSession } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { token } = (await req.json()) as { token: string };
    const s = await getWitnessSession(token);
    if (!s) return NextResponse.json({ error: "This request expired or doesn't exist." }, { status: 404 });
    if (s.earnerId === session.user.id) {
      return NextResponse.json({ error: "You can't witness your own badge." }, { status: 400 });
    }
    const profile = await getUserProfile(session.user.id);
    s.status = "confirmed";
    s.witnessId = session.user.id;
    s.witnessName = profile?.name ?? session.user.name ?? "A scout";
    s.witnessHandle = profile?.handle ?? "";
    await updateWitnessSession(s);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/witness/confirm", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
