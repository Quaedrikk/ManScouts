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

export default function Trail({ earnedIds, onPick }: Props) {
  const { challenges, catList, catColor, favourites, toggleFavourite } = useCatalog();
  const [fCat, setFCat] = useState("All");
  const [fDiff, setFDiff] = useState(0); // 0 = all, else 1–5 stars
  const [open, setOpen] = useState<"diff" | "cat" | null>(null);

  const list = challenges
    .filter((c) => (fCat === "All" || c.cat === fCat) && (fDiff === 0 || chStars(c) === fDiff))
    // Favourites first, then always easiest → hardest.
    .sort((a, b) => {
      const fav = (favourites.has(b.id) ? 1 : 0) - (favourites.has(a.id) ? 1 : 0);
      return fav !== 0 ? fav : chStars(a) - chStars(b);
    });

  return (
    <div>
      <div className="display" style={{ fontSize: 26, margin: "18px 2px 4px" }}>Rights of Passage</div>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 2px 16px" }}>
        {earnedIds.size} of {challenges.length} badges earned. Pick one, go do it for real, prove it.
      </p>

      <CategoryScene cat={fCat} color={fCat === "All" ? "#6f4a2a" : catColor(fCat)} />

      {/* Filter dropdowns */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, position: "relative", zIndex: 5 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <button className="ddbtn" onClick={() => setOpen(open === "diff" ? null : "diff")}>
            <span>{fDiff === 0 ? "Any difficulty" : <Stars n={fDiff} size={12} />}</span>
            <span style={{ opacity: .6 }}>▾</span>
          </button>
          {open === "diff" && (
            <div className="ddmenu">
              <button className={"ddopt" + (fDiff === 0 ? " on" : "")} onClick={() => { setFDiff(0); setOpen(null); }}>Any difficulty</button>
              {[1, 2, 3, 4, 5].map((d) => (
                <button key={d} className={"ddopt" + (fDiff === d ? " on" : "")} onClick={() => { setFDiff(d); setOpen(null); }}>
                  <Stars n={d} size={13} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "relative", flex: 1 }}>
          <button className="ddbtn" onClick={() => setOpen(open === "cat" ? null : "cat")}>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fCat === "All" ? "All categories" : fCat}</span>
            <span style={{ opacity: .6 }}>▾</span>
          </button>
          {open === "cat" && (
            <div className="ddmenu">
              <button className={"ddopt" + (fCat === "All" ? " on" : "")} onClick={() => { setFCat("All"); setOpen(null); }}>All categories</button>
              {catList.map((c) => (
                <button key={c} className={"ddopt" + (fCat === c ? " on" : "")} onClick={() => { setFCat(c); setOpen(null); }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: catColor(c), display: "inline-block", marginRight: 8 }} />
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid2">
        {list.map((c) => {
          const e = earnedIds.has(c.id);
          return (
            <div key={c.id} className={"cell" + (e ? "" : " locked")} onClick={() => onPick(c)}>
              <button
                onClick={(ev) => { ev.stopPropagation(); toggleFavourite(c.id); }}
                title={favourites.has(c.id) ? "Unfavourite" : "Favourite"}
                style={{ position: "absolute", top: 7, left: 7, background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1, zIndex: 2 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill={favourites.has(c.id) ? "var(--gold)" : "none"}
                  stroke={favourites.has(c.id) ? "var(--gold)" : "#b7ab97"} strokeWidth="2" strokeLinejoin="round">
                  <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 21.2l1.4-6.8L2.2 9.7l6.9-.7z" />
                </svg>
              </button>
              <span className="corner" style={{ background: e ? "var(--green)" : "var(--tint)" }}>
                {e ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                    <path d="M5 12l4 4 10-11" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7a7367" strokeWidth="2.6">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                )}
              </span>
              <Badge ch={c} size={76} />
              <div className="nm">{c.nm}</div>
              <div className="df" style={{ marginTop: 6 }}><Stars n={chStars(c)} size={12} /></div>
              <div className="muted" style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>{c.pts} pts</div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="muted" style={{ textAlign: "center", marginTop: 30 }}>No badges match that filter.</p>}
    </div>
  );
}
