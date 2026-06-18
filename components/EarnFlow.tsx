"use client";
import { useState, useEffect, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import QRCode from "qrcode";
import Badge from "./Badge";
import Ico from "./Ico";
import { useCatalog } from "@/lib/catalog";
import type { Challenge, WitnessEntry, ProofEntry } from "@/lib/types";

interface Props {
  ch: Challenge;
  onCancel: () => void;
  onCommit: (
    challengeId: string,
    proofs: ProofEntry[],
    place: string,
    witnessToken: string,
    note: string,
    lat?: number,
    lng?: number,
    adminSkip?: boolean
  ) => void;
}

export default function EarnFlow({ ch, onCancel, onCommit }: Props) {
  const { isAdmin } = useCatalog();
  const media = ch.proofMedia ?? "either";
  const accept = media === "photo" ? "image/*" : media === "video" ? "video/*" : "image/*,video/*";

  // One proof per step. Falls back to a single slot if the challenge has no steps.
  const steps = (ch.how && ch.how.length > 0) ? ch.how : ["Proof of completion"];

  const [step, setStep] = useState(0);
  const [proofs, setProofs] = useState<(ProofEntry | null)[]>(() => steps.map(() => null));
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [place, setPlace] = useState("");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState("");
  const [token, setToken] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrBig, setQrBig] = useState(false);
  const [witnesses, setWitnesses] = useState<WitnessEntry[]>([]);

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

  async function pickFile(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const isVideo = f.type.startsWith("video");
    if (media === "photo" && isVideo) { alert("This step needs a photo."); return; }
    if (media === "video" && !isVideo) { alert("This step needs a video."); return; }
    setUploadingIdx(idx);
    try {
      const blob = await upload(`proofs/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" });
      setProofs((prev) => prev.map((p, i) => (i === idx ? { url: blob.url, type: isVideo ? "video" : "photo", step: steps[idx] } : p)));
    } catch {
      alert("Upload failed — try again.");
    }
    setUploadingIdx(null);
  }

  const allProofsIn = proofs.every(Boolean);

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

  function commit(adminSkip = false) {
    onCommit(ch.id, proofs.filter(Boolean) as ProofEntry[], place.trim(), token, note.trim(), lat, lng, adminSkip);
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
              Capture each step below. Every step needs its own photo or video.
            </p>
            {steps.map((s, i) => {
              const pr = proofs[i];
              return (
                <div key={i} className="card" style={{ padding: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ minWidth: 22, height: 22, borderRadius: "50%", background: pr ? "var(--green)" : "var(--tint)", color: pr ? "#fff" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{pr ? "✓" : i + 1}</span>
                    <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.4 }}>{s}</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {pr ? (
                      <div>
                        {pr.type === "video" ? <video className="proof" src={pr.url} controls playsInline /> : <img className="proof" src={pr.url} alt="proof" />}
                        <label className="btn ghost" style={{ display: "block", marginTop: 8, cursor: "pointer", textAlign: "center" }}>
                          Replace<input type="file" accept={accept} onChange={(e) => pickFile(e, i)} className="hide" />
                        </label>
                      </div>
                    ) : (
                      <label className="card" style={{ display: "block", padding: 20, textAlign: "center", cursor: "pointer", borderStyle: "dashed" }}>
                        <div style={{ width: 34, height: 34, margin: "0 auto 6px", opacity: .5 }}><Ico name="camera" stroke="#7a7367" /></div>
                        <div className="display" style={{ fontSize: 14, color: "var(--muted)" }}>{uploadingIdx === i ? "Uploading…" : "Tap to capture"}</div>
                        <input type="file" accept={accept} onChange={(e) => pickFile(e, i)} className="hide" />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
            <div style={{ height: 6 }} />
            <button className="btn" disabled={!allProofsIn || uploadingIdx !== null} onClick={() => setStep(1)}>
              {allProofsIn ? "Next" : `Capture all ${steps.length} steps`}
            </button>
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
              No badge is self-awarded. Have friends scan this QR, snap a photo of you, and they appear here.
            </p>

            {qrUrl && (
              <div className="card" style={{ padding: 16, textAlign: "center", marginBottom: 14 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="Witness QR" onClick={() => setQrBig(true)} style={{ width: 240, maxWidth: "80%", aspectRatio: "1", borderRadius: 12, background: "#fff", padding: 8, cursor: "pointer", margin: "0 auto", display: "block" }} />
                <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>Friends scan to witness · tap to enlarge</div>
              </div>
            )}

            {witnesses.length === 0 ? (
              <div className="card" style={{ padding: 18, textAlign: "center" }}>
                <div className="muted" style={{ fontSize: 13 }}>No witnesses yet — waiting for a scan…</div>
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
            <button className="btn green" disabled={witnesses.length === 0} onClick={() => commit(false)}>
              {witnesses.length === 0 ? "Waiting for a witness…" : `Post & award badge (${witnesses.length})`}
            </button>
            {isAdmin && (
              <>
                <div style={{ height: 10 }} />
                <button className="btn dark" onClick={() => commit(true)}>ADMIN SKIP WITNESS</button>
              </>
            )}
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
