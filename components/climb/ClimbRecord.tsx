"use client";
import { useState, useRef, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { colorHex, type Route } from "@/lib/climb";

interface Props {
  gym: string;
  onCancel: () => void;
  onPosted: () => void;
  onCreateRoute: () => void;
  preselected?: Route | null;
}

type Visibility = "everyone" | "followers" | "me";

export default function ClimbRecord({ gym, onCancel, onPosted, onCreateRoute, preselected }: Props) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [q, setQ] = useState("");
  const [route, setRoute] = useState<Route | null>(preselected ?? null);
  const [visibility, setVisibility] = useState<Visibility>("everyone");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dur, setDur] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const vref = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch(`/api/climbing/routes?gym=${encodeURIComponent(gym)}`).then((r) => r.json()).then((d) => setRoutes(d.routes ?? [])).catch(() => {}); }, [gym]);

  const matches = routes.filter((r) => {
    const s = `${r.color} v${r.grade} ${r.wall}`.toLowerCase();
    return q.trim().toLowerCase().split(/\s+/).every((t) => s.includes(t));
  });

  async function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    if (!f.type.startsWith("video")) { alert("Record or pick a video."); return; }
    setUploading(true);
    try { const blob = await upload(`climbs/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" }); setVideoUrl(blob.url); }
    catch { alert("Upload failed — try again."); }
    setUploading(false);
  }
  function scrub(s: number) { setStartSec(s); if (vref.current) vref.current.currentTime = s; }

  async function post() {
    if (!route || !videoUrl) return;
    setBusy(true);
    try {
      const res = await fetch("/api/climbing/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gym, wall: route.wall, routeId: route.id, color: route.color, grade: route.grade, videoUrl, startSec: Math.round(startSec), note: note.trim(), visibility }),
      });
      if (!res.ok) { alert("Couldn't post — try again."); setBusy(false); return; }
      onPosted();
    } catch { alert("Couldn't post — try again."); }
    setBusy(false);
  }

  return (
    <div className="scrim" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 12px" }}>Record a climb</h2>

        {!route ? (
          <>
            <div className="label" style={{ marginBottom: 6 }}>Which route did you climb?</div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search e.g. "green V4"' />
            <div style={{ height: 10 }} />
            {matches.length === 0 && <p className="muted" style={{ fontSize: 13, textAlign: "center", padding: 8 }}>No routes match. Set one first.</p>}
            {matches.map((r) => (
              <button key={r.id} className="card" onClick={() => setRoute(r)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 10, marginBottom: 8, cursor: "pointer", border: "1px solid var(--line)", textAlign: "left" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.photoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{r.wall}</div>
                  <div className="muted" style={{ fontSize: 12 }}>set by {r.setters.join(", ")}</div>
                </div>
                <span className="chip" style={{ background: colorHex(r.color), color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.4)" }}>V{r.grade}</span>
              </button>
            ))}
            <div style={{ height: 6 }} />
            <button className="btn" onClick={onCreateRoute}>+ Create new route</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={onCancel}>Cancel</button>
          </>
        ) : (
          <>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={route.photoUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14 }}>{route.wall}</div></div>
              <span className="chip" style={{ background: colorHex(route.color), color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.4)" }}>V{route.grade}</span>
              <button className="chip" onClick={() => { setRoute(null); setVideoUrl(""); }}>Change</button>
            </div>

            {!videoUrl ? (
              <button className="btn" disabled={uploading} onClick={() => fileRef.current?.click()}>🎥 {uploading ? "Uploading…" : "Record / choose video"}</button>
            ) : (
              <div>
                <video ref={vref} className="proof" src={videoUrl} controls playsInline preload="metadata" onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)} />
                <div style={{ marginTop: 10 }}>
                  <div className="label" style={{ marginBottom: 4 }}>Trim to the start of your send</div>
                  <input type="range" min={0} max={Math.max(0, Math.floor(dur))} step={1} value={startSec} onChange={(e) => scrub(Number(e.target.value))} style={{ width: "100%" }} />
                  <div className="muted" style={{ fontSize: 12.5, textAlign: "center" }}>Starts at {Math.round(startSec)}s</div>
                </div>
                <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => fileRef.current?.click()}>Replace video</button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="video/*" capture="environment" onChange={pickVideo} className="hide" />

            <div className="label" style={{ margin: "14px 0 6px" }}>Caption (optional)</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Beta, how it felt…" />

            <div className="label" style={{ margin: "14px 0 6px" }}>Who can see this?</div>
            <div className="seg">
              {([["everyone", "🌎 Everyone"], ["followers", "👥 Followers Only"], ["me", "🔒 Only Me"]] as [Visibility, string][]).map(([v, lbl]) => (
                <button key={v} className={"chip" + (visibility === v ? " on" : "")} style={{ flex: 1 }} onClick={() => setVisibility(v)}>{lbl}</button>
              ))}
            </div>

            <div style={{ height: 16 }} />
            <button className="btn green" disabled={!videoUrl || busy} onClick={post}>{busy ? "Posting…" : videoUrl ? "Post climb" : "Add a video"}</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={onCancel}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
