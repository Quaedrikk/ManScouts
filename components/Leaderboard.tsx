"use client";
import { useState, useEffect } from "react";
import Avatar from "./Avatar";
import Badge from "./Badge";
import { useCatalog } from "@/lib/catalog";
import type { UserProfile, Post, Challenge } from "@/lib/types";

interface Props {
  posts: Post[];
  profile: UserProfile;
  onOpenProfile: (userId: string) => void;
  onOpenPost: (post: Post) => void;
  onUpdateProfile: (p: UserProfile) => void;
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Fall begins at the autumnal equinox (~Sept 22). A season runs from one
// fall start to the next; the current one ends at the upcoming fall.
const fallStart = (year: number) => new Date(year, 8, 22, 0, 0, 0);

function currentSeason() {
  const now = new Date();
  let end = fallStart(now.getFullYear());
  if (now >= end) end = fallStart(now.getFullYear() + 1);
  const start = fallStart(end.getFullYear() - 1);
  return { start, end, name: `Season ${end.getFullYear()}` };
}

function Countdown({ to }: { to: Date }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const ms = Math.max(0, to.getTime() - now);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cell = (v: number, l: string) => (
    <div style={{ textAlign: "center", minWidth: 46 }}>
      <div className="display" style={{ fontSize: 24, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
        {String(v).padStart(2, "0")}
      </div>
      <div className="label" style={{ color: "rgba(255,255,255,.7)" }}>{l}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {cell(d, "days")}{cell(h, "hrs")}{cell(m, "min")}{cell(s, "sec")}
    </div>
  );
}

interface Item { post: Post; ch: Challenge }
interface Rank {
  userId: string;
  name: string;
  handle: string;
  avatarUrl: string;
  pts: number;
  badges: number;
  items: Item[];
}

const MEDAL = ["#d9a441", "#b8b8c0", "#c9803f"]; // gold / silver / bronze
const RING = (i: number) => (i < 3 ? MEDAL[i] : "rgba(255,255,255,.85)");

// A climber's spot on the slope: more points => higher toward the summit.
function climberPos(pts: number, max: number, i: number) {
  const f = Math.min(1, pts / max);
  const base = { x: 17, y: 83 };
  const peak = { x: 73, y: 21 };
  const x = base.x + (peak.x - base.x) * f;
  const y = base.y + (peak.y - base.y) * f;
  const off = (i % 2 === 0 ? -1 : 1) * Math.min(9, i * 1.6); // de-overlap similar scores
  return { left: `${x + off}%`, top: `${y}%` };
}

function MountainScene({ ranks, meId, onOpenProfile }: { ranks: Rank[]; meId: string; onOpenProfile: (id: string) => void }) {
  const max = ranks[0]?.pts || 1;
  return (
    <div className="lbmtn" style={{ height: 240 }}>
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="lbsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfe0f0" />
            <stop offset="55%" stopColor="#e9d7b8" />
            <stop offset="100%" stopColor="#f3e6c8" />
          </linearGradient>
          <linearGradient id="lbnear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3c6b54" />
            <stop offset="100%" stopColor="#28503e" />
          </linearGradient>
          <linearGradient id="lbfar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7fa6b8" />
            <stop offset="100%" stopColor="#5f8497" />
          </linearGradient>
        </defs>

        <rect width="400" height="240" fill="url(#lbsky)" />

        {/* sun */}
        <circle className="lbsun" cx="324" cy="50" r="24" fill="#ffd98a" />
        <circle className="lbsun" cx="324" cy="50" r="36" fill="#ffd98a" opacity="0.25" />

        {/* drifting clouds */}
        <g className="lbcloud" style={{ animationDuration: "26s" }} opacity="0.85">
          <ellipse cx="60" cy="44" rx="26" ry="10" fill="#fff" />
          <ellipse cx="82" cy="48" rx="18" ry="8" fill="#fff" />
        </g>
        <g className="lbcloud" style={{ animationDuration: "38s", animationDelay: "-10s" }} opacity="0.7">
          <ellipse cx="180" cy="30" rx="22" ry="8" fill="#fff" />
          <ellipse cx="198" cy="34" rx="14" ry="6" fill="#fff" />
        </g>

        {/* far ridge */}
        <path d="M0 170 L70 110 L130 160 L210 96 L280 170 L400 130 L400 240 L0 240 Z" fill="url(#lbfar)" opacity="0.85" />

        {/* near mountain — slope rises left→right to the summit at ~ (296,50) */}
        <path className="lbridge" d="M-20 240 L70 150 L150 188 L296 50 L430 240 Z" fill="url(#lbnear)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />

        {/* snow cap on summit */}
        <path d="M296 50 L318 90 L304 84 L288 98 L276 86 Z" fill="#f4f8fb" />

        {/* summit flag */}
        <line x1="296" y1="50" x2="296" y2="28" stroke="#5a3618" strokeWidth="2.5" strokeLinecap="round" />
        <path className="lbflag" d="M296 29 L316 34 L296 40 Z" fill="#e5552b" />
        <g className="lbshine" style={{ transformOrigin: "296px 28px" }}>
          <path d="M296 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#fff" />
        </g>
      </svg>

      {/* climbers placed by points */}
      {ranks.slice(0, 12).map((r, i) => {
        const p = climberPos(r.pts, max, i);
        const size = i < 3 ? 34 : 26;
        return (
          <div
            key={r.userId}
            title={`${r.name} · ${r.pts} pts`}
            onClick={() => onOpenProfile(r.userId)}
            style={{ position: "absolute", left: p.left, top: p.top, transform: "translate(-50%,-50%)", zIndex: 2, textAlign: "center", cursor: "pointer" }}
          >
            <div style={{ borderRadius: "50%", padding: 2, background: RING(i), boxShadow: r.userId === meId ? "0 0 0 2px var(--accent)" : "0 2px 6px rgba(0,0,0,.3)" }}>
              <Avatar name={r.name} handle={r.handle} img={r.avatarUrl} size={size} />
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.7)", marginTop: 1 }}>
              {r.pts}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Leaderboard({ posts, profile, onOpenProfile, onOpenPost, onUpdateProfile }: Props) {
  const { byId } = useCatalog();
  const season = currentSeason();
  const [openId, setOpenId] = useState<string | null>(null);
  const [featured, setFeatured] = useState<Record<string, string[]>>({});

  // My unique earned badges (for the featured picker shown on my own row).
  const myEarned = Array.from(new Map(
    posts.filter((p) => p.userId === profile.id)
      .map((p) => { const ch = byId(p.challengeId); return ch ? [ch.id, ch] as const : null; })
      .filter(Boolean) as (readonly [string, Challenge])[]
  ).values());
  const myFeatured = profile.featured ?? [];
  function toggleMyFeatured(id: string) {
    const next = myFeatured.includes(id) ? myFeatured.filter((x) => x !== id) : (myFeatured.length >= 3 ? myFeatured : [...myFeatured, id]);
    onUpdateProfile({ ...profile, featured: next });
    setFeatured((prev) => ({ ...prev, [profile.id]: next }));
  }

  // Only count badges earned this season (ranks reset each season).
  const seasonPosts = posts.filter((p) => new Date(p.createdAt) >= season.start);

  const totals = new Map<string, Rank>();
  for (const p of seasonPosts) {
    const ch = byId(p.challengeId);
    if (!ch) continue;
    const cur = totals.get(p.userId) ?? {
      userId: p.userId, name: p.userName, handle: p.userHandle, avatarUrl: p.userAvatarUrl, pts: 0, badges: 0, items: [],
    };
    cur.pts += ch.pts;
    cur.badges += 1;
    cur.items.push({ post: p, ch });
    cur.name = p.userName; cur.avatarUrl = p.userAvatarUrl; cur.handle = p.userHandle;
    totals.set(p.userId, cur);
  }
  const ranks = [...totals.values()].sort((a, b) => b.pts - a.pts || b.badges - a.badges);
  for (const r of ranks) r.items.sort((a, b) => b.ch.pts - a.ch.pts);

  // Fetch each ranked user's featured badges for their leaderboard box.
  const rankIds = ranks.map((r) => r.userId).join(",");
  useEffect(() => {
    const ids = rankIds ? rankIds.split(",") : [];
    if (ids.length === 0) return;
    let active = true;
    Promise.all(ids.map((id) =>
      fetch(`/api/users/${encodeURIComponent(id)}`).then((r) => r.json()).then((d) => [id, d.profile?.featured ?? []] as [string, string[]]).catch(() => [id, []] as [string, string[]])
    )).then((entries) => { if (active) setFeatured(Object.fromEntries(entries)); });
    return () => { active = false; };
  }, [rankIds]);

  return (
    <div>
      <div
        style={{
          borderRadius: 18, padding: "14px 14px", margin: "16px 0 14px", textAlign: "center",
          background: "linear-gradient(135deg, #4a3a6b, #2a2140)",
          boxShadow: "0 8px 22px rgba(42,33,64,.28)",
        }}
      >
        <div className="label" style={{ color: "rgba(255,255,255,.7)", marginBottom: 2 }}>Ranked · {season.name}</div>
        <div className="display" style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>
          Season ends when fall begins
        </div>
        <Countdown to={season.end} />
      </div>

      <div className="display" style={{ fontSize: 26, margin: "4px 2px 4px" }}>Leaderboard</div>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 2px 14px" }}>
        Who&apos;s climbing highest this season. Ranked by points earned.
      </p>

      <MountainScene ranks={ranks} meId={profile.id} onOpenProfile={onOpenProfile} />

      {ranks.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", fontSize: 14, padding: 24 }}>
          No one&apos;s on the board yet. Earn a badge and start the climb.
        </p>
      ) : (
        ranks.map((r, i) => {
          const open = openId === r.userId;
          return (
            <div key={r.userId} style={{ marginBottom: 10 }}>
              <div
                className={"lbrow" + (r.userId === profile.id ? " me" : "")}
                style={{ marginBottom: 0, cursor: "pointer", animationDelay: `${i * 0.04}s` }}
                onClick={() => setOpenId(open ? null : r.userId)}
              >
                {i < 3 ? (
                  <span className="lbmedal" style={{ background: MEDAL[i] }}>{i + 1}</span>
                ) : (
                  <span className="lbrank muted">{i + 1}</span>
                )}
                <div onClick={(e) => { e.stopPropagation(); onOpenProfile(r.userId); }} style={{ cursor: "pointer" }}>
                  <Avatar name={r.name} handle={r.handle} img={r.avatarUrl} size={40} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={(e) => { e.stopPropagation(); onOpenProfile(r.userId); }}
                    style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}
                  >
                    {r.name}{r.userId === profile.id && <span style={{ color: "var(--accent)" }}> · you</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 12.5 }}>
                    {r.badges} badge{r.badges === 1 ? "" : "s"} · tap to see them
                  </div>
                </div>
                {(featured[r.userId]?.length ?? 0) > 0 && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
                    {featured[r.userId].map((cid) => {
                      const fch = byId(cid);
                      if (!fch) return null;
                      const post = r.items.find((it) => it.ch.id === cid)?.post;
                      return (
                        <div
                          key={cid}
                          title={fch.nm}
                          onClick={(e) => { e.stopPropagation(); if (post) onOpenPost(post); }}
                          style={{ cursor: post ? "pointer" : "default" }}
                        >
                          <Badge ch={fch} size={42} />
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="display" style={{ fontSize: 19, color: "var(--accent)" }}>{r.pts}</div>
                  <div className="label">pts</div>
                </div>
                <span style={{ marginLeft: 6, color: "var(--muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
              </div>

              {open && (
                <div className="card" style={{ padding: "6px 10px", marginTop: 4, borderRadius: 14 }}>
                  {r.userId === profile.id && myEarned.length > 0 && (
                    <div style={{ padding: "6px 4px 10px", borderBottom: "1px solid var(--line)", marginBottom: 4 }}>
                      <div className="label" style={{ marginBottom: 8 }}>Featured on leaderboard ({myFeatured.length}/3)</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {myEarned.map((ch) => {
                          const on = myFeatured.includes(ch.id);
                          return (
                            <div key={ch.id} onClick={() => toggleMyFeatured(ch.id)} title={ch.nm}
                              style={{ cursor: "pointer", opacity: on ? 1 : 0.45, position: "relative" }}>
                              <Badge ch={ch} size={40} />
                              {on && <span style={{ position: "absolute", top: -3, right: -3, width: 15, height: 15, borderRadius: "50%", background: "var(--gold)", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>★</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {r.items.map((it, k) => (
                    <button
                      key={k}
                      onClick={() => onOpenPost(it.post)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 4px",
                        borderBottom: k < r.items.length - 1 ? "1px solid var(--line)" : "none",
                        background: "none", border: "none", cursor: "pointer", textAlign: "left",
                      }}
                    >
                      <Badge ch={it.ch} size={30} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.ch.nm}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>{fmtDay(it.post.createdAt)}</div>
                      </div>
                      <span style={{ fontWeight: 800, color: "var(--accent)", fontSize: 13 }}>{it.ch.pts} pts</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
