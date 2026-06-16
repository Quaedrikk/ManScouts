import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSashData, saveSashData } from "@/lib/kv";
import type { SashLayout } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ layout: {}, style: "forest" });
  try {
    const data = await getSashData(session.user.id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/sash", err);
    return NextResponse.json({ layout: {}, style: "forest" });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { layout, style } = (await req.json()) as { layout: SashLayout; style: string };
    await saveSashData(session.user.id, { layout: layout ?? {}, style: style ?? "forest" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/sash", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
