import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, getWitnessSession, updateWitnessSession } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { token, witnessPhotoUrl } = (await req.json()) as { token: string; witnessPhotoUrl?: string };
    const s = await getWitnessSession(token);
    if (!s) return NextResponse.json({ error: "This request expired or doesn't exist." }, { status: 404 });
    if (s.earnerId === session.user.id) {
      return NextResponse.json({ error: "You can't witness your own badge." }, { status: 400 });
    }
    if (!witnessPhotoUrl) {
      return NextResponse.json({ error: "A photo is required." }, { status: 400 });
    }
    const profile = await getUserProfile(session.user.id);
    const entry = {
      id: session.user.id,
      name: profile?.name ?? session.user.name ?? "A scout",
      handle: profile?.handle ?? "",
      photoUrl: witnessPhotoUrl,
    };
    // De-dupe by witness id (re-confirm replaces).
    s.witnesses = [...s.witnesses.filter((w) => w.id !== entry.id), entry];
    await updateWitnessSession(s);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/witness/confirm", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
