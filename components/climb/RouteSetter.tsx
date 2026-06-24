"use client";
import { useState, useRef, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { FacilityMap } from "./FacilityMap";
import { RouteHoldsLayer, HOLD_TYPE_COLOR } from "./HoldCallout";
import CIcon from "./ClimbIcons";
import { WALLS, HOLD_TYPES, CLIMB_COLORS, colorHex, type ClimbColor, type FacilityBox, type HoldType, type RouteHold, type ClimbUserLite } from "@/lib/climb";

export { HOLD_TYPE_COLOR };

export default function RouteSetter({ gym, facility, meName, onClose, onSaved }: {
  gym: string; facility: FacilityBox[]; meName: string; onClose: () => void; onSaved: () => void;
}) {
  const [wall, setWall] = useState<string>(facility[0]?.label ?? WALLS[0]);
  const [color, setColor] = useState<ClimbColor | null>(null);
  const [grade, setGrade] = useState<number>(1); // 0 = Unrated
  const [setters, setSetters] = useState<string[]>([meName]);
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<ClimbUserLite[]>([]);
  useEffect(() => { fetch("/api/climbing/users").then((r) => r.json()).then((d) => setUsers(d.users ?? [])).catch(() => {}); }, []);
  const matches = q.trim() ? users.filter((u) => !setters.includes(u.name) && (u.name.toLowerCase().includes(q.toLowerCase()) || u.handle.toLowerCase().includes(q.toLowerCase()))).slice(0, 6) : [];
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [holds, setHolds] = useState<RouteHold[]>([]);
  const [showText, setShowText] = useState(true);
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

        {/* Photo + holds — at the top */}
        <div className="label" style={{ margin: "0 0 6px" }}>Route photo — tap to mark holds</div>
        {!photoUrl ? (
          <button className="btn ghost" disabled={uploading} onClick={() => fileRef.current?.click()}>
            <CIcon name="camera" size={17} style={{ display: "inline-block", verticalAlign: "-3px", marginRight: 7 }} />{uploading ? "Uploading…" : "Take / choose photo"}
          </button>
        ) : (
          <div ref={imgRef} onClick={tapImage} style={{ position: "relative", width: "100%", borderRadius: 16, overflow: "hidden", cursor: "crosshair" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="route" style={{ width: "100%", display: "block" }} />
            <button onClick={(e) => { e.stopPropagation(); setShowText((s) => !s); }}
              style={{ position: "absolute", top: 8, right: 8, zIndex: 6, border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 11px", fontSize: 12, fontWeight: 800, color: "#fff", background: "rgba(20,16,12,.7)", backdropFilter: "blur(4px)" }}>
              {showText ? "Hide holds text" : "Show holds text"}
            </button>
            <RouteHoldsLayer containerRef={imgRef} holds={holds} color={color ? colorHex(color) : "#888"} showText={showText}
              onMoveLabel={(i, lx, ly) => setHolds((p) => p.map((h, k) => k === i ? { ...h, lx, ly } : h))}
              onRemove={(i) => setHolds((p) => p.filter((_, k) => k !== i))} />
            {pending && (
              <>
                <div style={{ position: "absolute", left: `${pending.x * 100}%`, top: `${pending.y * 100}%`, transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", border: "2.5px solid #fff", boxShadow: "0 0 0 2px rgba(0,0,0,.4)", pointerEvents: "none" }} />
                <div onClick={(e) => e.stopPropagation()}
                  style={{ position: "absolute", left: `${Math.min(0.8, Math.max(0.2, pending.x)) * 100}%`, top: `${pending.y * 100}%`, transform: `translate(-50%, ${pending.y > 0.5 ? "calc(-100% - 16px)" : "16px"})`, zIndex: 5, display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", maxWidth: 220, padding: 7, borderRadius: 12, background: "rgba(20,16,12,.82)", backdropFilter: "blur(6px)", boxShadow: "0 6px 18px rgba(0,0,0,.4)" }}>
                  {HOLD_TYPES.map((t) => (
                    <button key={t} onClick={() => addHold(t)} style={{ border: "none", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 12, padding: "6px 10px", borderRadius: 999, background: HOLD_TYPE_COLOR[t] }}>{t}</button>
                  ))}
                  <button onClick={() => setPending(null)} style={{ border: "none", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 12, padding: "6px 9px", borderRadius: 999, background: "rgba(255,255,255,.2)", display: "inline-flex", alignItems: "center" }}><CIcon name="x" size={13} /></button>
                </div>
              </>
            )}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} className="hide" />
        {photoUrl && <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => fileRef.current?.click()}>Replace photo</button>}

        {/* Colour */}
        <div className="label" style={{ margin: "16px 0 8px" }}>Colour</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {CLIMB_COLORS.map((c) => (
            <button key={c.key} onClick={() => setColor(c.key)} title={c.key}
              style={{ width: 34, height: 34, borderRadius: "50%", background: c.hex, cursor: "pointer",
                border: color === c.key ? "3px solid var(--ink)" : "2px solid #fff",
                boxShadow: color === c.key ? "0 0 0 2px var(--ink)" : "0 0 0 1px var(--line)", transition: "transform .1s" }} />
          ))}
        </div>

        {/* Wall */}
        <div className="label" style={{ margin: "16px 0 6px" }}>Wall — {wall}</div>
        {facility.length > 0 ? <FacilityMap boxes={facility} selected={wall} onSelect={setWall} height={150} />
          : <div className="seg">{WALLS.map((w) => <button key={w} className={"chip" + (wall === w ? " on" : "")} onClick={() => setWall(w)}>{w}</button>)}</div>}

        {/* Level + Unrated */}
        <div className="label" style={{ margin: "16px 0 6px" }}>Level</div>
        <div className="seg" style={{ marginBottom: 6 }}>
          {[1, 2, 3, 4, 5, 6].map((g) => <button key={g} className={"chip" + (grade === g ? " on" : "")} style={{ flex: 1 }} onClick={() => setGrade(g)}>V{g}</button>)}
        </div>
        <button className={"chip" + (grade === 0 ? " on" : "")} style={{ width: "100%" }} onClick={() => setGrade(0)}>Unrated — let climbers suggest the grade</button>

        {/* Setters */}
        <div className="label" style={{ margin: "16px 0 6px" }}>Setters</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
          {setters.map((s, i) => (
            <span key={i} className="chip" onClick={() => i > 0 && setSetters((p) => p.filter((_, k) => k !== i))} style={{ cursor: i > 0 ? "pointer" : "default" }}>{s}{i === 0 ? " · you" : " ✕"}</span>
          ))}
        </div>
        <div style={{ position: "relative", marginBottom: 14, zIndex: 4 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tag another setter…" />
          {matches.length > 0 && (
            <div className="ddmenu">
              {matches.map((u) => (
                <button key={u.id} className="ddopt" onClick={() => { setSetters((s) => [...s, u.name]); setQ(""); }}>{u.name} <span className="muted" style={{ marginLeft: 6 }}>{u.handle}</span></button>
              ))}
            </div>
          )}
        </div>

        <button className="btn green" disabled={!photoUrl || !color || busy} onClick={post}>
          {busy ? "Posting…" : !photoUrl ? "Add a photo" : !color ? "Pick a colour" : "Post route"}
        </button>
        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
