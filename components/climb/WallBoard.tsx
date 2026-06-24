"use client";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import Avatar from "../Avatar";
import { Hold } from "./ClimbBits";
import CIcon from "./ClimbIcons";
import { HOLD_SHAPES, CLIMB_COLORS, WALL_DESIGNS, isWallDesign, type ClimbProfile, type ClimbWall, type WallHold, type HoldShape } from "@/lib/climb";

const isWallImage = (bg?: string) => !!bg && /^https?:/.test(bg);

const WALL_BG = ["#5a5048", "#3a4452", "#2f5d45", "#6e2b46", "#3a2f6e", "#1f1f24", "#7a4a24"];
const HSIZE = 34;

// Speckled, rock-like texture for a solid wall colour.
function rockTexture(hex: string): React.CSSProperties {
  return {
    backgroundColor: hex,
    backgroundImage: [
      `radial-gradient(circle at 18% 22%, color-mix(in srgb, ${hex} 55%, #000) 0 5px, transparent 6px)`,
      `radial-gradient(circle at 72% 35%, color-mix(in srgb, ${hex} 72%, #fff) 0 3px, transparent 4px)`,
      `radial-gradient(circle at 40% 72%, color-mix(in srgb, ${hex} 50%, #000) 0 6px, transparent 7px)`,
      `radial-gradient(circle at 86% 80%, color-mix(in srgb, ${hex} 70%, #fff) 0 2.5px, transparent 3.5px)`,
      `radial-gradient(circle at 55% 14%, color-mix(in srgb, ${hex} 60%, #000) 0 3px, transparent 4px)`,
    ].join(", "),
    backgroundSize: "64px 64px, 82px 82px, 72px 72px, 56px 56px, 94px 94px",
  };
}

export default function WallBoard({ profile, editable, onSave, onEditProfile }: {
  profile: ClimbProfile; editable: boolean; onSave: (wall: ClimbWall) => void; onEditProfile?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState(false);
  const [holds, setHolds] = useState<WallHold[]>(profile.wall?.holds ?? []);
  const [bg, setBg] = useState(profile.wall?.bg ?? "#3a4452");
  const [color, setColor] = useState("#e0559f");
  const [sel, setSel] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ i: number; mode: "move" | "resize" | "rotate" } | null>(null);

  async function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    setUploading(true);
    try { const blob = await upload(`walls/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" }); setBg(blob.url); } catch { /* */ }
    setUploading(false);
  }

  function addHold(shape: HoldShape) { setHolds((h) => { setSel(h.length); return [...h, { x: 0.5, y: 0.4, type: shape, color, rot: 0, size: HSIZE }]; }); }

  function startDrag(e: React.PointerEvent, i: number, mode: "move" | "resize" | "rotate") {
    if (!editing) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSel(i);
    drag.current = { i, mode };
  }
  function onMove(e: React.PointerEvent) {
    if (!editing || !drag.current || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    const { i, mode } = drag.current;
    if (mode === "move") {
      const x = Math.min(1, Math.max(0, px / r.width));
      const y = Math.min(1, Math.max(0, py / r.height));
      setHolds((h) => h.map((hd, k) => k === i ? { ...hd, x, y } : hd));
      return;
    }
    setHolds((h) => h.map((hd, k) => {
      if (k !== i) return hd;
      const cx = hd.x * r.width, cy = hd.y * r.height;
      const dist = Math.hypot(px - cx, py - cy);
      if (mode === "resize") return { ...hd, size: Math.round(Math.max(18, Math.min(120, dist * 1.414))) };
      let deg = Math.atan2(py - cy, px - cx) * 180 / Math.PI + 90;
      deg = Math.round(((deg % 360) + 360) % 360);
      return { ...hd, rot: deg };
    }));
  }
  function onUp() { drag.current = null; }
  function removeSel() { if (sel === null) return; setHolds((h) => h.filter((_, k) => k !== sel)); setSel(null); }
  function save() { onSave({ bg, holds }); setEditing(false); setSel(null); }

  const image = isWallImage(bg);
  const design = !image && isWallDesign(bg);
  const boardStyle: React.CSSProperties = image
    ? { backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }
    : design ? {} : rockTexture(bg);

  return (
    <div>
      <div ref={boxRef} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        className={"wallbg" + (design ? ` wd-${bg}` : "")}
        style={{ position: "relative", width: "100%", height: 240, borderRadius: 20, overflow: "hidden", color: "#fff", touchAction: "none", boxShadow: "inset 0 2px 18px rgba(0,0,0,.35)", ...boardStyle }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", gap: 12, padding: 14, background: "linear-gradient(180deg,rgba(0,0,0,.34),transparent)", zIndex: 3 }}>
          <Avatar name={profile.name} handle={profile.handle} img={profile.avatarUrl} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="display" style={{ fontSize: 19 }}>{profile.name}</div>
            <div style={{ fontSize: 12.5, opacity: .85 }}>{profile.handle}</div>
            {profile.bio && <div style={{ fontSize: 12.5, opacity: .85, marginTop: 2 }}>{profile.bio}</div>}
          </div>
          {editable && !editing && (
            <div style={{ position: "relative" }}>
              <button className="sashbtn" title="Edit" onClick={() => setMenu((m) => !m)}><CIcon name="pencil" size={15} /></button>
              {menu && (
                <div className="ddmenu pop" style={{ left: "auto", right: 0, minWidth: 150 }}>
                  <button className="ddopt" onClick={() => { setMenu(false); onEditProfile?.(); }}><CIcon name="user" size={15} style={{ marginRight: 8 }} /> Edit profile</button>
                  <button className="ddopt" onClick={() => { setMenu(false); setEditing(true); }}><CIcon name="climbs" size={15} style={{ marginRight: 8 }} /> Edit wall</button>
                </div>
              )}
            </div>
          )}
        </div>

        {holds.map((h, i) => (
          <div key={i} onPointerDown={(e) => startDrag(e, i, "move")}
            style={{ position: "absolute", left: `${h.x * 100}%`, top: `${h.y * 100}%`, transform: `translate(-50%,-50%) rotate(${h.rot ?? 0}deg)`, cursor: editing ? "grab" : "default", touchAction: "none" }}>
            <Hold shape={h.type} color={h.color} size={h.size ?? HSIZE} />
          </div>
        ))}

        {/* Transform box around the selected hold (move / resize / rotate) */}
        {editing && sel !== null && holds[sel] && (() => {
          const h = holds[sel]; const s = (h.size ?? HSIZE) + 16;
          return (
            <div style={{ position: "absolute", left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: s, height: s, transform: `translate(-50%,-50%) rotate(${h.rot ?? 0}deg)`, pointerEvents: "none", zIndex: 6 }}>
              <div style={{ position: "absolute", inset: 0, border: "1.5px solid #fff", borderRadius: 6, boxShadow: "0 0 0 1px rgba(0,0,0,.35)" }} />
              {/* delete handle (top-left corner) */}
              <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); removeSel(); }} title="Delete hold"
                style={{ position: "absolute", left: -9, top: -9, width: 18, height: 18, borderRadius: "50%", border: "none", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", pointerEvents: "auto", boxShadow: "0 1px 4px rgba(0,0,0,.4)" }}>
                <CIcon name="x" size={11} stroke={3} />
              </button>
              {/* rotate handle */}
              <div style={{ position: "absolute", left: "50%", top: -24, width: 1.5, height: 24, background: "#fff", transform: "translateX(-50%)" }} />
              <div onPointerDown={(e) => startDrag(e, sel, "rotate")} title="Rotate"
                style={{ position: "absolute", left: "50%", top: -32, width: 16, height: 16, marginLeft: -8, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.4)", cursor: "grab", pointerEvents: "auto", touchAction: "none" }} />
              {/* resize handle (bottom-right corner) */}
              <div onPointerDown={(e) => startDrag(e, sel, "resize")} title="Resize"
                style={{ position: "absolute", right: -8, bottom: -8, width: 16, height: 16, borderRadius: 4, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.4)", cursor: "nwse-resize", pointerEvents: "auto", touchAction: "none" }} />
            </div>
          );
        })()}

        {holds.length === 0 && !editing && (
          <div style={{ position: "absolute", inset: 0, top: 60, display: "flex", alignItems: "center", justifyContent: "center", opacity: .7, fontSize: 13 }}>
            {editable ? "Tap the pencil to build your wall" : "Empty wall"}
          </div>
        )}
      </div>

      {editing && (
        <div className="card" style={{ padding: 12, marginTop: 10 }}>
          {sel !== null && holds[sel] && (
            <div className="card" style={{ padding: 12, marginBottom: 12, background: "var(--tint)", border: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div className="muted" style={{ fontSize: 12.5 }}>Drag the <b>corner</b> to resize · the <b>top dot</b> to rotate</div>
              <button className="chip" style={{ color: "var(--accent-d)", display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }} onClick={removeSel}><CIcon name="x" size={13} /> Remove</button>
            </div>
          )}

          <div className="label" style={{ marginBottom: 6 }}>Hold colour</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {CLIMB_COLORS.map((c) => (
              <button key={c.key} onClick={() => setColor(c.hex)} style={{ width: 26, height: 26, borderRadius: "50%", background: c.hex, cursor: "pointer", border: color === c.hex ? "3px solid var(--ink)" : "2px solid #fff", boxShadow: "0 0 0 1px var(--line)" }} />
            ))}
          </div>
          <div className="label" style={{ marginBottom: 6 }}>Tap a hold shape to add · drag to place · tap a placed hold to rotate / remove</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            {HOLD_SHAPES.map((s) => (
              <button key={s} onClick={() => addHold(s)} title={s} style={{ background: "var(--tint)", border: "1px solid var(--line)", borderRadius: 10, padding: 6, cursor: "pointer" }}>
                <Hold shape={s} color={color} size={30} />
              </button>
            ))}
          </div>

          <div className="label" style={{ marginBottom: 6 }}>Animated wall designs</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {WALL_DESIGNS.map((d) => (
              <button key={d.key} onClick={() => setBg(d.key)} title={d.label}
                className={`wallbg wd-${d.key}`}
                style={{ width: 46, height: 34, borderRadius: 8, cursor: "pointer", border: bg === d.key ? "3px solid var(--ink)" : "1px solid var(--line)", overflow: "hidden" }} />
            ))}
          </div>

          <div className="label" style={{ marginBottom: 6 }}>Rock colours</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {WALL_BG.map((b) => (
              <button key={b} onClick={() => setBg(b)} style={{ width: 34, height: 28, borderRadius: 6, cursor: "pointer", border: bg === b ? "3px solid var(--ink)" : "1px solid var(--line)", ...rockTexture(b) }} />
            ))}
          </div>

          <div className="label" style={{ marginBottom: 6 }}>Cover photo</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className={image ? "wallbg" : undefined}
              style={{ width: 46, height: 34, borderRadius: 8, cursor: "pointer", border: image ? "3px solid var(--ink)" : "2px dashed var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: image ? "#fff" : "var(--muted)", ...(image ? { backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "var(--tint)" }) }}>
              {!image && <CIcon name="camera" size={18} />}
            </button>
            <span className="muted" style={{ fontSize: 13 }}>{uploading ? "Uploading…" : image ? "Change cover photo" : "Upload your own background"}</span>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickCover} className="hide" />
          </div>

          <button className="btn" onClick={save}>Save wall</button>
          <div style={{ height: 8 }} />
          <button className="btn ghost" onClick={() => { setHolds(profile.wall?.holds ?? []); setBg(profile.wall?.bg ?? "#3a4452"); setEditing(false); setSel(null); }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
