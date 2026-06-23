"use client";
import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { ColorPolygon } from "./ClimbBits";
import { FacilityMap } from "./FacilityMap";
import { WALLS, type ClimbColor, type FacilityBox } from "@/lib/climb";

interface Props {
  gym: string;
  facility: FacilityBox[];
  onCancel: () => void;
  onPosted: () => void;
}

export default function ClimbRecord({ gym, facility, onCancel, onPosted }: Props) {
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dur, setDur] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [color, setColor] = useState<ClimbColor | null>(null);
  const [grade, setGrade] = useState(1);
  const [wall, setWall] = useState<string>(facility[0]?.label ?? WALLS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const vref = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("video")) { alert("Record or pick a video."); return; }
    setUploading(true);
    try {
      const blob = await upload(`climbs/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" });
      setVideoUrl(blob.url);
    } catch { alert("Upload failed — try again."); }
    setUploading(false);
  }
  function scrub(s: number) { setStartSec(s); if (vref.current) vref.current.currentTime = s; }

  async function post() {
    if (!videoUrl || !color) return;
    setBusy(true);
    try {
      const res = await fetch("/api/climbing/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gym, wall, color, grade, videoUrl, startSec: Math.round(startSec), note: note.trim() }),
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
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 14px" }}>Record a climb</h2>

        {/* Video */}
        {!videoUrl ? (
          <button className="btn" disabled={uploading} onClick={() => fileRef.current?.click()}>
            🎥 {uploading ? "Uploading…" : "Record / choose video"}
          </button>
        ) : (
          <div>
            <video ref={vref} className="proof" src={videoUrl} controls playsInline preload="metadata"
              onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)} />
            <div style={{ marginTop: 10 }}>
              <div className="label" style={{ marginBottom: 4 }}>Trim to the start of your send</div>
              <input type="range" min={0} max={Math.max(0, Math.floor(dur))} step={1} value={startSec} onChange={(e) => scrub(Number(e.target.value))} style={{ width: "100%" }} />
              <div className="muted" style={{ fontSize: 12.5, textAlign: "center" }}>Starts at {Math.round(startSec)}s</div>
            </div>
            <button className="btn ghost" style={{ marginTop: 8 }} onClick={() => fileRef.current?.click()}>Replace video</button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="video/*" capture="environment" onChange={pickVideo} className="hide" />

        {/* Colour + wall side by side */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", margin: "18px 0 4px", flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 150px", textAlign: "center" }}>
            <div className="label" style={{ marginBottom: 6 }}>Route colour</div>
            <ColorPolygon value={color} onChange={setColor} size={150} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="label" style={{ marginBottom: 6 }}>Wall — {wall}</div>
            {facility.length > 0 ? (
              <FacilityMap boxes={facility} selected={wall} onSelect={setWall} height={150} />
            ) : (
              <div className="seg">{WALLS.map((w) => <button key={w} className={"chip" + (wall === w ? " on" : "")} onClick={() => setWall(w)}>{w}</button>)}</div>
            )}
          </div>
        </div>

        <div className="label" style={{ margin: "14px 0 6px" }}>Grade</div>
        <div className="seg">
          {[1, 2, 3, 4, 5, 6].map((g) => <button key={g} className={"chip" + (grade === g ? " on" : "")} style={{ flex: 1 }} onClick={() => setGrade(g)}>V{g}</button>)}
        </div>

        <div className="label" style={{ margin: "14px 0 6px" }}>Caption (optional)</div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Beta, how it felt…" />

        <div style={{ height: 16 }} />
        <button className="btn green" disabled={!videoUrl || !color || busy} onClick={post}>
          {busy ? "Posting…" : !videoUrl ? "Add a video" : !color ? "Pick a colour" : "Post climb"}
        </button>
        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
