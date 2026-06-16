import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getCustomCategories, saveCustomCategory } from "@/lib/kv";
import type { Category } from "@/lib/types";

export async function GET() {
  try {
    const categories = await getCustomCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("GET /api/categories", err);
    return NextResponse.json({ categories: [] });
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
