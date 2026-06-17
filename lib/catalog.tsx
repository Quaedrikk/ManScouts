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
  customCats: Category[];
  isAdmin: boolean;
  favourites: Set<string>;
  toggleFavourite: (id: string) => void;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [custom, setCustom] = useState<Challenge[]>([]);
  const [customCats, setCustomCats] = useState<Category[]>([]);
  const [hiddenCh, setHiddenCh] = useState<string[]>([]);
  const [hiddenCat, setHiddenCat] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const [c, k] = await Promise.all([
        fetch("/api/challenges").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      setCustom(c.challenges ?? []);
      setHiddenCh(c.hidden ?? []);
      setCustomCats(k.categories ?? []);
      setHiddenCat(k.hidden ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Load this user's favourites once signed in.
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/favourites").then((r) => r.json())
      .then((d) => setFavourites(new Set(d.ids ?? [])))
      .catch(() => {});
  }, [status]);

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    fetch("/api/favourites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: id }),
    }).catch(() => {});
  }, []);

  const cats: Record<string, { c: string }> = { ...CATS, ...EXTRA_CATS };
  for (const cc of customCats) cats[cc.name] = { c: cc.color };
  for (const name of hiddenCat) delete cats[name]; // soft-deleted categories

  const hiddenSet = new Set(hiddenCh);
  const challenges = [...CHALLENGES.filter((c) => !hiddenSet.has(c.id)), ...custom];
  const map = new Map(challenges.map((c) => [c.id, c]));

  const value: CatalogValue = {
    challenges,
    cats,
    catList: Object.keys(cats),
    byId: (id) => map.get(id),
    catColor: (cat) => cats[cat]?.c ?? "#555",
    customCats,
    isAdmin: isAdminEmail(session?.user?.email),
    favourites,
    toggleFavourite,
    refresh,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
