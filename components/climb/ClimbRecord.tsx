"use client";
import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { ColorPolygon } from "./ClimbBits";
import { WALLS, type ClimbColor } from "@/lib/climb";

interface Props {
  gym: string;
  onCancel: () => void;
  onPosted: () => void;
}

export default function ClimbRecord({ gym, onCancel, onPosted }: Props) {
  const [step, setStep] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dur, setDur] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [color, setColor] = useState<ClimbColor | null>(null);
  const [grade, setGrade] = useState(1);
  const [wall, setWall] = useState<string>(WALLS[0]);
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
      setStep(1);
    } catch { alert("Upload failed — try again."); }
    setUploading(false);
  }

  function scrub(s: number) {
    setStartSec(s);
    if (vref.current) vref.current.currentTime = s;
  }

  async function post() {
    if (!color) return;
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
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 4px" }}>Record a climb</h2>
        <div className="seg" style={{ marginBottom: 16 }}>
          {["Video", "Trim", "Details"].map((s, i) => (
            <span key={s} className={"chip" + (step === i ? " on" : "")} style={{ flex: 1, textAlign: "center" }}>{i + 1} {s}</span>
          ))}
        </div>

        {step === 0 && (
          <div>
            <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>Film your send, top to bottom.</p>
            <button className="btn" disabled={uploading} onClick={() => fileRef.current?.click()}>
              🎥 {uploading ? "Uploading…" : "Record / choose video"}
            </button>
            <input ref={fileRef} type="file" accept="video/*" capture="environment" onChange={pickVideo} className="hide" />
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={onCancel}>Cancel</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="muted" style={{ fontSize: 14, margin: "0 0 10px" }}>Drag to the start of your successful climb.</p>
            <video ref={vref} className="proof" src={videoUrl} controls playsInline preload="metadata"
              onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)} />
            <div style={{ marginTop: 12 }}>
              <input type="range" min={0} max={Math.max(0, Math.floor(dur))} step={1} value={startSec}
                onChange={(e) => scrub(Number(e.target.value))} style={{ width: "100%" }} />
              <div className="muted" style={{ fontSize: 12.5, textAlign: "center" }}>Starts at {Math.round(startSec)}s</div>
            </div>
            <div style={{ height: 14 }} />
            <button className="btn" onClick={() => setStep(2)}>Next</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={() => setStep(0)}>Back</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="label" style={{ textAlign: "center", marginBottom: 6 }}>Route colour</div>
            <ColorPolygon value={color} onChange={setColor} />
            <div className="label" style={{ margin: "14px 0 6px" }}>Grade</div>
            <div className="seg">
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <button key={g} className={"chip" + (grade === g ? " on" : "")} style={{ flex: 1 }} onClick={() => setGrade(g)}>V{g}</button>
              ))}
            </div>
            <div className="label" style={{ margin: "14px 0 6px" }}>Wall</div>
            <div className="seg">
              {WALLS.map((w) => (
                <button key={w} className={"chip" + (wall === w ? " on" : "")} onClick={() => setWall(w)}>{w}</button>
              ))}
            </div>
            <div className="label" style={{ margin: "14px 0 6px" }}>Caption (optional)</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Beta, how it felt…" />
            <div style={{ height: 16 }} />
            <button className="btn green" disabled={!color || busy} onClick={post}>{busy ? "Posting…" : color ? "Post climb" : "Pick a colour"}</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={() => setStep(1)}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
