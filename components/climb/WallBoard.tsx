"use client";
import { useRef, useState } from "react";
import Avatar from "../Avatar";
import { Hold } from "./ClimbBits";
import { HOLD_SHAPES, CLIMB_COLORS, type ClimbProfile, type ClimbWall, type WallHold, type HoldShape } from "@/lib/climb";

const WALL_BG = ["#3a4452", "#2f5d45", "#6e2b46", "#3a2f6e", "#1f1f24", "#7a4a24"];
const HSIZE = 34;

export default function WallBoard({ profile, editable, onSave }: {
  profile: ClimbProfile; editable: boolean; onSave: (wall: ClimbWall) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [holds, setHolds] = useState<WallHold[]>(profile.wall?.holds ?? []);
  const [bg, setBg] = useState(profile.wall?.bg ?? "#3a4452");
  const [color, setColor] = useState("#e0559f");
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ i: number; moved: boolean } | null>(null);

  function addHold(shape: HoldShape) { setHolds((h) => [...h, { x: 0.5, y: 0.4, type: shape, color }]); }
  function onDown(e: React.PointerEvent, i: number) {
    if (!editing) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { i, moved: false };
  }
  function onMove(e: React.PointerEvent) {
    if (!editing || !drag.current || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    drag.current.moved = true;
    const i = drag.current.i;
    setHolds((h) => h.map((hd, k) => k === i ? { ...hd, x, y } : hd));
  }
  function onUp(i: number) {
    const d = drag.current; drag.current = null;
    if (d && !d.moved && editing) setHolds((h) => h.filter((_, k) => k !== i)); // tap removes
  }
  function save() { onSave({ bg, holds }); setEditing(false); }

  return (
    <div>
      <div ref={boxRef} onPointerMove={onMove}
        style={{ position: "relative", width: "100%", height: 240, borderRadius: 20, overflow: "hidden", background: bg, color: "#fff", touchAction: "none", boxShadow: "inset 0 2px 18px rgba(0,0,0,.35)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", gap: 12, padding: 14, background: "linear-gradient(180deg,rgba(0,0,0,.3),transparent)", zIndex: 3 }}>
          <Avatar name={profile.name} handle={profile.handle} img={profile.avatarUrl} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display" style={{ fontSize: 19 }}>{profile.name}</div>
            <div style={{ fontSize: 12.5, opacity: .85 }}>{profile.handle}</div>
            {profile.bio && <div style={{ fontSize: 12.5, opacity: .85, marginTop: 2 }}>{profile.bio}</div>}
          </div>
          {editable && !editing && <button className="sashbtn" title="Edit wall" onClick={() => setEditing(true)}>✎</button>}
        </div>

        {holds.map((h, i) => (
          <div key={i} onPointerDown={(e) => onDown(e, i)} onPointerUp={() => onUp(i)}
            style={{ position: "absolute", left: `${h.x * 100}%`, top: `${h.y * 100}%`, transform: "translate(-50%,-50%)", cursor: editing ? "grab" : "default" }}>
            <Hold shape={h.type} color={h.color} size={HSIZE} />
          </div>
        ))}

        {holds.length === 0 && !editing && (
          <div style={{ position: "absolute", inset: 0, top: 60, display: "flex", alignItems: "center", justifyContent: "center", opacity: .7, fontSize: 13 }}>
            {editable ? "Tap ✎ to build your wall" : "Empty wall"}
          </div>
        )}
      </div>

      {editing && (
        <div className="card" style={{ padding: 12, marginTop: 10 }}>
          <div className="label" style={{ marginBottom: 6 }}>Hold colour</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {CLIMB_COLORS.map((c) => (
              <button key={c.key} onClick={() => setColor(c.hex)} style={{ width: 26, height: 26, borderRadius: "50%", background: c.hex, cursor: "pointer", border: color === c.hex ? "3px solid var(--ink)" : "2px solid #fff", boxShadow: "0 0 0 1px var(--line)" }} />
            ))}
          </div>
          <div className="label" style={{ marginBottom: 6 }}>Tap a hold to add it · drag to place · tap a placed hold to remove</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {HOLD_SHAPES.map((s) => (
              <button key={s} onClick={() => addHold(s)} title={s} style={{ background: "var(--tint)", border: "1px solid var(--line)", borderRadius: 10, padding: 6, cursor: "pointer" }}>
                <Hold shape={s} color={color} size={30} />
              </button>
            ))}
          </div>
          <div className="label" style={{ marginBottom: 6 }}>Wall colour</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {WALL_BG.map((b) => (
              <button key={b} onClick={() => setBg(b)} style={{ width: 30, height: 24, borderRadius: 6, background: b, cursor: "pointer", border: bg === b ? "3px solid var(--ink)" : "1px solid var(--line)" }} />
            ))}
          </div>
          <button className="btn" onClick={save}>Save wall</button>
          <div style={{ height: 8 }} />
          <button className="btn ghost" onClick={() => { setHolds(profile.wall?.holds ?? []); setBg(profile.wall?.bg ?? "#3a4452"); setEditing(false); }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
