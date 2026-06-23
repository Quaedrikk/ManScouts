import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getRoutes, addRoute, deleteRoute, getClimbProfile, saveRoutes } from "@/lib/climbKv";
import type { Route } from "@/lib/climb";

export async function GET(req: NextRequest) {
  const gym = new URL(req.url).searchParams.get("gym") ?? "";
  try {
    return NextResponse.json({ routes: await getRoutes(gym) });
  } catch (err) {
    console.error("GET /api/climbing/routes", err);
    return NextResponse.json({ routes: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profile = await getClimbProfile(session.user.id);
    const b = (await req.json()) as Pick<Route, "gym" | "wall" | "color" | "grade" | "setters" | "photoUrl" | "holds">;
    if (!b.photoUrl) return NextResponse.json({ error: "A route photo is required" }, { status: 400 });
    const route: Route = {
      id: `r${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      gym: b.gym, wall: b.wall, color: b.color, grade: b.grade,
      setters: Array.isArray(b.setters) && b.setters.length ? b.setters : [profile?.name ?? session.user.name ?? "Setter"],
      photoUrl: b.photoUrl, holds: Array.isArray(b.holds) ? b.holds : [],
      createdBy: session.user.id, createdAt: new Date().toISOString(),
    };
    await addRoute(route);
    return NextResponse.json({ ok: true, route });
  } catch (err) {
    console.error("POST /api/climbing/routes", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Suggest a V grade for an Unrated route.
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = (await req.json()) as { gym: string; id: string; grade: number };
    const g = Math.round(Number(b.grade));
    if (!(g >= 1 && g <= 6)) return NextResponse.json({ error: "Bad grade" }, { status: 400 });
    const routes = await getRoutes(b.gym);
    const route = routes.find((r) => r.id === b.id);
    if (!route) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (route.grade !== 0) return NextResponse.json({ error: "Route is already rated" }, { status: 400 });
    route.suggestions = { ...(route.suggestions ?? {}), [session.user.id]: g };
    await saveRoutes(b.gym, routes);
    return NextResponse.json({ ok: true, route });
  } catch (err) {
    console.error("PATCH /api/climbing/routes", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(req.url);
    const gym = url.searchParams.get("gym") ?? "";
    const id = url.searchParams.get("id") ?? "";
    const routes = await getRoutes(gym);
    const r = routes.find((x) => x.id === id);
    if (r && r.createdBy !== session.user.id && !isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await deleteRoute(gym, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/climbing/routes", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
