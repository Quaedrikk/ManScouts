"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import QRCode from "qrcode";
import Badge from "./Badge";
import Ico from "./Ico";
import type { Challenge, WitnessEntry } from "@/lib/types";

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
  const media = ch.proofMedia ?? "either";
  const accept = media === "photo" ? "image/*" : media === "video" ? "video/*" : "image/*,video/*";
  const mediaLabel = media === "photo" ? "a photo" : media === "video" ? "a video" : "a photo or video";

  const [step, setStep] = useState(0);
  const [proofUrl, setProofUrl] = useState("");
  const [proofType, setProofType] = useState<"photo" | "video">("photo");
  const [uploading, setUploading] = useState(false);
  const [place, setPlace] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState("");
  const [token, setToken] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrBig, setQrBig] = useState(false);
  const [witnesses, setWitnesses] = useState<WitnessEntry[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Create a witness session + QR as soon as the challenge box opens, so
  // friends can scan it from the top-left before the challenge even starts.
  const startWitness = useCallback(async () => {
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
  }, [ch.id, ch.nm]);

  useEffect(() => { startWitness(); }, [startWitness]);

  // Poll for scanned-in witnesses the whole time the box is open.
  useEffect(() => {
    if (!token) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/witness/status?token=${token}`);
        const d = await res.json();
        if (Array.isArray(d.witnesses)) setWitnesses(d.witnesses);
      } catch { /* ignore */ }
    }, 2500);
    return () => clearInterval(iv);
  }, [token]);

  async function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const isVideo = f.type.startsWith("video");
    if (media === "photo" && isVideo) { alert("This passage needs a photo."); return; }
    if (media === "video" && !isVideo) { alert("This passage needs a video."); return; }
    setUploading(true);
    try {
      const blob = await upload(`proofs/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" });
      setProofUrl(blob.url);
      setProofType(isVideo ? "video" : "photo");
    } catch {
      alert("Upload failed — try again.");
    }
    setUploading(false);
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) { alert("Location isn't available on this device."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude); setLng(longitude);
        try {
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const d = await r.json();
          const city = d.city || d.locality || d.principalSubdivision;
          const prov = d.principalSubdivision || d.countryName;
          const label = [city, prov].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
          setPlace(label || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        } catch {
          setPlace(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
        }
        setLocating(false);
      },
      () => { alert("Couldn't get your location — check permissions and try again."); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function commit() {
    onCommit(ch.id, proofUrl, proofType, place.trim(), token, note.trim(), lat, lng);
  }

  return (
    <div className="scrim" onClick={onCancel}>
      <div className="sheet earngrand" style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <div className="grip" />

        {/* Witness QR — top-left, scannable from the start */}
        <div className="qrcorner">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="Witness QR" onClick={() => setQrBig(true)} />
          ) : (
            <div className="qrph">…</div>
          )}
          <div className="cap">Scan to<br />witness</div>
        </div>

        {/* Grand header */}
        <div style={{ textAlign: "center", marginBottom: 18, paddingTop: 6 }}>
          <div className="earnglow" />
          <div className="earnbadge-in" style={{ width: 84, height: 84, margin: "0 auto 8px", overflow: "visible" }}>
            <Badge ch={ch} size={84} />
          </div>
          <div className="label">Earning</div>
          <div className="display" style={{ fontSize: 22 }}>{ch.nm}</div>
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
              Every badge needs proof. Add {mediaLabel} of you doing it.
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
                  <Ico name="camera" stroke="#7a7367" />
                </div>
                <div className="display" style={{ fontSize: 15, color: "var(--muted)" }}>
                  {uploading ? "Uploading…" : `Tap to add ${mediaLabel}`}
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept={accept} onChange={pickFile} className="hide" />
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
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="City, Province" />
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={useMyLocation} disabled={locating}>
              📍 {locating ? "Finding your city…" : place ? "Update location" : "Use my location"}
            </button>
            {place && lat != null && (
              <div className="muted" style={{ fontSize: 12.5, marginTop: 8, textAlign: "center" }}>
                Logged: {place}
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
          <div>
            <p className="muted" style={{ fontSize: 14, margin: "0 0 14px" }}>
              No badge is self-awarded. Friends scan the QR (top-left), snap a photo of you, and they appear here.
            </p>

            {witnesses.length === 0 ? (
              <div className="card" style={{ padding: 24, textAlign: "center" }}>
                <div className="display" style={{ fontSize: 15, color: "var(--muted)" }}>No witnesses yet</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>Have a friend scan the QR in the top-left corner.</div>
              </div>
            ) : (
              witnesses.map((w) => (
                <div key={w.id} className="card" style={{ padding: 10, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  {w.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.photoUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{w.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{w.handle}</div>
                  </div>
                  <span style={{ color: "var(--green)", fontWeight: 800 }}>✓</span>
                </div>
              ))
            )}

            <div style={{ height: 18 }} />
            <button className="btn green" disabled={witnesses.length === 0} onClick={commit}>
              {witnesses.length === 0 ? "Waiting for a witness…" : `Post & award badge (${witnesses.length})`}
            </button>
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={() => setStep(1)}>Back</button>
          </div>
        )}
      </div>

      {qrBig && qrUrl && (
        <div className="scrim" style={{ alignItems: "center", zIndex: 70 }} onClick={(e) => { e.stopPropagation(); setQrBig(false); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ textAlign: "center", width: "82%", maxWidth: 360 }}>
            <div className="label" style={{ color: "#fff", marginBottom: 10 }}>Friends scan to witness</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Witness QR" style={{ width: "100%", borderRadius: 16, background: "#fff", padding: 12 }} />
            <button className="btn ghost" style={{ marginTop: 14 }} onClick={() => setQrBig(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
