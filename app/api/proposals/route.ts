import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, getProposals, addProposal, getPropVotes } from "@/lib/kv";
import type { Proposal } from "@/lib/types";

export async function GET() {
  const session = await auth();
  const me = session?.user?.id;
  try {
    const [proposals, votes] = await Promise.all([getProposals(), getPropVotes()]);
    const withTallies = proposals.map((p) => {
      const v = votes[p.id] ?? {};
      const vals = Object.values(v);
      return {
        ...p,
        votesYes: vals.filter((x) => x === "yes").length,
        votesNo: vals.filter((x) => x === "no").length,
        myVote: (me && v[me]) || null,
      };
    });
    return NextResponse.json({ proposals: withTallies });
  } catch (err) {
    console.error("GET /api/proposals", err);
    return NextResponse.json({ proposals: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profile = await getUserProfile(session.user.id);
    const b = (await req.json()) as Partial<Proposal>;
    if (!b.challengeId) return NextResponse.json({ error: "No challenge" }, { status: 400 });
    const p: Proposal = {
      id: `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      challengeId: b.challengeId,
      challengeName: b.challengeName ?? "",
      userId: session.user.id,
      userName: profile?.name ?? session.user.name ?? "A scout",
      pts: typeof b.pts === "number" ? b.pts : undefined,
      how: Array.isArray(b.how) ? b.how.filter(Boolean) : undefined,
      proofMedia: b.proofMedia,
      needsWitness: typeof b.needsWitness === "boolean" ? b.needsWitness : undefined,
      note: b.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    await addProposal(p);
    return NextResponse.json({ ok: true, proposal: p });
  } catch (err) {
    console.error("POST /api/proposals", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
