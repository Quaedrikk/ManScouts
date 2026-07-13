"use client";
import { useState } from "react";
import { BASE_PATH } from "@/lib/basePath";
import CoatOfArms from "./CoatOfArms";
import Ico from "./Ico";
import type { CoatOfArms as Coat } from "@/lib/types";

const SHAPES: Coat["shape"][] = ["shield", "circle", "diamond", "banner"];
const DIVS: { k: Coat["division"]; label: string }[] = [
  { k: "solid", label: "Solid" }, { k: "pale", label: "Split" }, { k: "fess", label: "Bar" },
  { k: "bend", label: "Diagonal" }, { k: "chevron", label: "Chevron" },
];
const ANIMS: { k: NonNullable<Coat["anim"]>; label: string }[] = [
  { k: "none", label: "None" }, { k: "pulse", label: "Pulse" }, { k: "spin", label: "Spin" },
  { k: "shimmer", label: "Shimmer" }, { k: "wave", label: "Wave" },
];
const CHARGES = [
  "mountain", "flame", "wave", "axe", "sword", "crown", "anchor", "bolt", "star", "paw", "leaf",
  "compass", "fish", "horn", "knot", "target", "rock", "controller", "ball", "rocket", "skull",
  "dice", "shield", "key", "feather", "heart", "globe", "gear", "drop", "moon",
];
const PALETTES: [string, string][] = [
  ["#2f5d45", "#1c4a34"], ["#1c2540", "#0f1626"], ["#6e1f24", "#3f1216"], ["#b5384d", "#7a2030"],
  ["#205a73", "#0f3346"], ["#3a2f6e", "#221a45"], ["#c0461f", "#6e2710"], ["#e3b97a", "#c48a3a"],
  ["#3a4ad9", "#1f2680"], ["#15161a", "#000000"], ["#2f8f8a", "#16504d"], ["#7a4a24", "#5a3618"],
];

const DEFAULT_COAT: Coat = { shape: "shield", division: "pale", field: "#2f5d45", field2: "#1c4a34", icon: "mountain", icons: ["mountain"], iconColor: "#f3e6c8", anim: "none" };

interface Props {
  onClose: () => void;
  onReloadProfile: () => void;
}

export default function SquadPanel({ onClose, onReloadProfile }: Props) {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [busy, setBusy] = useState(false);

  const [nm, setNm] = useState("");
  const [stakes, setStakes] = useState("");
  const [coat, setCoat] = useState<Coat>(DEFAULT_COAT);
  const set = (p: Partial<Coat>) => setCoat((c) => ({ ...c, ...p }));
  const charges = coat.icons ?? [coat.icon];
  function toggleCharge(n: string) {
    const has = charges.includes(n);
    const next = has ? charges.filter((x) => x !== n) : (charges.length >= 3 ? charges : [...charges, n]);
    if (next.length === 0) return;
    set({ icons: next, icon: next[0] });
  }

  const [code, setCode] = useState("");
  const [pledged, setPledged] = useState(false);

  async function create() {
    if (!nm.trim() || !stakes.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/squads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nm.trim(), stakes: stakes.trim(), coat }) });
      if (!res.ok) { alert("Couldn't create squad."); setBusy(false); return; }
      onReloadProfile(); onClose();
    } catch { alert("Couldn't create — try again."); }
    setBusy(false);
  }

  async function join() {
    if (!pledged) { alert("You must pledge to the stakes."); return; }
    setBusy(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/squads/join`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, pledged }) });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Couldn't join."); setBusy(false); return; }
      onReloadProfile(); onClose();
    } catch { alert("Couldn't join — try again."); }
    setBusy(false);
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 14px" }}>Squads</h2>

        {mode === "choose" && (
          <>
            <p className="muted" style={{ fontSize: 14, textAlign: "center", margin: "0 0 16px" }}>
              Band together. Pledge to shared stakes and fly your own coat of arms.
            </p>
            <button className="btn" onClick={() => setMode("create")}>Found a squad</button>
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={() => setMode("join")}>Join with a code</button>
          </>
        )}

        {mode === "create" && (
          <>
            <div style={{ padding: "2px 0 12px" }}><CoatOfArms coat={coat} size={96} /></div>

            <div className="label" style={{ marginBottom: 6 }}>Shape</div>
            <div className="seg" style={{ marginBottom: 10 }}>
              {SHAPES.map((s) => <button key={s} className={"chip" + (coat.shape === s ? " on" : "")} onClick={() => set({ shape: s })} style={{ textTransform: "capitalize" }}>{s}</button>)}
            </div>
            <div className="label" style={{ marginBottom: 6 }}>Division</div>
            <div className="seg" style={{ marginBottom: 10 }}>
              {DIVS.map((d) => <button key={d.k} className={"chip" + (coat.division === d.k ? " on" : "")} onClick={() => set({ division: d.k })}>{d.label}</button>)}
            </div>

            <div className="label" style={{ marginBottom: 6 }}>Palettes</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {PALETTES.map(([a, b], i) => (
                <button key={i} onClick={() => set({ field: a, field2: b })} title="Use palette"
                  style={{ width: 30, height: 24, borderRadius: 6, cursor: "pointer", border: "1px solid var(--line)", background: `linear-gradient(135deg, ${a} 50%, ${b} 50%)` }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
              <label style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>Field 1<br /><input type="color" value={coat.field} onChange={(e) => set({ field: e.target.value })} style={{ width: "100%", height: 34 }} /></label>
              <label style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>Field 2<br /><input type="color" value={coat.field2} onChange={(e) => set({ field2: e.target.value })} style={{ width: "100%", height: 34 }} /></label>
              <label style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>Charge<br /><input type="color" value={coat.iconColor} onChange={(e) => set({ iconColor: e.target.value })} style={{ width: "100%", height: 34 }} /></label>
            </div>

            <div className="label" style={{ marginBottom: 6 }}>Emblems (pick up to 3) · {charges.length}/3</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(0,1fr))", gap: 6, marginBottom: 12 }}>
              {CHARGES.map((n) => {
                const on = charges.includes(n);
                return (
                  <button key={n} onClick={() => toggleCharge(n)} style={{ aspectRatio: "1", borderRadius: 9, cursor: "pointer", border: on ? "2px solid var(--ink)" : "1px solid var(--line)", background: on ? "var(--ink)" : "var(--card)", padding: 5 }}>
                    <Ico name={n} stroke={on ? "#fff" : "var(--muted)"} />
                  </button>
                );
              })}
            </div>

            <div className="label" style={{ marginBottom: 6 }}>Animation</div>
            <div className="seg" style={{ marginBottom: 12 }}>
              {ANIMS.map((a) => <button key={a.k} className={"chip" + ((coat.anim ?? "none") === a.k ? " on" : "")} onClick={() => set({ anim: a.k })}>{a.label}</button>)}
            </div>

            <div className="label" style={{ marginBottom: 6 }}>Squad name</div>
            <input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="The Ironwood Pact" />
            <div className="label" style={{ margin: "12px 0 6px" }}>The Stakes (what everyone pledges to)</div>
            <textarea rows={3} value={stakes} onChange={(e) => setStakes(e.target.value)} placeholder="Two badges a month or you're out." />
            <div style={{ height: 14 }} />
            <button className="btn" disabled={!nm.trim() || !stakes.trim() || busy} onClick={create}>{busy ? "Creating…" : "Found the squad"}</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={() => setMode("choose")}>Back</button>
          </>
        )}

        {mode === "join" && (
          <>
            <div className="label" style={{ marginBottom: 6 }}>Squad invite code</div>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} style={{ textTransform: "uppercase", letterSpacing: 3, fontWeight: 800 }} />
            <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, fontSize: 13.5, cursor: "pointer" }}>
              <input type="checkbox" checked={pledged} onChange={(e) => setPledged(e.target.checked)} style={{ width: 18, height: 18 }} />
              I pledge to uphold my squad&apos;s stakes.
            </label>
            <div style={{ height: 14 }} />
            <button className="btn" disabled={code.length < 4 || !pledged || busy} onClick={join}>{busy ? "Joining…" : "Join squad"}</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={() => setMode("choose")}>Back</button>
          </>
        )}

        <div style={{ height: 10 }} />
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
