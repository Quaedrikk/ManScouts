"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import QRCode from "qrcode";
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
    witnessToken: string,
    note: string,
    lat?: number,
    lng?: number
  ) => void;
}

export default function EarnFlow({ ch, onCancel, onCommit }: Props) {
  const [step, setStep] = useState(0);
  const [proofUrl, setProofUrl] = useState("");
  const [proofType, setProofType] = useState<"photo" | "video">("photo");
  const [uploading, setUploading] = useState(false);
  const [place, setPlace] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState("");
  // QR witness flow
  const [token, setToken] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [witnessName, setWitnessName] = useState("");
  const [witnessHandle, setWitnessHandle] = useState("");
  const [starting, setStarting] = useState(false);
  const confirmed = !!witnessName;
  const fileRef = useRef<HTMLInputElement>(null);

  // Create a witness session + QR when the user reaches the Witness step.
  const startWitness = useCallback(async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/witness/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: ch.id, challengeName: ch.nm }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        const link = `${window.location.origin}/witness/${data.token}`;
        setQrUrl(await QRCode.toDataURL(link, { width: 320, margin: 1 }));
      }
    } catch { /* ignore */ }
    setStarting(false);
  }, [ch.id, ch.nm]);

  useEffect(() => {
    if (step === 2 && !token && !starting) startWitness();
  }, [step, token, starting, startWitness]);

  // Poll until a signed-in friend confirms.
  useEffect(() => {
    if (step !== 2 || !token || confirmed) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/witness/status?token=${token}`);
        const d = await res.json();
        if (d.status === "confirmed") {
          setWitnessName(d.witnessName ?? "A scout");
          setWitnessHandle(d.witnessHandle ?? "");
        }
      } catch { /* ignore */ }
    }, 2500);
    return () => clearInterval(iv);
  }, [step, token, confirmed]);

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

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      alert("Location isn't available on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        // Prefill the place text with coords if the user hasn't typed a name.
        if (!place.trim()) {
          setPlace(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
        setLocating(false);
      },
      () => {
        alert("Couldn't get your location — check location permissions and try again.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function commit() {
    onCommit(ch.id, proofUrl, proofType, place.trim(), token, note.trim(), lat, lng);
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
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={useMyLocation} disabled={locating}>
              📍 {locating ? "Getting location…" : lat != null ? "Location pinned — update" : "Use my exact location"}
            </button>
            {lat != null && lng != null && (
              <div className="muted" style={{ fontSize: 12.5, marginTop: 8, textAlign: "center" }}>
                GPS logged: {lat.toFixed(5)}, {lng.toFixed(5)}
              </div>
            )}
            <div className="label" style={{ margin: "14px 0 6px" }}>Caption (optional)</div>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="How'd it go?" />
            <div style={{ height: 16 }} />
            <button className="btn" disabled={!place.trim()} onClick={() => setStep(2)}>Next</button>
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={() => setStep(0)}>Back</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: "center" }}>
            <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>
              No badge is self-awarded. Have a fellow scout scan this with their phone to vouch for it.
            </p>

            {confirmed ? (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 44, color: "var(--green)" }}>✓</div>
                <div className="display" style={{ fontSize: 20, marginTop: 6 }}>Witnessed!</div>
                <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
                  Vouched for by <b style={{ color: "var(--ink)" }}>{witnessName}</b> {witnessHandle}
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 20 }}>
                {qrUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrUrl} alt="Witness QR code" style={{ width: 220, height: 220, margin: "0 auto", display: "block", borderRadius: 12 }} />
                ) : (
                  <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }} className="muted">
                    {starting ? "Generating code…" : "Preparing…"}
                  </div>
                )}
                <div className="muted" style={{ fontSize: 13, marginTop: 12 }}>
                  Waiting for a scout to scan and confirm…
                </div>
              </div>
            )}

            <div style={{ height: 18 }} />
            <button className="btn green" disabled={!confirmed} onClick={commit}>
              {confirmed ? "Post & award badge" : "Waiting for witness…"}
            </button>
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={() => setStep(1)}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
