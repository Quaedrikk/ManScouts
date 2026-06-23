"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { upload } from "@vercel/blob/client";
import Avatar from "../Avatar";
import { Hold, ClimbVideo } from "./ClimbBits";
import ClimbCard from "./ClimbCard";
import ClimbRecord from "./ClimbRecord";
import { FacilityMap, FacilityEditor } from "./FacilityMap";
import RouteSetter, { HOLD_TYPE_COLOR } from "./RouteSetter";
import { isAdminEmail } from "@/lib/admin";
import { GYMS, WALLS, CLIMB_COLORS, HOLD_SHAPES, colorHex, type ClimbPost, type ClimbProfile, type FacilityBox, type Route } from "@/lib/climb";

function RouteCard({ r, canDelete, onDelete }: { r: Route; canDelete: boolean; onDelete: () => void }) {
  return (
    <div className="card" style={{ padding: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: colorHex(r.color), border: "2px solid #fff", boxShadow: "0 0 0 1px var(--line)" }} />
        <span className="chip" style={{ background: "var(--ink)", color: "#fff" }}>V{r.grade}</span>
        <div className="muted" style={{ flex: 1, fontSize: 12.5, minWidth: 0 }}>set by {r.setters.join(", ")}</div>
        {canDelete && <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-d)", fontWeight: 800, fontSize: 13 }}>Delete</button>}
      </div>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={r.photoUrl} alt="route" style={{ width: "100%", display: "block" }} />
        {r.holds.map((h, i) => (
          <span key={i} title={h.type} style={{ position: "absolute", left: `${h.x * 100}%`, top: `${h.y * 100}%`, transform: "translate(-50%,-50%)", width: 22, height: 22, borderRadius: "50%", background: HOLD_TYPE_COLOR[h.type], border: "2px solid #fff", color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,.4)" }}>{h.type[0]}</span>
        ))}
      </div>
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
  const [facility, setFacility] = useState<FacilityBox[]>([]);
  const [editMap, setEditMap] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [settingRoute, setSettingRoute] = useState(false);

  const loadFeed = useCallback(async () => {
    try { const d = await fetch("/api/climbing/posts").then((r) => r.json()); setPosts(d.posts ?? []); } catch { /* */ }
  }, []);
  const loadFacility = useCallback(async () => {
    try { const d = await fetch(`/api/climbing/facility?gym=${encodeURIComponent(gym)}`).then((r) => r.json()); setFacility(d.boxes ?? []); } catch { /* */ }
  }, [gym]);
  const loadRoutes = useCallback(async () => {
    try { const d = await fetch(`/api/climbing/routes?gym=${encodeURIComponent(gym)}`).then((r) => r.json()); setRoutes(d.routes ?? []); } catch { /* */ }
  }, [gym]);

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => { loadFacility(); }, [loadFacility]);
  useEffect(() => { loadRoutes(); }, [loadRoutes]);
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
  function updatePost(p: ClimbPost) { setPosts((prev) => prev.map((x) => x.id === p.id ? p : x)); }
  async function delRoute(id: string) {
    if (!confirm("Delete this route?")) return;
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    try { await fetch(`/api/climbing/routes?gym=${encodeURIComponent(gym)}&id=${encodeURIComponent(id)}`, { method: "DELETE" }); } catch { /* */ }
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
            {posts.map((p) => <ClimbCard key={p.id} post={p} meId={profile.id} canDelete={p.userId === profile.id || isAdmin} onDelete={() => del(p.id)} onUpdate={updatePost} />)}
          </div>
        )}

        {tab === "climbs" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 2px 10px" }}>
              <div className="display" style={{ fontSize: 26 }}>Climbs</div>
              {isAdmin && <button className="chip" onClick={() => setEditMap(true)}>✎ Edit map</button>}
            </div>
            <div className="label" style={{ margin: "0 2px 8px" }}>{gym} · tap a wall</div>
            {facility.length > 0 ? (
              <FacilityMap boxes={facility} selected={wall} onSelect={setWall} />
            ) : (
              <div className="seg">{WALLS.map((w) => <button key={w} className={"chip" + (wall === w ? " on" : "")} onClick={() => setWall(w)}>{w}</button>)}</div>
            )}
            <div className="card" style={{ padding: 16, margin: "14px 0", background: "linear-gradient(160deg,#2f3a44,#1c242b)", color: "#fff" }}>
              <div className="label" style={{ color: "rgba(255,255,255,.7)" }}>{gym}</div>
              <div className="display" style={{ fontSize: 22 }}>{wall}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", marginTop: 2 }}>{posts.filter((p) => p.wall === wall).length} climbs logged</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 2px 8px" }}>
              <div className="label">Routes on {wall}</div>
              <button className="chip" onClick={() => setSettingRoute(true)}>+ Set a route</button>
            </div>
            {routes.filter((r) => r.wall === wall).length === 0 && <p className="muted" style={{ fontSize: 13, padding: "0 2px 8px" }}>No routes set on this wall yet.</p>}
            {routes.filter((r) => r.wall === wall).map((r) => <RouteCard key={r.id} r={r} canDelete={r.createdBy === profile.id || isAdmin} onDelete={() => delRoute(r.id)} />)}

            <div className="label" style={{ margin: "16px 2px 8px" }}>Logged climbs</div>
            {posts.filter((p) => p.wall === wall).length === 0 && <p className="muted" style={{ textAlign: "center", padding: 16 }}>No climbs on this wall yet.</p>}
            {posts.filter((p) => p.wall === wall).map((p) => <ClimbCard key={p.id} post={p} meId={profile.id} canDelete={p.userId === profile.id || isAdmin} onDelete={() => del(p.id)} onUpdate={updatePost} />)}
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

      {recording && <ClimbRecord gym={gym} facility={facility} onCancel={() => setRecording(false)} onPosted={() => { setRecording(false); loadFeed(); }} />}
      {editMap && <FacilityEditor gym={gym} initial={facility} onClose={() => { setEditMap(false); loadFacility(); }} />}
      {settingRoute && <RouteSetter gym={gym} facility={facility} onClose={() => setSettingRoute(false)} onSaved={() => { setSettingRoute(false); loadRoutes(); }} />}
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
