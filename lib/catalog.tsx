"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CHALLENGES, CATS } from "./challenges";
import { isAdminEmail } from "./admin";
import type { Challenge, Category } from "./types";

// Categories that always exist on top of the built-in ones.
const EXTRA_CATS: Record<string, { c: string }> = {
  "Real Passages": { c: "#6f4a2a" },
};

interface CatalogValue {
  challenges: Challenge[];
  cats: Record<string, { c: string }>;
  catList: string[];
  byId: (id: string) => Challenge | undefined;
  catColor: (cat: string) => string;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [custom, setCustom] = useState<Challenge[]>([]);
  const [customCats, setCustomCats] = useState<Category[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [c, k] = await Promise.all([
        fetch("/api/challenges").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      setCustom(c.challenges ?? []);
      setCustomCats(k.categories ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const cats: Record<string, { c: string }> = { ...CATS, ...EXTRA_CATS };
  for (const cc of customCats) cats[cc.name] = { c: cc.color };

  const challenges = [...CHALLENGES, ...custom];
  const map = new Map(challenges.map((c) => [c.id, c]));

  const value: CatalogValue = {
    challenges,
    cats,
    catList: Object.keys(cats),
    byId: (id) => map.get(id),
    catColor: (cat) => cats[cat]?.c ?? "#555",
    isAdmin: isAdminEmail(session?.user?.email),
    refresh,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
