"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { upload } from "@vercel/blob/client";
import ClimbCard from "./ClimbCard";
import ClimbRecord from "./ClimbRecord";
import WallBoard from "./WallBoard";
import { FacilityMap, FacilityEditor } from "./FacilityMap";
import RouteSetter from "./RouteSetter";
import { HoldCallout, holdCounts } from "./HoldCallout";
import EditClimbProfile from "./EditClimbProfile";
import ClimbProfileOther from "./ClimbProfileOther";
import { isAdminEmail } from "@/lib/admin";
import { GYMS, colorHex, climberTier, type ClimbPost, type ClimbProfile, type ClimbWall, type ClimbUserLite, type FacilityBox, type Route } from "@/lib/climb";

const TABS = [{ id: "feed", label: "🏠 Feed" }, { id: "climbs", label: "🧗 Climbs" }, { id: "me", label: "👤 Profile" }];

// Modern animated dropdown (replaces native <select>).
function Dropdown({ value, options, onChange, minWidth, align = "left" }: {
  value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; minWidth?: number; align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDoc(e: PointerEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);
  const cur = options.find((o) => o.value === value);
  return (
    <div ref={ref} style={{ position: "relative", minWidth }}>
      <button className={"ddbtn" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cur?.label ?? ""}</span>
        <svg className={"ddchev" + (open ? " open" : "")} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="ddmenu pop" style={align === "right" ? { left: "auto", right: 0, minWidth: 160 } : undefined}>
          {options.map((o) => (
            <button key={o.value} className={"ddopt" + (o.value === value ? " on" : "")} onClick={() => { onChange(o.value); setOpen(false); }}>{o.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// Unique climbers who recommended (liked/super-liked) any of a route's posts.
function routeRecommend(routeId: string, posts: ClimbPost[]): number {
  const set = new Set<string>();
  for (const p of posts) {
    if (p.routeId !== routeId) continue;
    for (const id of p.likes ?? []) set.add(id);
    for (const id of p.superLikes ?? []) set.add(id);
  }
  return set.size;
}

function RouteRow({ r, completions, recommend, onOpen, onStart, i }: {
  r: Route; completions: number; recommend: number; onOpen: () => void; onStart: () => void; i: number;
}) {
  return (
    <div className="crow" style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}>
      <div onClick={onOpen} style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0, cursor: "pointer" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="thumb" src={r.photoUrl} alt="route" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="vchip" style={{ background: colorHex(r.color) }}>V{r.grade}</span>
            <span style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.wall}</span>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 5 }}>👍 {recommend} · 👤 {completions} completed</div>
        </div>
      </div>
      <button className="startbtn" onClick={onStart}>Start →</button>
    </div>
  );
}

export default function ClimbApp() {
  const { data: session, status } = useSession();
  const isAdmin = isAdminEmail(session?.user?.email);
  const [profile, setProfile] = useState<ClimbProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [posts, setPosts] = useState<ClimbPost[]>([]);
  const [tab, setTab] = useState("feed");
  const [gym, setGym] = useState<string>(GYMS[0]);
  const [recording, setRecording] = useState(false);
  const [startRoute, setStartRoute] = useState<Route | null>(null);
  const [facility, setFacility] = useState<FacilityBox[]>([]);
  const [editMap, setEditMap] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [settingRoute, setSettingRoute] = useState(false);
  const [viewRoute, setViewRoute] = useState<Route | null>(null);
  const [editProfile, setEditProfile] = useState(false);
  // feed
  const [feedMode, setFeedMode] = useState<"gym" | "following">("gym");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<ClimbUserLite[]>([]);
  const [viewUser, setViewUser] = useState<ClimbProfile | null>(null);
  // climbs sort: "new" | "hot" | a V grade number
  const [sort, setSort] = useState<string>("new");

  const loadFeed = useCallback(async () => {
    try { const d = await fetch("/api/climbing/posts").then((r) => r.json()); setPosts(d.posts ?? []); } catch { /* */ }
  }, []);
  const loadFacility = useCallback(async () => {
    try { const d = await fetch(`/api/climbing/facility?gym=${encodeURIComponent(gym)}`).then((r) => r.json()); setFacility(d.boxes ?? []); } catch { /* */ }
  }, [gym]);
  const loadRoutes = useCallback(async () => {
    try { const d = await fetch(`/api/climbing/routes?gym=${encodeURIComponent(gym)}`).then((r) => r.json()); setRoutes(d.routes ?? []); } catch { /* */ }
  }, [gym]);
  const loadUsers = useCallback(async () => {
    try { const d = await fetch("/api/climbing/users").then((r) => r.json()); setUsers(d.users ?? []); } catch { /* */ }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => { loadFacility(); }, [loadFacility]);
  useEffect(() => { loadRoutes(); }, [loadRoutes]);
  useEffect(() => { loadUsers(); }, [loadUsers]);
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

  const me = profile;
  const following = me.following ?? [];
  const mine = posts.filter((p) => p.userId === me.id);
  const maxGrade = mine.reduce((m, p) => Math.max(m, p.grade ?? 0), 0);

  // Feed visibility filter for a post (viewer = me).
  function canSee(p: ClimbPost): boolean {
    const v = p.visibility ?? "everyone";
    if (p.userId === me.id) return true;
    if (v === "me") return false;
    if (v === "followers") return following.includes(p.userId);
    return true;
  }
  const feedPosts = posts.filter((p) => {
    if (!canSee(p)) return false;
    if (feedMode === "following") return p.userId === me.id || following.includes(p.userId);
    return true;
  });

  async function openUser(id: string) {
    if (id === me.id) { setTab("me"); return; }
    try {
      const d = await fetch(`/api/climbing/profile?id=${encodeURIComponent(id)}`).then((r) => r.json());
      if (d.profile) setViewUser(d.profile);
    } catch { /* */ }
  }
  function doSearch() {
    const q = search.trim().replace(/^@/, "").toLowerCase();
    if (!q) return;
    const hit = users.find((u) => u.handle.replace(/^@/, "").toLowerCase() === q);
    if (hit) { openUser(hit.id); setSearch(""); }
    else alert("No climber with that exact @handle.");
  }
  async function toggleFollow(targetId: string) {
    try {
      const d = await fetch("/api/climbing/follow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetId }) }).then((r) => r.json());
      if (d.profile) setProfile(d.profile);
    } catch { /* */ }
  }

  async function del(id: string) {
    if (!confirm("Delete this climb?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    try { await fetch(`/api/climbing/posts?id=${encodeURIComponent(id)}`, { method: "DELETE" }); } catch { /* */ }
  }
  function updatePost(p: ClimbPost) { setPosts((prev) => prev.map((x) => x.id === p.id ? p : x)); }
  async function delRoute(id: string) {
    if (!confirm("Delete this route?")) return;
    setRoutes((prev) => prev.filter((r) => r.id !== id));
    setViewRoute(null);
    try { await fetch(`/api/climbing/routes?gym=${encodeURIComponent(gym)}&id=${encodeURIComponent(id)}`, { method: "DELETE" }); } catch { /* */ }
  }
  async function toggleSetter() {
    const next = { ...me, isSetter: !me.isSetter };
    setProfile(next);
    try { await fetch("/api/climbing/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }); } catch { /* */ }
  }

  // Sorted/filtered routes for the Climbs tab.
  const sortedRoutes = (() => {
    if (sort === "new") return [...routes].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    if (sort === "hot") return [...routes].sort((a, b) => posts.filter((p) => p.routeId === b.id).length - posts.filter((p) => p.routeId === a.id).length);
    const g = Number(sort);
    return routes.filter((r) => r.grade === g).sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  })();

  return (
    <div>
      <div className="topbar">
        <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: "-.03em" }}>🧗 Climbing</h1>
          <Dropdown value={gym} onChange={setGym} align="right" minWidth={130}
            options={GYMS.map((g) => ({ value: g, label: g }))} />
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <div className="hsearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a climber by @handle…" onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }} />
          </div>
        </div>
      </div>

      <div key={tab} className="catfade" style={{ maxWidth: 540, margin: "0 auto", padding: "0 18px 140px" }}>
        {tab === "feed" && (
          <div>
            <div className="display" style={{ fontSize: 26, margin: "18px 2px 4px" }}>The Wall</div>
            <div className="muted" style={{ fontSize: 13.5, margin: "0 2px 14px" }}>{gym}</div>

            <div className="seg" style={{ marginBottom: 14 }}>
              <button className={"chip" + (feedMode === "gym" ? " on" : "")} style={{ flex: 1 }} onClick={() => setFeedMode("gym")}>Gym</button>
              <button className={"chip" + (feedMode === "following" ? " on" : "")} style={{ flex: 1 }} onClick={() => setFeedMode("following")}>Following</button>
            </div>

            {feedPosts.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 24 }}>{feedMode === "following" ? "Follow some climbers to fill this feed." : "No climbs yet. Record the first send."}</p>}
            {feedPosts.map((p) => <ClimbCard key={p.id} post={p} meId={me.id} canDelete={p.userId === me.id || isAdmin} onDelete={() => del(p.id)} onUpdate={updatePost} onOpenUser={openUser} />)}
          </div>
        )}

        {tab === "climbs" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 2px 12px" }}>
              <div className="display" style={{ fontSize: 26 }}>Climbs</div>
              {me.isSetter && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="chip" onClick={() => setSettingRoute(true)}>+ Set a route</button>
                  <button className="chip" onClick={() => setEditMap(true)}>✎ Edit map</button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 2px 14px" }}>
              <span className="label">Sort</span>
              <Dropdown value={sort} onChange={setSort} minWidth={130}
                options={[{ value: "new", label: "🆕 New" }, { value: "hot", label: "🔥 Hot" }, ...[1, 2, 3, 4, 5, 6].map((g) => ({ value: String(g), label: `V${g}` }))]} />
            </div>

            {sortedRoutes.length === 0
              ? <p className="muted" style={{ fontSize: 13, padding: "0 2px 8px" }}>No routes here yet.</p>
              : (
                <div className="card clist">
                  {sortedRoutes.map((r, i) => (
                    <RouteRow key={r.id} r={r} i={i}
                      completions={posts.filter((p) => p.routeId === r.id).length}
                      recommend={routeRecommend(r.id, posts)}
                      onOpen={() => setViewRoute(r)}
                      onStart={() => { setStartRoute(r); setRecording(true); }} />
                  ))}
                </div>
              )}
          </div>
        )}

        {tab === "me" && (
          <ClimbProfileView profile={me} mine={mine} maxGrade={maxGrade} meId={me.id} isAdmin={isAdmin}
            onSave={setProfile} onSignOut={() => signOut()} onEdit={() => setEditProfile(true)}
            onToggleSetter={toggleSetter} onDeletePost={del} onUpdatePost={updatePost} />
        )}
      </div>

      {/* Record FAB */}
      <button onClick={() => { setStartRoute(null); setRecording(true); }} aria-label="Record climb"
        style={{ position: "fixed", right: 20, bottom: "calc(env(safe-area-inset-bottom) + 78px)", zIndex: 45, width: 58, height: 58, borderRadius: "50%", border: "none", background: "var(--accent)", color: "#fff", fontSize: 24, cursor: "pointer", boxShadow: "0 8px 20px rgba(229,85,43,.4)" }}>
        ＋
      </button>

      <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, background: "rgba(255,255,255,.92)", backdropFilter: "blur(14px)", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-around", padding: "10px 4px calc(env(safe-area-inset-bottom) + 10px)" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", color: tab === t.id ? "var(--accent)" : "var(--muted)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>{t.label}</button>
        ))}
      </nav>

      {recording && <ClimbRecord gym={gym} preselected={startRoute} onCancel={() => { setRecording(false); setStartRoute(null); }} onPosted={() => { setRecording(false); setStartRoute(null); loadFeed(); }} onCreateRoute={() => { setRecording(false); setStartRoute(null); setSettingRoute(true); }} />}
      {editMap && <FacilityEditor gym={gym} initial={facility} onClose={() => { setEditMap(false); loadFacility(); }} />}
      {settingRoute && <RouteSetter gym={gym} facility={facility} meName={me.name} onClose={() => setSettingRoute(false)} onSaved={() => { setSettingRoute(false); loadRoutes(); }} />}
      {editProfile && <EditClimbProfile profile={me} onClose={() => setEditProfile(false)} onSaved={(p) => { setProfile(p); setEditProfile(false); loadUsers(); loadFeed(); }} />}
      {viewUser && (
        <ClimbProfileOther profile={viewUser} posts={posts} meId={me.id} following={following.includes(viewUser.id)}
          onToggleFollow={() => toggleFollow(viewUser.id)} onUpdate={updatePost} onClose={() => setViewUser(null)} />
      )}

      {viewRoute && (
        <div className="scrim" onClick={() => setViewRoute(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grip" />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span className="chip" style={{ background: colorHex(viewRoute.color), color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.4)" }}>V{viewRoute.grade}</span>
              <div className="display" style={{ fontSize: 20, flex: 1 }}>{viewRoute.wall}</div>
              {(viewRoute.createdBy === me.id || isAdmin) && <button onClick={() => delRoute(viewRoute.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-d)", fontWeight: 800, fontSize: 13 }}>Delete</button>}
            </div>
            <p className="muted" style={{ fontSize: 12.5, margin: "0 0 10px" }}>set by {viewRoute.setters.join(", ")}</p>

            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewRoute.photoUrl} alt="route" style={{ width: "100%", display: "block" }} />
              {viewRoute.holds.map((h, i) => <HoldCallout key={i} hold={h} size="sm" />)}
            </div>

            {holdCounts(viewRoute.holds).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0 4px" }}>
                {holdCounts(viewRoute.holds).map(({ type, n }) => (
                  <span key={type} className="chip">{n} {type}</span>
                ))}
              </div>
            )}

            {facility.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div className="label" style={{ margin: "0 2px 8px" }}>Where it is · {viewRoute.wall}</div>
                <FacilityMap boxes={facility} selected={viewRoute.wall} height={120} />
              </div>
            )}

            <div className="label" style={{ margin: "16px 2px 8px" }}>Completed this route</div>
            {posts.filter((p) => p.routeId === viewRoute.id && canSee(p)).length === 0
              ? <p className="muted" style={{ textAlign: "center", padding: 14 }}>No one yet — be the first.</p>
              : posts.filter((p) => p.routeId === viewRoute.id && canSee(p)).map((p) => <ClimbCard key={p.id} post={p} meId={me.id} canDelete={p.userId === me.id || isAdmin} onDelete={() => del(p.id)} onUpdate={updatePost} onOpenUser={openUser} />)}

            <div style={{ height: 10 }} />
            <button className="btn green" onClick={() => { const r = viewRoute; setViewRoute(null); setStartRoute(r); setRecording(true); }}>🧗 Start Climb</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={() => setViewRoute(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClimbProfileView({ profile, mine, maxGrade, meId, isAdmin, onSave, onSignOut, onEdit, onToggleSetter, onDeletePost, onUpdatePost }: {
  profile: ClimbProfile; mine: ClimbPost[]; maxGrade: number; meId: string; isAdmin: boolean;
  onSave: (p: ClimbProfile) => void; onSignOut: () => void; onEdit: () => void; onToggleSetter: () => void;
  onDeletePost: (id: string) => void; onUpdatePost: (p: ClimbPost) => void;
}) {
  const { tier, v } = climberTier(maxGrade);
  async function saveWall(wall: ClimbWall) {
    const next = { ...profile, wall };
    onSave(next);
    try { await fetch("/api/climbing/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }); } catch { /* */ }
  }
  return (
    <div>
      <div style={{ height: 18 }} />
      <WallBoard profile={profile} editable onSave={saveWall} />

      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
          <div className="display" style={{ color: "var(--accent)", fontSize: 20 }}>{tier}</div>
          <div className="label" style={{ marginTop: 3 }}>V{v} climber</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
          <div className="display" style={{ color: "var(--accent)", fontSize: 26 }}>{mine.length}</div>
          <div className="label" style={{ marginTop: 3 }}>Climbs</div>
        </div>
      </div>

      <button className="btn ghost" onClick={onEdit}>✎ Edit profile</button>
      <div style={{ height: 10 }} />
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Route setter</div>
          <div className="muted" style={{ fontSize: 12.5 }}>Unlock setting routes &amp; editing the map</div>
        </div>
        <button onClick={onToggleSetter} aria-label="Toggle route setter"
          style={{ width: 48, height: 28, borderRadius: 999, border: "none", cursor: "pointer", background: profile.isSetter ? "var(--accent)" : "var(--line)", position: "relative", transition: "background .15s" }}>
          <span style={{ position: "absolute", top: 3, left: profile.isSetter ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
        </button>
      </div>

      <div className="label" style={{ margin: "22px 2px 10px" }}>Your climbs</div>
      {mine.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 16 }}>No climbs yet.</p>}
      {mine.map((p) => <ClimbCard key={p.id} post={p} meId={meId} canDelete={p.userId === meId || isAdmin} onDelete={() => onDeletePost(p.id)} onUpdate={onUpdatePost} />)}

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
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try { const blob = await upload(`avatars/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" }); setAvatarUrl(blob.url); } catch { /* */ }
    setUploading(false);
  }
  async function save() {
    if (!name.trim() || !handle.trim()) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/climbing/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, handle, bio, avatarUrl }) });
      const d = await res.json();
      if (res.ok && d.profile) onDone(d.profile); else setErr(d.error ?? "Couldn't save.");
    } catch { setErr("Couldn't save."); }
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
        {err && <p style={{ color: "var(--accent-d)", fontSize: 13, fontWeight: 700, margin: "10px 2px 0" }}>{err}</p>}
        <div style={{ height: 16 }} />
        <button className="btn" disabled={!name.trim() || !handle.trim() || busy} onClick={save}>{busy ? "Saving…" : "Start climbing"}</button>
      </div>
    </div>
  );
}
