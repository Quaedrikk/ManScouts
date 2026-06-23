"use client";
import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import CIcon from "./ClimbIcons";
import type { ClimbProfile } from "@/lib/climb";

export default function EditClimbProfile({ profile, onClose, onSaved }: {
  profile: ClimbProfile; onClose: () => void; onSaved: (p: ClimbProfile) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [isSetter, setIsSetter] = useState(!!profile.isSetter);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    setUploading(true);
    try { const blob = await upload(`avatars/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" }); setAvatarUrl(blob.url); } catch { /* */ }
    setUploading(false);
  }
  async function save() {
    if (!name.trim() || !handle.trim()) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/climbing/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, name, handle, bio, avatarUrl, isSetter }),
      });
      const d = await res.json();
      if (res.ok && d.profile) { onSaved(d.profile); return; }
      setErr(d.error ?? "Couldn't save.");
    } catch { setErr("Couldn't save."); }
    setBusy(false);
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 14px" }}>Edit profile</h2>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div onClick={() => fileRef.current?.click()} style={{ width: 88, height: 88, margin: "0 auto", borderRadius: "50%", border: "2px dashed var(--line)", background: avatarUrl ? `center/cover url(${avatarUrl})` : "var(--tint)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {!avatarUrl && <span className="label">{uploading ? "…" : "Photo"}</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickAvatar} className="hide" />
        </div>
        <div className="label" style={{ marginBottom: 6 }}>Name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Honnold" />
        <div className="label" style={{ margin: "12px 0 6px" }}>Handle</div>
        <input value={handle} onChange={(e) => setHandle(e.target.value.replace(/\s/g, ""))} placeholder="@sendit" />
        <div className="label" style={{ margin: "12px 0 6px" }}>Bio</div>
        <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Crimps over jugs." />

        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CIcon name="climbs" size={20} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Route setter</div>
              <div className="muted" style={{ fontSize: 12.5 }}>Unlock setting routes &amp; the map</div>
            </div>
          </div>
          <button onClick={() => setIsSetter((s) => !s)} aria-label="Toggle route setter"
            style={{ width: 48, height: 28, borderRadius: 999, border: "none", cursor: "pointer", background: isSetter ? "var(--accent)" : "var(--line)", position: "relative", transition: "background .15s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: isSetter ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
          </button>
        </div>

        {err && <p style={{ color: "var(--accent-d)", fontSize: 13, fontWeight: 700, margin: "10px 2px 0" }}>{err}</p>}
        <div style={{ height: 16 }} />
        <button className="btn" disabled={!name.trim() || !handle.trim() || busy || uploading} onClick={save}>{busy ? "Saving…" : "Save profile"}</button>
        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
