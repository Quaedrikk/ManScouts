"use client";
import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import Badge from "./Badge";
import Ico from "./Ico";
import type { Challenge } from "@/lib/types";

interface Props {
  ch: Challenge;
  onCancel: () => void;
  onCommit: (
    challengeId: string,
    proofUrl: string,
    proofType: "photo" | "video",
    place: string,
    witnessName: string,
    witnessHandle: string,
    note: string
  ) => void;
}

export default function EarnFlow({ ch, onCancel, onCommit }: Props) {
  const [step, setStep] = useState(0);
  const [proofUrl, setProofUrl] = useState("");
  const [proofType, setProofType] = useState<"photo" | "video">("photo");
  const [uploading, setUploading] = useState(false);
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [wn, setWn] = useState("");
  const [wh, setWh] = useState("");
  const [witnessed, setWitnessed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const blob = await upload(`proofs/${f.name}`, f, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setProofUrl(blob.url);
      setProofType(f.type.startsWith("video") ? "video" : "photo");
    } catch {
      alert("Upload failed — try again.");
    }
    setUploading(false);
  }

  function commit() {
    onCommit(
      ch.id, proofUrl, proofType, place.trim(),
      wn.trim(),
      wh.trim() ? (wh.startsWith("@") ? wh : "@" + wh) : "",
      note.trim()
    );
  }

  return (
    <div className="scrim" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Badge ch={ch} size={50} />
          <div>
            <div className="label">Earning</div>
            <div className="display" style={{ fontSize: 19 }}>{ch.nm}</div>
          </div>
        </div>
        <div className="seg" style={{ marginBottom: 18 }}>
          {["Proof", "Place", "Witness"].map((s, i) => (
            <span key={s} className={"chip" + (step === i ? " on" : "")} style={{ flex: 1, textAlign: "center" }}>
              {i + 1} {s}
            </span>
          ))}
        </div>

        {step === 0 && (
          <div>
            <p className="muted" style={{ fontSize: 14, margin: "0 0 12px" }}>
              Every badge needs proof. Add a photo or video of you doing it.
            </p>
            {proofUrl ? (
              <div className="card" style={{ padding: 8 }}>
                {proofType === "video"
                  ? <video className="proof" src={proofUrl} controls playsInline />
                  : <img className="proof" src={proofUrl} alt="proof" />}
                <div className="muted" style={{ textAlign: "center", fontSize: 12.5, marginTop: 6 }}>
                  {proofType === "video" ? "Video uploaded" : "Photo uploaded"}
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                className="card"
                style={{ padding: 38, textAlign: "center", cursor: "pointer", borderStyle: "dashed" }}
              >
                <div style={{ width: 46, height: 46, margin: "0 auto 10px", opacity: .5 }}>
                  <Ico name="board" stroke="#7a7367" />
                </div>
                <div className="display" style={{ fontSize: 15, color: "var(--muted)" }}>
                  {uploading ? "Uploading…" : "Tap to add proof"}
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={pickFile} className="hide" />
            <div style={{ height: 14 }} />
            {proofUrl && (
              <>
                <button className="btn ghost" onClick={() => fileRef.current?.click()}>Replace</button>
                <div style={{ height: 10 }} />
              </>
            )}
            <button className="btn" disabled={!proofUrl || uploading} onClick={() => setStep(1)}>Next</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Where?</div>
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Mount Tamalpais, CA" />
            <div className="label" style={{ margin: "14px 0 6px" }}>Caption (optional)</div>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="How'd it go?" />
            <div style={{ height: 16 }} />
            <button className="btn" disabled={!place.trim()} onClick={() => setStep(2)}>Next</button>
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={() => setStep(0)}>Back</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="muted" style={{ fontSize: 14, margin: "0 0 12px" }}>
              No badge is self-awarded. A fellow scout has to vouch for it.
            </p>
            <div className="label" style={{ marginBottom: 6 }}>Witness name</div>
            <input value={wn} onChange={(e) => setWn(e.target.value)} placeholder="Who saw you do it?" />
            <div className="label" style={{ margin: "12px 0 6px" }}>Their handle (optional)</div>
            <input value={wh} onChange={(e) => setWh(e.target.value)} placeholder="@theirhandle" />
            <div
              onClick={() => wn.trim() && setWitnessed(!witnessed)}
              style={{
                marginTop: 16, display: "flex", alignItems: "center", gap: 12, padding: 14,
                borderRadius: 14, border: "1.5px solid var(--line)",
                background: witnessed ? "var(--green)" : "var(--card)",
                color: witnessed ? "#fff" : "var(--ink)",
                cursor: wn.trim() ? "pointer" : "default",
                opacity: wn.trim() ? 1 : .5,
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: 7, border: "2px solid currentColor",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
              }}>{witnessed ? "✓" : ""}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{wn.trim() || "Witness"} saw this and vouches for it.</span>
            </div>
            <div style={{ height: 18 }} />
            <button className="btn green" disabled={!(wn.trim() && witnessed)} onClick={commit}>
              Post &amp; award badge
            </button>
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={() => setStep(1)}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
