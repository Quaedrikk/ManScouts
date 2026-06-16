"use client";
import { useState } from "react";
import Badge from "./Badge";
import { DIFFS } from "@/lib/challenges";
import { useCatalog } from "@/lib/catalog";
import type { Challenge } from "@/lib/types";

interface Props {
  earnedIds: Set<string>;
  onPick: (ch: Challenge) => void;
}

export default function Trail({ earnedIds, onPick }: Props) {
  const { challenges, catList } = useCatalog();
  const [fCat, setFCat] = useState("All");
  const [fDiff, setFDiff] = useState("All");

  const list = challenges.filter(
    (c) => (fCat === "All" || c.cat === fCat) && (fDiff === "All" || c.df === fDiff)
  );

  return (
    <div>
      <div className="display" style={{ fontSize: 26, margin: "18px 2px 4px" }}>Rights of Passage</div>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 2px 16px" }}>
        {earnedIds.size} of {challenges.length} badges earned. Pick one, go do it for real, prove it.
      </p>

      <div className="label" style={{ margin: "0 2px 7px" }}>Difficulty</div>
      <div className="seg" style={{ marginBottom: 12 }}>
        {["All", ...Object.keys(DIFFS)].map((d) => (
          <button key={d} className={"chip" + (fDiff === d ? " on" : "")} onClick={() => setFDiff(d)}>{d}</button>
        ))}
      </div>

      <div className="label" style={{ margin: "0 2px 7px" }}>Category</div>
      <div className="seg" style={{ marginBottom: 18 }}>
        {["All", ...catList].map((c) => (
          <button key={c} className={"chip" + (fCat === c ? " on" : "")} onClick={() => setFCat(c)}>{c}</button>
        ))}
      </div>

      <div className="grid2">
        {list.map((c) => {
          const e = earnedIds.has(c.id);
          return (
            <div key={c.id} className={"cell" + (e ? "" : " locked")} onClick={() => onPick(c)}>
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
              <div className="df" style={{ color: DIFFS[c.df].c }}>{c.df}</div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="muted" style={{ textAlign: "center", marginTop: 30 }}>No badges match that filter.</p>}
    </div>
  );
}
