import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSashLayout, saveSashLayout } from "@/lib/kv";
import type { SashLayout } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ layout: {} });
  try {
    const layout = await getSashLayout(session.user.id);
    return NextResponse.json({ layout });
  } catch (err) {
    console.error("GET /api/sash", err);
    return NextResponse.json({ layout: {} });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { layout } = (await req.json()) as { layout: SashLayout };
    await saveSashLayout(session.user.id, layout ?? {});
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/sash", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
