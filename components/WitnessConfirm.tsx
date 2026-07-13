"use client";
import { useEffect, useState, useRef } from "react";
import { BASE_PATH } from "@/lib/basePath";
import { useSession, signIn } from "next-auth/react";
import { upload } from "@vercel/blob/client";

interface Status {
  found: boolean;
  earnerName?: string;
  challengeName?: string;
}

export default function WitnessConfirm({ token }: { token: string }) {
  const { status: authStatus } = useSession();
  const [info, setInfo] = useState<Status | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const camRef = useRef<HTMLInputElement>(null);

  async function takePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const blob = await upload(`witness/${f.name}`, f, { access: "public", handleUploadUrl: `${BASE_PATH}/api/upload` });
      setPhotoUrl(blob.url);
    } catch { setError("Photo upload failed — try again."); }
    setUploading(false);
  }

  useEffect(() => {
    fetch(`${BASE_PATH}/api/witness/status?token=${token}`)
      .then((r) => r.json())
      .then((d) => setInfo(d))
      .catch(() => setInfo({ found: false }));
  }, [token]);

  async function confirm() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${BASE_PATH}/api/witness/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, witnessPhotoUrl: photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Couldn't verify."); setSubmitting(false); return; }
      setDone(true);
    } catch {
      setError("Couldn't verify — try again.");
    }
    setSubmitting(false);
  }

  const wrap: React.CSSProperties = {
    minHeight: "100dvh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center",
  };

  if (info === null) return <div style={wrap} className="display muted">Loading…</div>;

  if (!info.found) {
    return (
      <div style={wrap}>
        <h1 className="display" style={{ fontSize: 24 }}>Link expired</h1>
        <p className="muted" style={{ marginTop: 8 }}>This witness request is no longer valid. Ask your friend for a fresh QR.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={wrap}>
        <div style={{ fontSize: 54 }}>✓</div>
        <h1 className="display" style={{ fontSize: 26, marginTop: 8 }}>Verified!</h1>
        <p className="muted" style={{ marginTop: 8, maxWidth: 300 }}>
          You vouched for <b>{info.earnerName}</b> earning <b>{info.challengeName}</b>. You can head back to them now.
        </p>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div className="pill" style={{ marginBottom: 14 }}>Witness request</div>
      <h1 className="display" style={{ fontSize: 26, maxWidth: 320 }}>
        Vouch for {info.earnerName}
      </h1>
      <p className="muted" style={{ marginTop: 10, maxWidth: 320, fontSize: 15 }}>
        They say they earned <b style={{ color: "var(--ink)" }}>{info.challengeName}</b>. Only confirm if you actually saw them do it.
      </p>
      <div style={{ height: 24 }} />
      {authStatus === "authenticated" ? (
        <>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="witness proof" style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 16, margin: "0 auto 14px", display: "block" }} />
          ) : (
            <button
              className="btn dark"
              style={{ maxWidth: 320, marginBottom: 14 }}
              disabled={uploading}
              onClick={() => camRef.current?.click()}
            >
              📷 {uploading ? "Uploading…" : "Take a photo of them"}
            </button>
          )}
          <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={takePhoto} style={{ display: "none" }} />
          {photoUrl && (
            <button className="btn ghost" style={{ maxWidth: 320, marginBottom: 14 }} onClick={() => camRef.current?.click()}>
              Retake photo
            </button>
          )}
          <button className="btn green" style={{ maxWidth: 320 }} disabled={submitting || !photoUrl} onClick={confirm}>
            {submitting ? "Confirming…" : photoUrl ? "I witnessed this — confirm" : "Take a photo first"}
          </button>
          {error && <p style={{ color: "var(--accent-d)", marginTop: 12, fontWeight: 600 }}>{error}</p>}
        </>
      ) : (
        <>
          <p className="muted" style={{ marginBottom: 12, fontSize: 14 }}>Sign in to vouch as yourself.</p>
          <button className="btn" style={{ maxWidth: 320 }} onClick={() => signIn("google", { callbackUrl: `${BASE_PATH}/witness/${token}` })}>
            Continue with Google
          </button>
        </>
      )}
    </div>
  );
}
