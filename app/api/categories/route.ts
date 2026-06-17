import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getCustomCategories, saveCustomCategory, deleteCustomCategory, getHiddenCategories, hideCategory, unhideAllCategories } from "@/lib/kv";
import type { Category } from "@/lib/types";

export async function GET() {
  try {
    const [categories, hidden] = await Promise.all([getCustomCategories(), getHiddenCategories()]);
    return NextResponse.json({ categories, hidden });
  } catch (err) {
    console.error("GET /api/categories", err);
    return NextResponse.json({ categories: [], hidden: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const b = (await req.json()) as Partial<Category>;
    if (!b.name?.trim() || !b.color?.trim()) {
      return NextResponse.json({ error: "Name and color required" }, { status: 400 });
    }
    const category: Category = { name: b.name.trim(), color: b.color.trim() };
    await saveCustomCategory(category);
    return NextResponse.json({ category });
  } catch (err) {
    console.error("POST /api/categories", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const params = new URL(req.url).searchParams;
    if (params.get("restore") === "1") {
      await unhideAllCategories();
      return NextResponse.json({ ok: true });
    }
    const name = params.get("name");
    if (!name) return NextResponse.json({ error: "No name" }, { status: 400 });
    // Remove if custom; hide if it's a built-in one.
    await deleteCustomCategory(name);
    await hideCategory(name);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/categories", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
