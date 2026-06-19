import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getSeason, setSeason, getProposals, getPropVotes, getOverrides, setOverrides, clearProposals, addProposal } from "@/lib/kv";
import type { SeasonPhase, Proposal } from "@/lib/types";

export async function GET() {
  try {
    return NextResponse.json({ season: await getSeason() });
  } catch (err) {
    console.error("GET /api/season", err);
    return NextResponse.json({ season: { phase: "off" } });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = (await req.json()) as { phase?: SeasonPhase; action?: string };

    if (body.action === "apply") {
      // Tally each proposal; majority Yes applies it as a season override.
      const [proposals, votes, overrides] = await Promise.all([getProposals(), getPropVotes(), getOverrides()]);
      let applied = 0;
      for (const p of proposals) {
        const v = votes[p.id] ?? {};
        const yes = Object.values(v).filter((x) => x === "yes").length;
        const no = Object.values(v).filter((x) => x === "no").length;
        if (yes > no) {
          const o = overrides[p.challengeId] ?? {};
          if (typeof p.pts === "number") o.pts = p.pts;
          if (Array.isArray(p.how)) o.how = p.how;
          if (p.proofMedia) o.proofMedia = p.proofMedia;
          if (typeof p.needsWitness === "boolean") o.needsWitness = p.needsWitness;
          overrides[p.challengeId] = o;
          applied++;
        }
      }
      await setOverrides(overrides);
      await clearProposals();
      await setSeason({ phase: "closed" });
      return NextResponse.json({ ok: true, applied });
    }

    if (body.action === "reset") {
      await clearProposals();
      await setSeason({ phase: "off" });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "seed") {
      // Debug: drop in a couple of sample proposals.
      const now = new Date().toISOString();
      const samples: Proposal[] = [
        { id: `p${Date.now()}a`, challengeId: "g-at-10k", challengeName: "10-Thousand", userId: "demo1", userName: "Demo Scout", pts: 35, note: "Worth more — a 10K is real work.", createdAt: now },
        { id: `p${Date.now()}b`, challengeId: "g-hl-milk", challengeName: "He Needs Some Milk", userId: "demo2", userName: "Demo Scout", needsWitness: false, note: "Self-filmable, no witness needed.", createdAt: now },
      ];
      for (const s of samples) await addProposal(s);
      await setSeason({ phase: "review" });
      return NextResponse.json({ ok: true });
    }

    if (body.phase) {
      await setSeason({ phase: body.phase });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "No action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/season", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
