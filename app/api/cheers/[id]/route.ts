import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleCheer } from "@/lib/kv";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    // userId comes from the session so cheers can't be inflated by spoofing.
    const result = await toggleCheer(id, session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/cheers", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
