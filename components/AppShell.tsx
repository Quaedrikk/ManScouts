"use client";
import { useState, useEffect, useCallback } from "react";
import Ico from "./Ico";
import Board from "./Board";
import Trail from "./Trail";
import Sash from "./Sash";
import WitnessPage from "./WitnessPage";
import Detail from "./Detail";
import EarnFlow from "./EarnFlow";
import Unlock from "./Unlock";
import Onboard from "./Onboard";
import type { UserProfile, Post, Challenge } from "@/lib/types";
import { byId } from "@/lib/challenges";

const TABS = [
  { id: "board", ico: "board", label: "Board" },
  { id: "trail", ico: "mountain", label: "Trail" },
  { id: "sash", ico: "pack", label: "Sash" },
  { id: "witness", ico: "hands", label: "Witness" },
];

export default function AppShell() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cheers, setCheers] = useState<Record<string, boolean>>({});
  const [cheerCounts, setCheerCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState("board");
  const [detail, setDetail] = useState<Challenge | null>(null);
  const [earn, setEarn] = useState<Challenge | null>(null);
  const [unlock, setUnlock] = useState<Challenge | null>(null);
  const [editing, setEditing] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts ?? []);
      setCheerCounts(data.cheerCounts ?? {});
    } catch { /* network error, ignore */ }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("ms:profile");
    if (raw) setProfile(JSON.parse(raw));
    const ch = localStorage.getItem("ms:cheers");
    if (ch) setCheers(JSON.parse(ch));
    loadFeed().finally(() => setReady(true));
  }, [loadFeed]);

  const earnedIds = new Set(posts.filter((p) => p.userId === profile?.id).map((p) => p.challengeId));
  const totalPts = posts.filter((p) => p.userId === profile?.id).reduce((s, p) => s + (byId(p.challengeId)?.pts ?? 0), 0);

  async function saveProfile(pf: UserProfile) {
    setProfile(pf);
    localStorage.setItem("ms:profile", JSON.stringify(pf));
  }

  async function toggleCheer(postId: string) {
    if (!profile) return;
    const next = { ...cheers, [postId]: !cheers[postId] };
    setCheers(next);
    localStorage.setItem("ms:cheers", JSON.stringify(next));
    try {
      const res = await fetch(`/api/cheers/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id }),
      });
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
    witnessName: string,
    witnessHandle: string,
    note: string
  ) {
    if (!profile) return;
    const post: Omit<Post, "cheerCount"> = {
      id: `p${Date.now()}`,
      userId: profile.id,
      userName: profile.name,
      userHandle: profile.handle,
      userAvatarUrl: profile.avatarUrl,
      challengeId,
      proofUrl,
      proofType,
      place,
      note,
      witnessName,
      witnessHandle,
      createdAt: new Date().toISOString(),
    };
    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
    } catch { /* will still show unlock */ }
    setPosts((prev) => [{ ...post, cheerCount: 0 }, ...prev]);
    setEarn(null);
    setUnlock(byId(challengeId) ?? null);
  }

  if (!ready) {
    return <div style={{ padding: 80, textAlign: "center" }} className="display muted">Loading…</div>;
  }
  if (!profile) {
    return <Onboard onDone={saveProfile} />;
  }

  return (
    <div>
      <div className="topbar">
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
            goTrail={() => setTab("trail")}
          />
        )}
        {tab === "trail" && (
          <Trail earnedIds={earnedIds} onPick={setDetail} />
        )}
        {tab === "sash" && (
          <Sash
            profile={profile}
            posts={posts.filter((p) => p.userId === profile.id)}
            totalPts={totalPts}
            onEdit={() => setEditing(true)}
            onPick={setDetail}
          />
        )}
        {tab === "witness" && <WitnessPage />}
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
              color: tab === t.id ? "var(--ink)" : "var(--muted)",
              fontWeight: 700, fontSize: 10, letterSpacing: ".02em",
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "5px 12px", cursor: "pointer",
            }}
          >
            <span style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ico name={t.ico} stroke={tab === t.id ? "var(--ink)" : "var(--muted)"} />
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
    </div>
  );
}
