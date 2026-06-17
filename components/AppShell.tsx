"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Ico from "./Ico";
import Board from "./Board";
import Trail from "./Trail";
import Sash from "./Sash";
import Detail from "./Detail";
import EarnFlow from "./EarnFlow";
import Unlock from "./Unlock";
import Onboard from "./Onboard";
import AdminPanel from "./AdminPanel";
import Leaderboard from "./Leaderboard";
import ProfileView from "./ProfileView";
import SquadView from "./SquadView";
import type { UserProfile, Post, Challenge } from "@/lib/types";
import { useCatalog } from "@/lib/catalog";

const TABS = [
  { id: "board", ico: "board", label: "Board" },
  { id: "trail", ico: "mountain", label: "Passages" },
  { id: "rank", ico: "trophy", label: "Ranks" },
  { id: "sash", ico: "pack", label: "Sash" },
];

export default function AppShell() {
  const { data: session, status } = useSession();
  const { byId, isAdmin } = useCatalog();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cheers, setCheers] = useState<Record<string, boolean>>({});
  const [cheerCounts, setCheerCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState("board");
  const [detail, setDetail] = useState<Challenge | null>(null);
  const [earn, setEarn] = useState<Challenge | null>(null);
  const [unlock, setUnlock] = useState<Challenge | null>(null);
  const [editing, setEditing] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [viewUser, setViewUser] = useState<string | null>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [viewSquad, setViewSquad] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts ?? []);
      setCheerCounts(data.cheerCounts ?? {});
    } catch { /* network error, ignore */ }
  }, []);

  // Public feed loads for everyone.
  useEffect(() => {
    const ch = localStorage.getItem("ms:cheers");
    if (ch) setCheers(JSON.parse(ch));
    loadFeed();
  }, [loadFeed]);

  // Once signed in, fetch this account's server-side profile.
  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") setProfileLoaded(true);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (active) setProfile(data.profile ?? null);
        }
      } catch { /* ignore */ }
      finally {
        if (active) setProfileLoaded(true);
      }
    })();
    return () => { active = false; };
  }, [status]);

  const earnedIds = new Set(posts.filter((p) => p.userId === profile?.id).map((p) => p.challengeId));
  const totalPts = posts.filter((p) => p.userId === profile?.id).reduce((s, p) => s + (byId(p.challengeId)?.pts ?? 0), 0);

  async function saveProfile(pf: UserProfile) {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pf),
      });
      if (!res.ok) { alert("Couldn't save profile — try again."); return; }
      const data = await res.json();
      setProfile(data.profile);
    } catch {
      alert("Couldn't save profile — try again.");
    }
  }

  async function reloadProfile() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) { const data = await res.json(); setProfile(data.profile ?? null); }
    } catch { /* ignore */ }
  }

  async function deletePost(postId: string) {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await fetch(`/api/posts?id=${encodeURIComponent(postId)}`, { method: "DELETE" });
    } catch { /* ignore; already removed locally */ }
  }

  async function toggleCheer(postId: string) {
    if (!profile) return;
    const next = { ...cheers, [postId]: !cheers[postId] };
    setCheers(next);
    localStorage.setItem("ms:cheers", JSON.stringify(next));
    try {
      const res = await fetch(`/api/cheers/${postId}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCheerCounts((prev) => ({ ...prev, [postId]: data.count }));
      }
    } catch { /* ignore */ }
  }

  async function commitBadge(
    challengeId: string,
    proofUrl: string,
    proofType: "photo" | "video",
    place: string,
    witnessToken: string,
    note: string,
    lat?: number,
    lng?: number,
    adminSkip?: boolean
  ) {
    if (!profile) return;
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId, proofUrl, proofType, place, lat, lng, note, witnessToken, adminSkip,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Use the server's post (canonical id + server-derived identity).
        if (data.post) setPosts((prev) => [data.post as Post, ...prev]);
      }
    } catch { /* will still show unlock */ }
    setEarn(null);
    setUnlock(byId(challengeId) ?? null);
  }

  if (status === "loading" || !profileLoaded) {
    return <div style={{ padding: 80, textAlign: "center" }} className="display muted">Loading…</div>;
  }

  if (status !== "authenticated") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div className="mark" style={{ width: 64, height: 64, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <svg width="34" height="34" viewBox="0 0 100 100">
            <g fill="none" stroke="#fff" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
              <path d="M16 78 L42 30 L58 56 L72 38 L88 78 Z" />
            </g>
          </svg>
        </div>
        <h1 className="display" style={{ fontSize: 30, margin: "0 0 6px" }}>
          Man<span style={{ color: "var(--accent)" }}>Scouts</span>
        </h1>
        <p className="muted" style={{ fontSize: 15, maxWidth: 280, margin: "0 0 26px" }}>
          Earn badges. Do real things. Prove it.
        </p>
        <button className="btn" style={{ maxWidth: 320 }} onClick={() => signIn("google")}>
          Continue with Google
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <Onboard
        onDone={saveProfile}
        defaults={{
          id: session?.user?.id,
          name: session?.user?.name ?? "",
          avatarUrl: session?.user?.image ?? "",
        }}
      />
    );
  }

  return (
    <div>
      <div className="topbar">
        <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
          <div className="row">
            <div className="mark">
              <svg width="18" height="18" viewBox="0 0 100 100">
                <g fill="none" stroke="#fff" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
                  <path d="M16 78 L42 30 L58 56 L72 38 L88 78 Z" />
                </g>
              </svg>
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-.03em" }}>
              Man<span style={{ color: "var(--accent)" }}>Scouts</span>
            </h1>
          </div>
          <div className="row" style={{ gap: 14 }}>
            {isAdmin && (
              <button
                onClick={() => setAdminOpen(true)}
                className="label"
                style={{ background: "none", border: "none", color: "var(--brown)", cursor: "pointer", fontWeight: 700 }}
              >
                + Create
              </button>
            )}
            <button
              onClick={() => signOut()}
              className="label"
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontWeight: 700 }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "0 18px 120px" }}>
        {tab === "board" && (
          <Board
            profile={profile}
            posts={posts}
            cheers={cheers}
            cheerCounts={cheerCounts}
            onCheer={toggleCheer}
            onPick={setDetail}
            onDelete={deletePost}
            onOpenProfile={setViewUser}
            onOpenSquad={setViewSquad}
            goTrail={() => setTab("trail")}
          />
        )}
        {tab === "trail" && (
          <Trail earnedIds={earnedIds} onPick={setDetail} />
        )}
        {tab === "rank" && <Leaderboard posts={posts} profile={profile} onOpenProfile={setViewUser} onOpenPost={setViewPost} onUpdateProfile={saveProfile} />}
        {tab === "sash" && (
          <Sash
            profile={profile}
            posts={posts.filter((p) => p.userId === profile.id)}
            totalPts={totalPts}
            onEdit={() => setEditing(true)}
            onPick={setDetail}
            onDelete={deletePost}
            onUpdateProfile={saveProfile}
            onReloadProfile={reloadProfile}
            onOpenSquad={setViewSquad}
          />
        )}
      </div>

      <nav style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40,
        background: "rgba(255,255,255,.9)", backdropFilter: "blur(14px)",
        borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-around",
        padding: "8px 4px calc(env(safe-area-inset-bottom) + 8px)",
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none",
              color: tab === t.id ? "var(--brown)" : "var(--brown-soft)",
              fontWeight: 700, fontSize: 10, letterSpacing: ".02em",
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "5px 12px", cursor: "pointer",
            }}
          >
            <span style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ico name={t.ico} stroke={tab === t.id ? "var(--brown)" : "var(--brown-soft)"} />
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      {detail && (
        <Detail
          ch={detail}
          earned={earnedIds.has(detail.id)}
          post={posts.find((p) => p.userId === profile.id && p.challengeId === detail.id)}
          onClose={() => setDetail(null)}
          onStart={() => { setEarn(detail); setDetail(null); }}
        />
      )}
      {viewPost && byId(viewPost.challengeId) && (
        <Detail
          ch={byId(viewPost.challengeId)!}
          earned
          post={viewPost}
          onClose={() => setViewPost(null)}
          onStart={() => setViewPost(null)}
        />
      )}
      {earn && (
        <EarnFlow ch={earn} onCancel={() => setEarn(null)} onCommit={commitBadge} />
      )}
      {unlock && (
        <Unlock ch={unlock} onClose={() => { setUnlock(null); setTab("board"); }} />
      )}
      {editing && (
        <Onboard
          initial={profile}
          onDone={(p) => { saveProfile(p); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      )}
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
      {viewUser && (
        <ProfileView
          userId={viewUser}
          posts={posts}
          onClose={() => setViewUser(null)}
          onPick={(ch) => { setViewUser(null); setDetail(ch); }}
          onOpenSquad={(id) => { setViewUser(null); setViewSquad(id); }}
        />
      )}
      {viewSquad && (
        <SquadView
          squadId={viewSquad}
          currentUserId={profile.id}
          onClose={() => setViewSquad(null)}
          onOpenProfile={(id) => { setViewSquad(null); setViewUser(id); }}
          onReloadProfile={reloadProfile}
        />
      )}
    </div>
  );
}
