import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFavourites, toggleFavourite } from "@/lib/kv";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ ids: [] });
  try {
    return NextResponse.json({ ids: await getFavourites(session.user.id) });
  } catch (err) {
    console.error("GET /api/favourites", err);
    return NextResponse.json({ ids: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { challengeId } = (await req.json()) as { challengeId: string };
    if (!challengeId) return NextResponse.json({ error: "No challengeId" }, { status: 400 });
    const ids = await toggleFavourite(session.user.id, challengeId);
    return NextResponse.json({ ids });
  } catch (err) {
    console.error("POST /api/favourites", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
