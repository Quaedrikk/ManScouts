"use client";
import { useEffect, useState, useCallback } from "react";
import CoatOfArms from "./CoatOfArms";
import Ico from "./Ico";
import type { UserProfile, Squad, CoatOfArms as Coat } from "@/lib/types";

const SHAPES: Coat["shape"][] = ["shield", "circle", "diamond", "banner"];
const DIVS: { k: Coat["division"]; label: string }[] = [
  { k: "solid", label: "Solid" }, { k: "pale", label: "Split" }, { k: "fess", label: "Bar" },
  { k: "bend", label: "Diagonal" }, { k: "chevron", label: "Chevron" },
];
const CHARGES = ["mountain", "flame", "wave", "axe", "sword", "crown", "anchor", "bolt", "star", "paw", "leaf", "compass", "fish", "horn", "knot", "target"];

const DEFAULT_COAT: Coat = { shape: "shield", division: "pale", field: "#2f5d45", field2: "#1c4a34", icon: "mountain", iconColor: "#f3e6c8" };

interface Props {
  profile: UserProfile;
  onReloadProfile: () => void;
  onOpenSquad: (id: string) => void;
}

export default function SquadPanel({ profile, onReloadProfile, onOpenSquad }: Props) {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [mode, setMode] = useState<"none" | "create" | "join">("none");
  const [busy, setBusy] = useState(false);

  // Create form
  const [nm, setNm] = useState("");
  const [stakes, setStakes] = useState("");
  const [coat, setCoat] = useState<Coat>(DEFAULT_COAT);
  const set = (p: Partial<Coat>) => setCoat((c) => ({ ...c, ...p }));

  // Join form
  const [code, setCode] = useState("");
  const [pledged, setPledged] = useState(false);

  const loadSquad = useCallback(async () => {
    if (!profile.squadId) { setSquad(null); return; }
    try {
      const d = await fetch(`/api/squads?id=${encodeURIComponent(profile.squadId)}`).then((r) => r.json());
      setSquad(d.squad ?? null);
    } catch { /* ignore */ }
  }, [profile.squadId]);

  useEffect(() => { loadSquad(); }, [loadSquad]);

  async function create() {
    if (!nm.trim() || !stakes.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/squads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nm.trim(), stakes: stakes.trim(), coat }),
      });
      if (!res.ok) { alert("Couldn't create squad."); setBusy(false); return; }
      const d = await res.json();
      setSquad(d.squad); setMode("none"); onReloadProfile();
    } catch { alert("Couldn't create — try again."); }
    setBusy(false);
  }

  async function join() {
    if (!pledged) { alert("You must pledge to the stakes."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/squads/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, pledged }),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Couldn't join."); setBusy(false); return; }
      setSquad(d.squad); setMode("none"); setCode(""); setPledged(false); onReloadProfile();
    } catch { alert("Couldn't join — try again."); }
    setBusy(false);
  }

  async function leave() {
    if (!confirm("Leave this squad?")) return;
    setBusy(true);
    try {
      await fetch("/api/squads/leave", { method: "POST" });
      setSquad(null); onReloadProfile();
    } catch { /* ignore */ }
    setBusy(false);
  }

  // --- In a squad ---
  if (squad) {
    return (
      <div className="card" style={{ padding: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div onClick={() => onOpenSquad(squad.id)} style={{ cursor: "pointer" }}><CoatOfArms coat={squad.coat} size={56} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display" style={{ fontSize: 18 }}>{squad.name}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{squad.memberIds.length} member{squad.memberIds.length === 1 ? "" : "s"} · code <b style={{ color: "var(--ink)" }}>{squad.code}</b></div>
          </div>
        </div>
        <div className="card" style={{ padding: 10, marginTop: 12, background: "var(--tint)" }}>
          <div className="label" style={{ marginBottom: 4 }}>The Stakes — everyone pledged</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{squad.stakes}</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button className="btn" style={{ flex: 1 }} onClick={() => onOpenSquad(squad.id)}>View squad</button>
          <button className="btn ghost" style={{ flex: 1 }} disabled={busy} onClick={leave}>Leave</button>
        </div>
      </div>
    );
  }

  // --- Create ---
  if (mode === "create") {
    return (
      <div className="card" style={{ padding: 14 }}>
        <div style={{ padding: "2px 0 12px" }}><CoatOfArms coat={coat} size={90} /></div>

        <div className="label" style={{ marginBottom: 6 }}>Shape</div>
        <div className="seg" style={{ marginBottom: 10 }}>
          {SHAPES.map((s) => <button key={s} className={"chip" + (coat.shape === s ? " on" : "")} onClick={() => set({ shape: s })} style={{ textTransform: "capitalize" }}>{s}</button>)}
        </div>
        <div className="label" style={{ marginBottom: 6 }}>Division</div>
        <div className="seg" style={{ marginBottom: 10 }}>
          {DIVS.map((d) => <button key={d.k} className={"chip" + (coat.division === d.k ? " on" : "")} onClick={() => set({ division: d.k })}>{d.label}</button>)}
        </div>
        <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
          <label style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>Field 1<br /><input type="color" value={coat.field} onChange={(e) => set({ field: e.target.value })} style={{ width: "100%", height: 34 }} /></label>
          <label style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>Field 2<br /><input type="color" value={coat.field2} onChange={(e) => set({ field2: e.target.value })} style={{ width: "100%", height: 34 }} /></label>
          <label style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>Charge<br /><input type="color" value={coat.iconColor} onChange={(e) => set({ iconColor: e.target.value })} style={{ width: "100%", height: 34 }} /></label>
        </div>
        <div className="label" style={{ marginBottom: 6 }}>Charge (emblem)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6, marginBottom: 12 }}>
          {CHARGES.map((n) => (
            <button key={n} onClick={() => set({ icon: n })} style={{ aspectRatio: "1", borderRadius: 9, cursor: "pointer", border: coat.icon === n ? "2px solid var(--ink)" : "1px solid var(--line)", background: coat.icon === n ? "var(--ink)" : "var(--card)", padding: 5 }}>
              <Ico name={n} stroke={coat.icon === n ? "#fff" : "var(--muted)"} />
            </button>
          ))}
        </div>

        <div className="label" style={{ marginBottom: 6 }}>Squad name</div>
        <input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="The Ironwood Pact" />
        <div className="label" style={{ margin: "12px 0 6px" }}>The Stakes (what everyone pledges to)</div>
        <textarea rows={3} value={stakes} onChange={(e) => setStakes(e.target.value)} placeholder="No excuses. Two badges a month or you're out." />
        <div style={{ height: 14 }} />
        <button className="btn" disabled={!nm.trim() || !stakes.trim() || busy} onClick={create}>{busy ? "Creating…" : "Found the squad"}</button>
        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={() => setMode("none")}>Cancel</button>
      </div>
    );
  }

  // --- Join ---
  if (mode === "join") {
    return (
      <div className="card" style={{ padding: 14 }}>
        <div className="label" style={{ marginBottom: 6 }}>Squad invite code</div>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} style={{ textTransform: "uppercase", letterSpacing: 3, fontWeight: 800 }} />
        <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, fontSize: 13.5, cursor: "pointer" }}>
          <input type="checkbox" checked={pledged} onChange={(e) => setPledged(e.target.checked)} style={{ width: 18, height: 18 }} />
          I pledge to uphold my squad&apos;s stakes.
        </label>
        <div style={{ height: 14 }} />
        <button className="btn" disabled={code.length < 4 || !pledged || busy} onClick={join}>{busy ? "Joining…" : "Join squad"}</button>
        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={() => setMode("none")}>Cancel</button>
      </div>
    );
  }

  // --- No squad ---
  return (
    <div className="card" style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 14, marginBottom: 12 }}>Band together. Pledge to shared stakes and fly your own coat of arms.</div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => setMode("create")}>Found a squad</button>
        <button className="btn ghost" style={{ flex: 1 }} onClick={() => setMode("join")}>Join with code</button>
      </div>
    </div>
  );
}
