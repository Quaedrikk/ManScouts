import { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { BASE_PATH } from "@/lib/basePath";

// Next.js strips its basePath from the URL before route handlers run, but
// NextAuth derives its base path from AUTH_URL, which includes the prefix.
// Re-add it so NextAuth parses the action and builds callback URLs correctly.
function withBasePath(handler: (req: NextRequest) => Promise<Response>) {
  if (!BASE_PATH) return handler;
  return (req: NextRequest) => {
    const url = new URL(req.nextUrl.href);
    url.pathname = `${BASE_PATH}${url.pathname}`;
    return handler(new NextRequest(url, req));
  };
}

export const GET = withBasePath(handlers.GET);
export const POST = withBasePath(handlers.POST);
