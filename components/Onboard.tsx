"use client";
import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import type { UserProfile } from "@/lib/types";

interface Props {
  onDone: (profile: UserProfile) => void;
  initial?: UserProfile | null;
  defaults?: Partial<UserProfile>;
  onCancel?: () => void;
}

export default function Onboard({ onDone, initial, defaults, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? defaults?.name ?? "");
  const [handle, setHandle] = useState(initial?.handle ?? defaults?.handle ?? "");
  const [bio, setBio] = useState(initial?.bio ?? defaults?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatarUrl ?? defaults?.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const blob = await upload(`avatars/${f.name}`, f, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setAvatarUrl(blob.url);
    } catch {
      alert("Upload failed — try again.");
    }
    setUploading(false);
  }

  const valid = name.trim() && handle.trim();

  function submit() {
    if (!valid) return;
    onDone({
      id: initial?.id ?? defaults?.id ?? "",
      name: name.trim(),
      handle: handle.startsWith("@") ? handle : "@" + handle,
      bio,
      avatarUrl,
    });
  }

  return (
    <div className="scrim" style={{ alignItems: "center" }}>
      <div className="sheet" style={{ borderRadius: 24, maxHeight: "92vh" }}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 24, textAlign: "center", margin: "4px 0" }}>
          {initial ? "Edit profile" : "Set up your profile"}
        </h2>
        <p className="muted" style={{ textAlign: "center", fontSize: 14, margin: "0 0 18px" }}>
          This is how you show up on the board.
        </p>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 92, height: 92, margin: "0 auto", borderRadius: "50%",
              border: "2px dashed var(--line)",
              background: avatarUrl ? `center/cover url(${avatarUrl})` : "var(--tint)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            {!avatarUrl && <span className="label">{uploading ? "…" : "Photo"}</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickAvatar} className="hide" />
        </div>
        <div className="label" style={{ marginBottom: 6 }}>Name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jack Larkin" />
        <div className="label" style={{ margin: "14px 0 6px" }}>Handle</div>
        <input value={handle} onChange={(e) => setHandle(e.target.value.replace(/\s/g, ""))} placeholder="@trailjack" />
        <div className="label" style={{ margin: "14px 0 6px" }}>Bio</div>
        <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What are you out here for?" />
        <div style={{ height: 18 }} />
        <button className="btn" disabled={!valid} onClick={submit}>
          {initial ? "Save" : "Start"}
        </button>
        {onCancel && (
          <>
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={onCancel}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
