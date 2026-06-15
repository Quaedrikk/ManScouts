import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const prefix = (form.get("prefix") as string) || "uploads";

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
