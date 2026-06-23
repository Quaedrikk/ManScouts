"use client";
import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { ColorPolygon } from "./ClimbBits";
import { FacilityMap } from "./FacilityMap";
import { WALLS, HOLD_TYPES, type ClimbColor, type FacilityBox, type HoldType, type RouteHold } from "@/lib/climb";

export const HOLD_TYPE_COLOR: Record<HoldType, string> = {
  Crimp: "#e0559f", Sloper: "#2f6fe0", Pinch: "#e8b800", Jug: "#2faa50", Pocket: "#7b3fb5",
};

export default function RouteSetter({ gym, facility, onClose, onSaved }: {
  gym: string; facility: FacilityBox[]; onClose: () => void; onSaved: () => void;
}) {
  const [wall, setWall] = useState<string>(facility[0]?.label ?? WALLS[0]);
  const [color, setColor] = useState<ClimbColor | null>(null);
  const [grade, setGrade] = useState(1);
  const [setters, setSetters] = useState<string[]>([]);
  const [setterInput, setSetterInput] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [holds, setHolds] = useState<RouteHold[]>([]);
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    setUploading(true);
    try { const blob = await upload(`routes/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" }); setPhotoUrl(blob.url); }
    catch { alert("Upload failed — try again."); }
    setUploading(false);
  }
  function tapImage(e: React.MouseEvent) {
    if (!imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    setPending({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  }
  function addHold(type: HoldType) {
    if (!pending) return;
    setHolds((h) => [...h, { ...pending, type }]);
    setPending(null);
  }
  function addSetter() {
    const n = setterInput.trim(); if (!n) return;
    setSetters((s) => [...s, n]); setSetterInput("");
  }

  async function post() {
    if (!photoUrl || !color) return;
    setBusy(true);
    try {
      const res = await fetch("/api/climbing/routes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gym, wall, color, grade, setters, photoUrl, holds }),
      });
      if (!res.ok) { alert("Couldn't post route."); setBusy(false); return; }
      onSaved();
    } catch { alert("Couldn't post route."); }
    setBusy(false);
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 14px" }}>Set a route</h2>

        {/* Wall + colour */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 150px", textAlign: "center" }}>
            <div className="label" style={{ marginBottom: 6 }}>Colour</div>
            <ColorPolygon value={color} onChange={setColor} size={150} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="label" style={{ marginBottom: 6 }}>Wall — {wall}</div>
            {facility.length > 0 ? <FacilityMap boxes={facility} selected={wall} onSelect={setWall} height={150} />
              : <div className="seg">{WALLS.map((w) => <button key={w} className={"chip" + (wall === w ? " on" : "")} onClick={() => setWall(w)}>{w}</button>)}</div>}
          </div>
        </div>

        <div className="label" style={{ margin: "0 0 6px" }}>Level</div>
        <div className="seg" style={{ marginBottom: 14 }}>
          {[1, 2, 3, 4, 5, 6].map((g) => <button key={g} className={"chip" + (grade === g ? " on" : "")} style={{ flex: 1 }} onClick={() => setGrade(g)}>V{g}</button>)}
        </div>

        <div className="label" style={{ margin: "0 0 6px" }}>Setters</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          {setters.map((s, i) => (
            <span key={i} className="chip" onClick={() => setSetters((p) => p.filter((_, k) => k !== i))} style={{ cursor: "pointer" }}>{s} ✕</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input value={setterInput} onChange={(e) => setSetterInput(e.target.value)} placeholder="Add a setter name" onKeyDown={(e) => { if (e.key === "Enter") addSetter(); }} />
          <button className="btn" style={{ width: "auto", padding: "0 16px" }} onClick={addSetter}>Add</button>
        </div>

        {/* Photo + holds */}
        <div className="label" style={{ margin: "0 0 6px" }}>Route photo — tap to mark holds</div>
        {!photoUrl ? (
          <button className="btn ghost" disabled={uploading} onClick={() => fileRef.current?.click()}>📷 {uploading ? "Uploading…" : "Take / choose photo"}</button>
        ) : (
          <div ref={imgRef} onClick={tapImage} style={{ position: "relative", width: "100%", borderRadius: 16, overflow: "hidden", cursor: "crosshair" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="route" style={{ width: "100%", display: "block" }} />
            {holds.map((h, i) => (
              <span key={i} onClick={(e) => { e.stopPropagation(); setHolds((p) => p.filter((_, k) => k !== i)); }}
                title={h.type}
                style={{ position: "absolute", left: `${h.x * 100}%`, top: `${h.y * 100}%`, transform: "translate(-50%,-50%)", width: 24, height: 24, borderRadius: "50%", background: HOLD_TYPE_COLOR[h.type], border: "2px solid #fff", color: "#fff", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,.4)", cursor: "pointer" }}>
                {h.type[0]}
              </span>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} className="hide" />
        {photoUrl && <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => fileRef.current?.click()}>Replace photo</button>}

        <div style={{ height: 16 }} />
        <button className="btn green" disabled={!photoUrl || !color || busy} onClick={post}>
          {busy ? "Posting…" : !photoUrl ? "Add a photo" : !color ? "Pick a colour" : "Post route"}
        </button>
        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={onClose}>Cancel</button>

        {/* Hold-type chooser */}
        {pending && (
          <div className="scrim" style={{ alignItems: "center", zIndex: 70 }} onClick={() => setPending(null)}>
            <div className="sheet" style={{ borderRadius: 24, maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
              <div className="grip" />
              <div className="label" style={{ textAlign: "center", marginBottom: 10 }}>What kind of hold?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {HOLD_TYPES.map((t) => (
                  <button key={t} className="btn" style={{ background: HOLD_TYPE_COLOR[t], boxShadow: "none" }} onClick={() => addHold(t)}>{t}</button>
                ))}
              </div>
              <div style={{ height: 10 }} />
              <button className="btn ghost" onClick={() => setPending(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
