"use client";
import { SessionProvider } from "next-auth/react";
import { CatalogProvider } from "@/lib/catalog";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CatalogProvider>{children}</CatalogProvider>
    </SessionProvider>
  );
}
