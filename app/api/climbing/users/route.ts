import { NextResponse } from "next/server";
import { getClimbUsers } from "@/lib/climbKv";

export async function GET() {
  try {
    const users = (await getClimbUsers()).map((p) => ({ id: p.id, name: p.name, handle: p.handle, avatarUrl: p.avatarUrl }));
    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /api/climbing/users", err);
    return NextResponse.json({ users: [] });
  }
}
