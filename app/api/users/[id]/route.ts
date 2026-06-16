import { NextResponse } from "next/server";
import { getUserProfile, getSashData } from "@/lib/kv";

// Public profile view: returns a user's profile + their saved sash so others
// can see their badge wall. No private fields are stored on the profile.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [profile, sash] = await Promise.all([getUserProfile(id), getSashData(id)]);
    return NextResponse.json({ profile, sash });
  } catch (err) {
    console.error("GET /api/users/[id]", err);
    return NextResponse.json({ profile: null, sash: { layout: {}, style: "forest" } });
  }
}
