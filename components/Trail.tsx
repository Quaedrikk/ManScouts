"use client";
import { useState } from "react";
import Badge from "./Badge";
import Stars from "./Stars";
import CategoryScene from "./CategoryScene";
import { chStars } from "@/lib/challenges";
import { useCatalog } from "@/lib/catalog";
import type { Challenge } from "@/lib/types";

interface Props {
  earnedIds: Set<string>;
  onPick: (ch: Challenge) => void;
}

type SortMode = "category" | "difficulty" | "points";

export default function Trail({ earnedIds, onPick }: Props) {
  const { challenges, catList, catColor, favourites, toggleFavourite } = useCatalog();
  const [sort, setSort] = useState<SortMode>("category");
  const [fDiff, setFDiff] = useState(0); // 0 = all, else 1–5 stars
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const matches = q.trim()
    ? challenges.filter((c) => c.nm.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : [];

  const filtered = challenges.filter((c) => fDiff === 0 || chStars(c) === fDiff);
  const favFirst = (a: Challenge, b: Challenge) => (favourites.has(b.id) ? 1 : 0) - (favourites.has(a.id) ? 1 : 0);

  function cell(c: Challenge) {
    const e = earnedIds.has(c.id);
    return (
      <div key={c.id} className={"cell" + (e ? "" : " locked")} onClick={() => onPick(c)}>
        <button
          onClick={(ev) => { ev.stopPropagation(); toggleFavourite(c.id); }}
          title={favourites.has(c.id) ? "Unfavourite" : "Favourite"}
          style={{ position: "absolute", top: 7, left: 7, background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1, zIndex: 2 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={favourites.has(c.id) ? "var(--gold)" : "none"} stroke={favourites.has(c.id) ? "var(--gold)" : "#b7ab97"} strokeWidth="2" strokeLinejoin="round">
            <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" />
          </svg>
        </button>
        <span className="corner" style={{ background: e ? "var(--green)" : "var(--tint)" }}>
          {e ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M5 12l4 4 10-11" /></svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7a7367" strokeWidth="2.6"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          )}
        </span>
        <Badge ch={c} size={76} />
        <div className="nm">{c.nm}</div>
        <div className="df" style={{ marginTop: 6 }}><Stars n={chStars(c)} size={12} /></div>
        <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>{c.pts} pts</div>
      </div>
    );
  }

  const SORTS: { k: SortMode; label: string }[] = [
    { k: "category", label: "By Category" },
    { k: "points", label: "By Points" },
  ];

  return (
    <div>
      <div className="display" style={{ fontSize: 26, margin: "18px 2px 4px" }}>Rights of Passage</div>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 2px 16px" }}>
        {earnedIds.size} of {challenges.length} badges earned. Pick one, go do it for real, prove it.
      </p>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 14, zIndex: 6 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 Search passages…" />
        {matches.length > 0 && (
          <div className="ddmenu" style={{ maxHeight: 320 }}>
            {matches.map((c) => (
              <button key={c.id} className="ddopt" style={{ gap: 10 }} onClick={() => { onPick(c); setQ(""); }}>
                <Badge ch={c} size={30} />
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nm}</span>
                <Stars n={chStars(c)} size={11} />
                <span className="muted" style={{ fontSize: 11, fontWeight: 700, marginLeft: 8 }}>{c.pts} pts</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort options */}
      <div className="seg" style={{ marginBottom: 12 }}>
        {SORTS.map((s) => (
          <button key={s.k} className={"chip" + (sort === s.k ? " on" : "")} style={{ flex: 1 }} onClick={() => setSort(s.k)}>{s.label}</button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div style={{ position: "relative", marginBottom: 16, zIndex: 5, maxWidth: 220 }}>
        <button className="ddbtn" onClick={() => setOpen((o) => !o)}>
          <span>{fDiff === 0 ? "Any difficulty" : <Stars n={fDiff} size={12} />}</span>
          <span style={{ opacity: .6 }}>▾</span>
        </button>
        {open && (
          <div className="ddmenu">
            <button className={"ddopt" + (fDiff === 0 ? " on" : "")} onClick={() => { setFDiff(0); setOpen(false); }}>Any difficulty</button>
            {[1, 2, 3, 4, 5].map((d) => (
              <button key={d} className={"ddopt" + (fDiff === d ? " on" : "")} onClick={() => { setFDiff(d); setOpen(false); }}>
                <Stars n={d} size={13} />
              </button>
            ))}
          </div>
        )}
      </div>

      {sort === "category" ? (
        catList.map((c) => {
          const group = filtered.filter((x) => x.cat === c).sort((a, b) => favFirst(a, b) || chStars(a) - chStars(b));
          if (group.length === 0) return null;
          return (
            <div key={c} className="catrow">
              <div className="cathead">
                <span className="dot" style={{ background: catColor(c) }} />
                <span className="nm">{c}</span>
                <span className="ct">{group.length}</span>
              </div>
              <div className="hscroll">{group.map(cell)}</div>
            </div>
          );
        })
      ) : (
        <>
          <CategoryScene cat="All" color="#6f4a2a" />
          <div className="grid2">
            {[...filtered]
              .sort((a, b) => favFirst(a, b) || (sort === "points" ? a.pts - b.pts : chStars(a) - chStars(b)))
              .map(cell)}
          </div>
        </>
      )}

      {filtered.length === 0 && <p className="muted" style={{ textAlign: "center", marginTop: 30 }}>No badges match that filter.</p>}
    </div>
  );
}
