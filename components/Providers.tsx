"use client";
import { SessionProvider } from "next-auth/react";
import { CatalogProvider } from "@/lib/catalog";
import { BASE_PATH } from "@/lib/basePath";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath={`${BASE_PATH}/api/auth`}>
      <CatalogProvider>{children}</CatalogProvider>
    </SessionProvider>
  );
}
