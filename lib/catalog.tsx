"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { BASE_PATH } from "@/lib/basePath";
import { useSession } from "next-auth/react";
import { CHALLENGES, CATS } from "./challenges";
import { GENERATED } from "./generated";
import { isAdminEmail } from "./admin";
import type { Challenge, Category, ChallengeOverride } from "./types";

// Categories that always exist on top of the built-in ones.
const EXTRA_CATS: Record<string, { c: string }> = {
  Scholar: { c: "#a8c6fe" },
  Gamer: { c: "#7b219f" },
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
  const [overrides, setOverrides] = useState<Record<string, ChallengeOverride>>({});
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const [c, k] = await Promise.all([
        fetch(`${BASE_PATH}/api/challenges`).then((r) => r.json()),
        fetch(`${BASE_PATH}/api/categories`).then((r) => r.json()),
      ]);
      setCustom(c.challenges ?? []);
      setHiddenCh(c.hidden ?? []);
      setOverrides(c.overrides ?? {});
      setCustomCats(k.categories ?? []);
      setHiddenCat(k.hidden ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Load this user's favourites once signed in.
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`${BASE_PATH}/api/favourites`).then((r) => r.json())
      .then((d) => setFavourites(new Set(d.ids ?? [])))
      .catch(() => {});
  }, [status]);

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    fetch(`${BASE_PATH}/api/favourites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: id }),
    }).catch(() => {});
  }, []);

  const cats: Record<string, { c: string }> = { ...CATS, ...EXTRA_CATS };
  for (const cc of customCats) cats[cc.name] = { c: cc.color };
  for (const name of hiddenCat) delete cats[name]; // soft-deleted categories

  const hiddenSet = new Set(hiddenCh);
  const challenges = [...CHALLENGES, ...GENERATED, ...custom]
    .filter((c) => !hiddenSet.has(c.id))
    .map((c) => {
      const o = overrides[c.id];
      return o ? { ...c, ...(o.pts != null ? { pts: o.pts } : {}), ...(o.how ? { how: o.how } : {}), ...(o.proofMedia ? { proofMedia: o.proofMedia } : {}), ...(o.needsWitness != null ? { needsWitness: o.needsWitness } : {}) } : c;
    });
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
