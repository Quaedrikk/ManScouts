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
import CIcon from "./ClimbIcons";
import { CollectionsBar, CollectionSheet, CreateCollectionSheet, AddToCollectionSheet } from "./ClimbCollections";
import { isAdminEmail } from "@/lib/admin";
import { GYMS, colorHex, colorText, climberTier, suggestedGrade, type ClimbPost, type ClimbProfile, type ClimbWall, type ClimbUserLite, type ClimbCollection, type FacilityBox, type Route } from "@/lib/climb";

const TABS = [{ id: "feed", icon: "home", label: "Feed" }, { id: "climbs", icon: "climbs", label: "Climbs" }, { id: "me", icon: "user", label: "Profile" }];

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
            <span className="vchip" style={{ background: colorHex(r.color), color: colorText(r.color), textShadow: r.color === "white" || r.color === "yellow" ? "none" : "0 1px 2px rgba(0,0,0,.4)" }}>{r.grade === 0 ? "Unrated" : `V${r.grade}`}</span>
            <span style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.wall}</span>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
            <CIcon name="thumb" size={13} /> {recommend} <span style={{ opacity: .5 }}>·</span> <CIcon name="check" size={13} /> {completions} completed
          </div>
        </div>
      </div>
      <button className="startbtn" onClick={onStart} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Start <CIcon name="arrow" size={14} stroke={2.6} /></button>
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
  const [addFriend, setAddFriend] = useState(false);
  const [users, setUsers] = useState<ClimbUserLite[]>([]);
  const [viewUser, setViewUser] = useState<ClimbProfile | null>(null);
  // climbs sort + difficulty filter
  const [sortMode, setSortMode] = useState<"new" | "hot">("new");
  const [diffFilter, setDiffFilter] = useState<number[]>([]);
  // collections
  const [openColId, setOpenColId] = useState<string | null>(null);
  const [addToColPost, setAddToColPost] = useState<ClimbPost | null>(null);
  const [viewCollection, setViewCollection] = useState<ClimbCollection | null>(null);
  const [creatingCollection, setCreatingCollection] = useState(false);

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
    if (hit) { openUser(hit.id); setSearch(""); setAddFriend(false); }
    else alert("No climber with that exact @handle.");
  }
  async function inviteFriends() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/climbing` : "/climbing";
    const data = { title: "Post Wall · Climbing", text: "Join me on the Post Wall — log your climbs and follow mine.", url };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(url);
      alert("Invite link copied:\n" + url);
    } catch { /* cancelled */ }
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
    if (!confirm("Delete this route? This can't be undone.")) return;
    setViewRoute(null);
    try {
      const res = await fetch(`/api/climbing/routes?gym=${encodeURIComponent(gym)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) { alert("Couldn't delete this route."); return; }
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch { alert("Couldn't delete this route."); }
  }
  async function suggestGrade(routeId: string, grade: number) {
    try {
      const d = await fetch("/api/climbing/routes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gym, id: routeId, grade }) }).then((r) => r.json());
      if (d.route) { setRoutes((prev) => prev.map((r) => r.id === d.route.id ? d.route : r)); setViewRoute((v) => v && v.id === d.route.id ? d.route : v); }
    } catch { /* */ }
  }
  async function saveCollections(next: ClimbCollection[]) {
    setProfile((p) => p ? { ...p, collections: next } : p);
    try {
      const d = await fetch("/api/climbing/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collections: next }) }).then((r) => r.json());
      if (d.profile) setProfile(d.profile);
    } catch { /* */ }
  }
  function createCollection(name: string, postId?: string) {
    const col: ClimbCollection = { id: `col${Date.now()}`, name, postIds: postId ? [postId] : [] };
    saveCollections([...(me.collections ?? []), col]);
    return col;
  }
  function createCollectionFull(c: { name: string; coverUrl?: string; postIds: string[] }) {
    const col: ClimbCollection = { id: `col${Date.now()}`, name: c.name, coverUrl: c.coverUrl, postIds: c.postIds };
    saveCollections([...(me.collections ?? []), col]);
  }
  function setCollectionCover(colId: string, url: string) {
    saveCollections((me.collections ?? []).map((c) => c.id === colId ? { ...c, coverUrl: url } : c));
  }
  function toggleInCollection(colId: string, postId: string) {
    saveCollections((me.collections ?? []).map((c) => c.id === colId
      ? { ...c, postIds: c.postIds.includes(postId) ? c.postIds.filter((x) => x !== postId) : [...c.postIds, postId] }
      : c));
  }
  function renameCollection(colId: string, name: string) {
    saveCollections((me.collections ?? []).map((c) => c.id === colId ? { ...c, name } : c));
  }
  function deleteCollection(colId: string) {
    saveCollections((me.collections ?? []).filter((c) => c.id !== colId));
    setOpenColId(null);
  }

  // Featured "Slope of the week" = most-completed route (fallback: newest).
  const slopeOfWeek = (() => {
    if (routes.length === 0) return null;
    const ranked = [...routes].sort((a, b) => {
      const ca = posts.filter((p) => p.routeId === a.id).length;
      const cb = posts.filter((p) => p.routeId === b.id).length;
      return cb - ca || (b.createdAt > a.createdAt ? 1 : -1);
    });
    return ranked[0];
  })();

  // Sorted/filtered routes for the Climbs tab.
  const sortedRoutes = (() => {
    const filtered = diffFilter.length ? routes.filter((r) => diffFilter.includes(r.grade)) : routes;
    if (sortMode === "hot") return [...filtered].sort((a, b) => posts.filter((p) => p.routeId === b.id).length - posts.filter((p) => p.routeId === a.id).length);
    return [...filtered].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  })();
  function toggleDiff(g: number) { setDiffFilter((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]); }

  return (
    <div>
      <div className="topbar">
        <div className="row" style={{ width: "100%", justifyContent: "space-between", gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: "-.03em" }}>Post Wall</h1>
          <div style={{ display: "flex", gap: 7 }}>
            <button className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 5 }} onClick={() => { setSearch(""); setAddFriend(true); }}><CIcon name="users" size={14} /> Add friend</button>
            <button className="chip on" style={{ display: "inline-flex", alignItems: "center", gap: 5 }} onClick={inviteFriends}><CIcon name="arrow" size={14} /> Invite</button>
          </div>
        </div>
      </div>

      <div key={tab} className="catfade" style={{ maxWidth: 540, margin: "0 auto", padding: "0 18px 140px" }}>
        {tab === "feed" && (
          <div>
            <div style={{ height: 16 }} />
            {slopeOfWeek && (
              <button onClick={() => { setTab("climbs"); setViewRoute(slopeOfWeek); }} className="catscene" style={{ width: "100%", height: 120, border: "none", textAlign: "left", cursor: "pointer", marginBottom: 16, ["--c1" as string]: colorHex(slopeOfWeek.color), ["--c2" as string]: "#1c242b" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slopeOfWeek.photoUrl} alt="" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "45%", objectFit: "cover", opacity: .55, maskImage: "linear-gradient(90deg, transparent, #000 60%)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 60%)" }} />
                <div className="cap" style={{ position: "relative", zIndex: 2 }}>
                  <div className="label" style={{ color: "rgba(255,255,255,.85)", marginBottom: 4 }}>★ Slope of the week</div>
                  <div className="t">{slopeOfWeek.grade === 0 ? "Unrated" : `V${slopeOfWeek.grade}`} · {slopeOfWeek.wall}</div>
                  <div className="s">{posts.filter((p) => p.routeId === slopeOfWeek.id).length} sends this week · tap to view</div>
                </div>
              </button>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <Dropdown value={feedMode} onChange={(v) => setFeedMode(v as "gym" | "following")} align="right" minWidth={140}
                options={[{ value: "gym", label: "Everyone at gym" }, { value: "following", label: "Following" }]} />
            </div>

            {feedPosts.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 24 }}>{feedMode === "following" ? "Follow some climbers to fill this feed." : "No climbs yet. Record the first send."}</p>}
            {feedPosts.map((p) => <ClimbCard key={p.id} post={p} meId={me.id} canDelete={p.userId === me.id || isAdmin} onDelete={() => del(p.id)} onUpdate={updatePost} onOpenUser={openUser} />)}
          </div>
        )}

        {tab === "climbs" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "18px 2px 12px" }}>
              <div className="display" style={{ fontSize: 26 }}>Climbs</div>
              <Dropdown value={gym} onChange={setGym} align="right" minWidth={130}
                options={GYMS.map((g) => ({ value: g, label: g }))} />
            </div>
            {me.isSetter && (
              <div style={{ display: "flex", gap: 6, margin: "0 2px 12px" }}>
                <button className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 5 }} onClick={() => setSettingRoute(true)}><CIcon name="plus" size={14} /> Set a route</button>
                <button className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 5 }} onClick={() => setEditMap(true)}><CIcon name="pencil" size={14} /> Edit map</button>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, margin: "0 2px 12px" }}>
              <button className={"chip" + (sortMode === "new" ? " on" : "")} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => setSortMode("new")}><CIcon name="spark" size={14} /> New</button>
              <button className={"chip" + (sortMode === "hot" ? " on" : "")} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => setSortMode("hot")}><CIcon name="flame" size={14} /> Hot</button>
            </div>
            <div className="label" style={{ margin: "0 2px 8px" }}>Difficulty</div>
            <div className="seg" style={{ marginBottom: 16 }}>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <button key={g} className={"chip" + (diffFilter.includes(g) ? " on" : "")} style={{ flex: 1 }} onClick={() => toggleDiff(g)}>V{g}</button>
              ))}
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
            onDeletePost={del} onUpdatePost={updatePost}
            onOpenCollection={(c) => setOpenColId(c.id)} onNewCollection={() => setCreatingCollection(true)}
            onAddToCollection={(p) => setAddToColPost(p)} />
        )}
      </div>

      {/* Record FAB */}
      <button onClick={() => { setStartRoute(null); setRecording(true); }} aria-label="Record climb"
        style={{ position: "fixed", right: 20, bottom: "calc(env(safe-area-inset-bottom) + 78px)", zIndex: 45, width: 58, height: 58, borderRadius: "50%", border: "none", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 8px 20px rgba(229,85,43,.4)" }}>
        <CIcon name="plus" size={26} stroke={2.6} />
      </button>

      <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, background: "rgba(255,255,255,.92)", backdropFilter: "blur(14px)", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-around", padding: "9px 4px calc(env(safe-area-inset-bottom) + 9px)" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: "none", border: "none", color: tab === t.id ? "var(--accent)" : "var(--muted)", fontWeight: 800, fontSize: 11, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "color .15s" }}>
            <CIcon name={t.icon} size={22} stroke={tab === t.id ? 2.4 : 2} />
            {t.label}
          </button>
        ))}
      </nav>

      {recording && <ClimbRecord gym={gym} me={me} preselected={startRoute} onCancel={() => { setRecording(false); setStartRoute(null); }} onPosted={() => { setRecording(false); setStartRoute(null); loadFeed(); }} onCreateRoute={() => { setRecording(false); setStartRoute(null); setSettingRoute(true); }} />}
      {editMap && <FacilityEditor gym={gym} initial={facility} onClose={() => { setEditMap(false); loadFacility(); }} />}
      {settingRoute && <RouteSetter gym={gym} facility={facility} meName={me.name} onClose={() => setSettingRoute(false)} onSaved={() => { setSettingRoute(false); loadRoutes(); }} />}
      {editProfile && <EditClimbProfile profile={me} onClose={() => setEditProfile(false)} onSaved={(p) => { setProfile(p); setEditProfile(false); loadUsers(); loadFeed(); }} />}
      {viewUser && (
        <ClimbProfileOther profile={viewUser} posts={posts} meId={me.id} following={following.includes(viewUser.id)}
          onToggleFollow={() => toggleFollow(viewUser.id)} onUpdate={updatePost} onOpenCollection={setViewCollection} onClose={() => setViewUser(null)} />
      )}

      {openColId && (() => {
        const col = (me.collections ?? []).find((c) => c.id === openColId);
        if (!col) return null;
        return (
          <CollectionSheet collection={col} posts={posts} ownerPosts={mine} meId={me.id} isOwner isAdmin={isAdmin}
            onAdd={(pid) => toggleInCollection(col.id, pid)} onRemove={(pid) => toggleInCollection(col.id, pid)}
            onRename={(name) => renameCollection(col.id, name)} onSetCover={(url) => setCollectionCover(col.id, url)} onDelete={() => deleteCollection(col.id)}
            onDeletePost={del} onUpdatePost={updatePost} onOpenUser={openUser} onClose={() => setOpenColId(null)} />
        );
      })()}

      {viewCollection && (
        <CollectionSheet collection={viewCollection} posts={posts} ownerPosts={[]} meId={me.id} isOwner={false} isAdmin={isAdmin}
          onAdd={() => {}} onRemove={() => {}} onRename={() => {}} onSetCover={() => {}} onDelete={() => {}}
          onDeletePost={del} onUpdatePost={updatePost} onOpenUser={openUser} onClose={() => setViewCollection(null)} />
      )}

      {creatingCollection && (
        <CreateCollectionSheet ownerPosts={mine} meId={me.id}
          onCreate={(c) => { createCollectionFull(c); setCreatingCollection(false); }}
          onClose={() => setCreatingCollection(false)} />
      )}

      {addFriend && (
        <div className="scrim" onClick={() => setAddFriend(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grip" />
            <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 4px" }}>Add a friend</h2>
            <p className="muted" style={{ textAlign: "center", fontSize: 13, margin: "0 0 14px" }}>Enter their exact @handle to find them.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="@handle" onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }} style={{ flex: 1 }} />
              <button className="btn" style={{ width: "auto", padding: "0 18px" }} onClick={doSearch}>Find</button>
            </div>
            <div style={{ height: 10 }} />
            <button className="btn ghost" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={inviteFriends}><CIcon name="arrow" size={16} /> Invite friends with a link</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={() => setAddFriend(false)}>Cancel</button>
          </div>
        </div>
      )}

      {addToColPost && (
        <AddToCollectionSheet post={addToColPost} collections={me.collections ?? []}
          onToggle={(colId) => toggleInCollection(colId, addToColPost.id)}
          onCreate={(name) => { createCollection(name, addToColPost.id); setAddToColPost(null); }}
          onClose={() => setAddToColPost(null)} />
      )}

      {viewRoute && (
        <div className="scrim" onClick={() => setViewRoute(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grip" />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span className="chip" style={{ background: colorHex(viewRoute.color), color: colorText(viewRoute.color), textShadow: viewRoute.color === "white" || viewRoute.color === "yellow" ? "none" : "0 1px 2px rgba(0,0,0,.4)" }}>{viewRoute.grade === 0 ? "Unrated" : `V${viewRoute.grade}`}</span>
              <div className="display" style={{ fontSize: 20, flex: 1 }}>{viewRoute.wall}</div>
            </div>
            <p className="muted" style={{ fontSize: 12.5, margin: "0 0 10px" }}>set by {viewRoute.setters.join(", ")}</p>

            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewRoute.photoUrl} alt="route" style={{ width: "100%", display: "block" }} />
              {viewRoute.holds.map((h, i) => <HoldCallout key={i} hold={h} size="sm" />)}
            </div>

            {viewRoute.grade === 0 && (
              <div className="card" style={{ padding: 12, marginTop: 12, background: "var(--tint)", border: "none" }}>
                <div className="label" style={{ marginBottom: 8 }}>
                  Unrated · suggest a grade{suggestedGrade(viewRoute) ? ` — climbers say ~V${suggestedGrade(viewRoute)}` : ""}
                </div>
                <div className="seg">
                  {[1, 2, 3, 4, 5, 6].map((g) => {
                    const picked = (viewRoute.suggestions ?? {})[me.id] === g;
                    return <button key={g} className={"chip" + (picked ? " on" : "")} style={{ flex: 1 }} onClick={() => suggestGrade(viewRoute.id, g)}>V{g}</button>;
                  })}
                </div>
              </div>
            )}

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
            <button className="btn green" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={() => { const r = viewRoute; setViewRoute(null); setStartRoute(r); setRecording(true); }}><CIcon name="play" size={16} /> Start Climb</button>
            {(viewRoute.createdBy === me.id || isAdmin) && (
              <>
                <div style={{ height: 8 }} />
                <button className="btn" style={{ background: "var(--accent-d)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={() => delRoute(viewRoute.id)}><CIcon name="x" size={16} /> Delete route</button>
              </>
            )}
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={() => setViewRoute(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClimbProfileView({ profile, mine, maxGrade, meId, isAdmin, onSave, onSignOut, onEdit, onDeletePost, onUpdatePost, onOpenCollection, onNewCollection, onAddToCollection }: {
  profile: ClimbProfile; mine: ClimbPost[]; maxGrade: number; meId: string; isAdmin: boolean;
  onSave: (p: ClimbProfile) => void; onSignOut: () => void; onEdit: () => void;
  onDeletePost: (id: string) => void; onUpdatePost: (p: ClimbPost) => void;
  onOpenCollection: (c: ClimbCollection) => void; onNewCollection: () => void; onAddToCollection: (p: ClimbPost) => void;
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
      <WallBoard profile={profile} editable onSave={saveWall} onEditProfile={onEdit} />

      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <div className="card" style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span className="display" style={{ color: "var(--accent)", fontSize: 22 }}>V{v}</span>
          <span style={{ fontWeight: 800, fontSize: 14 }}>{tier}</span>
        </div>
        <div className="card" style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span className="display" style={{ color: "var(--accent)", fontSize: 22 }}>{mine.length}</span>
          <span className="label">Climbs</span>
        </div>
      </div>

      <CollectionsBar collections={profile.collections ?? []} posts={mine} isOwner onOpen={onOpenCollection} onNew={onNewCollection} />

      <div className="label" style={{ margin: "22px 2px 10px" }}>Your climbs</div>
      {mine.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 16 }}>No climbs yet.</p>}
      {mine.map((p) => <ClimbCard key={p.id} post={p} meId={meId} canDelete={p.userId === meId || isAdmin} onDelete={() => onDeletePost(p.id)} onUpdate={onUpdatePost} onAddToCollection={() => onAddToCollection(p)} />)}

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
