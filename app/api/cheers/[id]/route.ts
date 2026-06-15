import { NextRequest, NextResponse } from "next/server";
import { toggleCheer } from "@/lib/kv";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await req.json() as { userId: string };
    if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });
    const result = await toggleCheer(id, userId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/cheers", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
