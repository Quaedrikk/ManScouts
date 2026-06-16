import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Client uploads go straight from the browser to Blob storage, so large
// videos aren't capped by the ~4.5MB serverless request-body limit. This
// route only mints a short-lived upload token for signed-in users.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user) throw new Error("Not signed in");
        return {
          allowedContentTypes: ["image/*", "video/*"],
          addRandomSuffix: true,
          maximumSizeInBytes: 200 * 1024 * 1024, // 200MB
        };
      },
      onUploadCompleted: async () => {
        // No-op: the client uses the URL returned from `upload()` directly.
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    console.error("POST /api/upload", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
