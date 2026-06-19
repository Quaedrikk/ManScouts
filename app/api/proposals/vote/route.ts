import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { setPropVote } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { proposalId, vote } = (await req.json()) as { proposalId: string; vote: "yes" | "no" };
    if (!proposalId || (vote !== "yes" && vote !== "no")) {
      return NextResponse.json({ error: "Bad vote" }, { status: 400 });
    }
    await setPropVote(proposalId, session.user.id, vote);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/proposals/vote", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
