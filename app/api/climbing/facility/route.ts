import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getFacility, saveFacility } from "@/lib/climbKv";
import type { FacilityBox } from "@/lib/climb";

export async function GET(req: NextRequest) {
  const gym = new URL(req.url).searchParams.get("gym") ?? "";
  try {
    return NextResponse.json({ boxes: await getFacility(gym) });
  } catch (err) {
    console.error("GET /api/climbing/facility", err);
    return NextResponse.json({ boxes: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { gym, boxes } = (await req.json()) as { gym: string; boxes: FacilityBox[] };
    await saveFacility(gym, Array.isArray(boxes) ? boxes : []);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/climbing/facility", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
