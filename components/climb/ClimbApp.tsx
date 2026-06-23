"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { upload } from "@vercel/blob/client";
import Avatar from "../Avatar";
import { Hold, ClimbVideo } from "./ClimbBits";
import ClimbRecord from "./ClimbRecord";
import { isAdminEmail } from "@/lib/admin";
import { GYMS, WALLS, CLIMB_COLORS, HOLD_SHAPES, colorHex, type ClimbPost, type ClimbProfile } from "@/lib/climb";

function fmtAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "now"; if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h"; return Math.floor(s / 86400) + "d";
}

function ClimbCard({ p, canDelete, onDelete }: { p: ClimbPost; canDelete: boolean; onDelete: () => void }) {
  return (
    <div className="card post fadeup">
      <div className="ph">
        <Avatar name={p.userName} handle={p.userHandle} img={p.userAvatarUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14.5 }}>{p.userName}</div>
          <div className="muted" style={{ fontSize: 12.5 }}>{p.wall} · {fmtAgo(p.createdAt)}</div>
        </div>
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: colorHex(p.color), border: "2px solid #fff", boxShadow: "0 0 0 1px var(--line)" }} />
        <span className="chip" style={{ background: "var(--ink)", color: "#fff" }}>V{p.grade}</span>
        {canDelete && (
          <button onClick={onDelete} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0a99a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7" /></svg>
          </button>
        )}
      </div>
      <ClimbVideo url={p.videoUrl} startSec={p.startSec} />
      {p.note && <div style={{ fontSize: 14, margin: "10px 2px 0", lineHeight: 1.45 }}>{p.note}</div>}
    </div>
  );
}

const TABS = [{ id: "feed", label: "Feed" }, { id: "climbs", label: "Climbs" }, { id: "me", label: "Profile" }];

export default function ClimbApp() {
  const { data: session, status } = useSession();
  const isAdmin = isAdminEmail(session?.user?.email);
  const [profile, setProfile] = useState<ClimbProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [posts, setPosts] = useState<ClimbPost[]>([]);
  const [tab, setTab] = useState("feed");
  const [gym, setGym] = useState<string>(GYMS[0]);
  const [recording, setRecording] = useState(false);
  const [wall, setWall] = useState<string>(WALLS[0]);

  const loadFeed = useCallback(async () => {
    try { const d = await fetch("/api/climbing/posts").then((r) => r.json()); setPosts(d.posts ?? []); } catch { /* */ }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => {
    if (status !== "authenticated") { if (status === "unauthenticated") setLoaded(true); return; }
    let active = true;
    fetch("/api/climbing/profile").then((r) => r.json()).then((d) => { if (active) setProfile(d.profile ?? null); }).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [status]);

  if (status === "loading" || !loaded) return <div className="display muted" style={{ padding: 80, textAlign: "center" }}>Loading…</div>;

  if (status !== "authenticated") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div className="display" style={{ fontSize: 30 }}>Man<span style={{ color: "var(--accent)" }}>Scouts</span> · Climbing</div>
        <p className="muted" style={{ margin: "8px 0 24px" }}>Post your sends. Document the walls.</p>
        <button className="btn" style={{ maxWidth: 320 }} onClick={() => signIn("google")}>Continue with Google</button>
      </div>
    );
  }

  if (!profile) return <ClimbOnboard session={session} onDone={setProfile} />;

  const mine = posts.filter((p) => p.userId === profile.id);
  const power = mine.reduce((s, p) => s + (p.grade ?? 0), 0);

  async function del(id: string) {
    if (!confirm("Delete this climb?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    try { await fetch(`/api/climbing/posts?id=${encodeURIComponent(id)}`, { method: "DELETE" }); } catch { /* */ }
  }

  return (
    <div>
      <div className="topbar">
        <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: "-.03em" }}>🧗 Climbing</h1>
          <select value={gym} onChange={(e) => setGym(e.target.value)} style={{ width: "auto", padding: "6px 10px", fontSize: 13, fontWeight: 700, borderRadius: 10 }}>
            {GYMS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "0 18px 140px" }}>
        {tab === "feed" && (
          <div>
            <div className="display" style={{ fontSize: 26, margin: "18px 2px 4px" }}>The Wall</div>
            <div className="muted" style={{ fontSize: 13.5, margin: "0 2px 16px" }}>{gym}</div>
            {posts.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 24 }}>No climbs yet. Record the first send.</p>}
            {posts.map((p) => <ClimbCard key={p.id} p={p} canDelete={p.userId === profile.id || isAdmin} onDelete={() => del(p.id)} />)}
          </div>
        )}

        {tab === "climbs" && (
          <div>
            <div className="display" style={{ fontSize: 26, margin: "18px 2px 10px" }}>Climbs</div>
            <div className="seg" style={{ marginBottom: 16 }}>
              {WALLS.map((w) => <button key={w} className={"chip" + (wall === w ? " on" : "")} onClick={() => setWall(w)}>{w}</button>)}
            </div>
            <div className="card" style={{ padding: 16, marginBottom: 14, background: "linear-gradient(160deg,#2f3a44,#1c242b)", color: "#fff" }}>
              <div className="label" style={{ color: "rgba(255,255,255,.7)" }}>{gym}</div>
              <div className="display" style={{ fontSize: 22 }}>{wall}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", marginTop: 2 }}>{posts.filter((p) => p.wall === wall).length} climbs logged</div>
            </div>
            {posts.filter((p) => p.wall === wall).length === 0 && <p className="muted" style={{ textAlign: "center", padding: 16 }}>No climbs on this wall yet.</p>}
            {posts.filter((p) => p.wall === wall).map((p) => <ClimbCard key={p.id} p={p} canDelete={p.userId === profile.id || isAdmin} onDelete={() => del(p.id)} />)}
          </div>
        )}

        {tab === "me" && (
          <ClimbProfileView profile={profile} mine={mine} power={power} onSave={setProfile} onSignOut={() => signOut()} />
        )}
      </div>

      {/* Record FAB */}
      <button onClick={() => setRecording(true)} aria-label="Record climb"
        style={{ position: "fixed", right: 20, bottom: "calc(env(safe-area-inset-bottom) + 78px)", zIndex: 45, width: 58, height: 58, borderRadius: "50%", border: "none", background: "var(--accent)", color: "#fff", fontSize: 24, cursor: "pointer", boxShadow: "0 8px 20px rgba(229,85,43,.4)" }}>
        ＋
      </button>

      <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, background: "rgba(255,255,255,.92)", backdropFilter: "blur(14px)", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-around", padding: "10px 4px calc(env(safe-area-inset-bottom) + 10px)" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", color: tab === t.id ? "var(--accent)" : "var(--muted)", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>{t.label}</button>
        ))}
      </nav>

      {recording && <ClimbRecord gym={gym} onCancel={() => setRecording(false)} onPosted={() => { setRecording(false); loadFeed(); }} />}
    </div>
  );
}

function ClimbProfileView({ profile, mine, power, onSave, onSignOut }: { profile: ClimbProfile; mine: ClimbPost[]; power: number; onSave: (p: ClimbProfile) => void; onSignOut: () => void }) {
  const holdColor = profile.holdColor ?? "#2f6fe0";
  async function setHoldColor(hex: string) {
    const next = { ...profile, holdColor: hex };
    onSave(next);
    try { await fetch("/api/climbing/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }); } catch { /* */ }
  }
  return (
    <div>
      <div className="card" style={{ padding: 16, marginTop: 18, display: "flex", gap: 14, alignItems: "center" }}>
        <Avatar name={profile.name} handle={profile.handle} img={profile.avatarUrl} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{ fontSize: 20 }}>{profile.name}</div>
          <div className="muted" style={{ fontSize: 13 }}>{profile.handle}</div>
          {profile.bio && <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{profile.bio}</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
          <div className="display" style={{ color: "var(--accent)", fontSize: 26 }}>{power}V</div>
          <div className="label" style={{ marginTop: 3 }}>Power ranking</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
          <div className="display" style={{ color: "var(--accent)", fontSize: 26 }}>{mine.length}</div>
          <div className="label" style={{ marginTop: 3 }}>Climbs</div>
        </div>
      </div>

      <div className="label" style={{ margin: "8px 2px 8px" }}>Your holds box</div>
      <div className="card" style={{ padding: 16, background: "linear-gradient(160deg,#efeadd,#e3dcc8)" }}>
        {mine.length === 0 ? (
          <div className="muted" style={{ textAlign: "center", fontSize: 13, padding: "10px 0" }}>Log climbs to fill your holds box.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {mine.map((p, i) => <Hold key={p.id} shape={HOLD_SHAPES[i % HOLD_SHAPES.length]} color={holdColor} size={40} />)}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}>
          {CLIMB_COLORS.map((c) => (
            <button key={c.key} onClick={() => setHoldColor(c.hex)} title={c.key}
              style={{ width: 26, height: 26, borderRadius: "50%", background: c.hex, cursor: "pointer", border: holdColor === c.hex ? "3px solid var(--ink)" : "2px solid #fff", boxShadow: "0 0 0 1px var(--line)" }} />
          ))}
        </div>
      </div>

      <div className="label" style={{ margin: "22px 2px 10px" }}>Your climbs</div>
      {mine.map((p) => (
        <div key={p.id} className="card post" style={{ padding: 12 }}>
          <div className="ph">
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: colorHex(p.color), border: "2px solid #fff", boxShadow: "0 0 0 1px var(--line)" }} />
            <div style={{ flex: 1, fontWeight: 800, fontSize: 14 }}>{p.wall}</div>
            <span className="chip" style={{ background: "var(--ink)", color: "#fff" }}>V{p.grade}</span>
          </div>
          <ClimbVideo url={p.videoUrl} startSec={p.startSec} />
        </div>
      ))}

      <div style={{ height: 16 }} />
      <button className="btn ghost" onClick={onSignOut}>Sign out</button>
    </div>
  );
}

function ClimbOnboard({ session, onDone }: { session: ReturnType<typeof useSession>["data"]; onDone: (p: ClimbProfile) => void }) {
  const [name, setName] = useState(session?.user?.name ?? "");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try { const blob = await upload(`avatars/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" }); setAvatarUrl(blob.url); } catch { /* */ }
    setUploading(false);
  }
  async function save() {
    if (!name.trim() || !handle.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/climbing/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, handle, bio, avatarUrl }) });
      const d = await res.json();
      if (d.profile) onDone(d.profile); else alert("Couldn't save.");
    } catch { alert("Couldn't save."); }
    setBusy(false);
  }
  return (
    <div className="scrim" style={{ alignItems: "center" }}>
      <div className="sheet" style={{ borderRadius: 24, maxWidth: 440 }}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 24, textAlign: "center" }}>Climber profile</h2>
        <p className="muted" style={{ textAlign: "center", fontSize: 14, margin: "4px 0 16px" }}>How you show up on the wall.</p>
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
        <div style={{ height: 16 }} />
        <button className="btn" disabled={!name.trim() || !handle.trim() || busy} onClick={save}>{busy ? "Saving…" : "Start climbing"}</button>
      </div>
    </div>
  );
}
