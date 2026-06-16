"use client";
import { useState, useEffect } from "react";
import Avatar from "./Avatar";
import { useCatalog } from "@/lib/catalog";
import type { UserProfile, Post } from "@/lib/types";

interface Props {
  posts: Post[];
  profile: UserProfile;
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

interface Rank {
  userId: string;
  name: string;
  handle: string;
  avatarUrl: string;
  pts: number;
  badges: number;
}

const MEDAL = ["#d9a441", "#b8b8c0", "#c9803f"]; // gold / silver / bronze

function MountainScene() {
  return (
    <div className="lbmtn">
      <svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="lbsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfe0f0" />
            <stop offset="55%" stopColor="#e9d7b8" />
            <stop offset="100%" stopColor="#f3e6c8" />
          </linearGradient>
          <linearGradient id="lbfar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7fa6b8" />
            <stop offset="100%" stopColor="#5f8497" />
          </linearGradient>
          <linearGradient id="lbnear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3c6b54" />
            <stop offset="100%" stopColor="#28503e" />
          </linearGradient>
        </defs>

        <rect width="400" height="200" fill="url(#lbsky)" />

        {/* sun */}
        <circle className="lbsun" cx="312" cy="58" r="26" fill="#ffd98a" />
        <circle className="lbsun" cx="312" cy="58" r="38" fill="#ffd98a" opacity="0.25" />

        {/* drifting clouds */}
        <g className="lbcloud" style={{ animationDuration: "26s" }} opacity="0.85">
          <ellipse cx="60" cy="46" rx="26" ry="10" fill="#fff" />
          <ellipse cx="82" cy="50" rx="18" ry="8" fill="#fff" />
        </g>
        <g className="lbcloud" style={{ animationDuration: "38s", animationDelay: "-10s" }} opacity="0.7">
          <ellipse cx="180" cy="34" rx="22" ry="8" fill="#fff" />
          <ellipse cx="198" cy="38" rx="14" ry="6" fill="#fff" />
        </g>

        {/* far ridge */}
        <path d="M0 150 L70 96 L120 140 L190 80 L250 150 L400 110 L400 200 L0 200 Z" fill="url(#lbfar)" opacity="0.85" />

        {/* near mountain */}
        <path className="lbridge" d="M-10 200 L120 70 L210 130 L300 60 L420 200 Z" fill="url(#lbnear)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />

        {/* snow caps */}
        <path d="M120 70 L138 96 L128 92 L112 104 L102 96 Z" fill="#f4f8fb" />
        <path d="M300 60 L320 92 L308 86 L292 100 L282 90 Z" fill="#f4f8fb" />

        {/* summit flag */}
        <line x1="300" y1="60" x2="300" y2="40" stroke="#5a3618" strokeWidth="2.5" strokeLinecap="round" />
        <path className="lbflag" d="M300 41 L320 46 L300 52 Z" fill="#e5552b" />
        {/* sparkle */}
        <g className="lbshine" style={{ transformOrigin: "300px 40px" }}>
          <path d="M300 32 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#fff" />
        </g>
      </svg>
    </div>
  );
}

export default function Leaderboard({ posts, profile }: Props) {
  const { byId } = useCatalog();
  const season = currentSeason();

  // Only count badges earned this season (ranks reset each season).
  const seasonPosts = posts.filter((p) => new Date(p.createdAt) >= season.start);

  const totals = new Map<string, Rank>();
  for (const p of seasonPosts) {
    const ch = byId(p.challengeId);
    if (!ch) continue;
    const cur = totals.get(p.userId) ?? {
      userId: p.userId, name: p.userName, handle: p.userHandle, avatarUrl: p.userAvatarUrl, pts: 0, badges: 0,
    };
    cur.pts += ch.pts;
    cur.badges += 1;
    cur.name = p.userName; cur.avatarUrl = p.userAvatarUrl; cur.handle = p.userHandle;
    totals.set(p.userId, cur);
  }
  const ranks = [...totals.values()].sort((a, b) => b.pts - a.pts || b.badges - a.badges);

  return (
    <div>
      <div className="display" style={{ fontSize: 26, margin: "18px 2px 4px" }}>Leaderboard</div>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 2px 14px" }}>
        Who&apos;s climbing highest this season. Ranked by points earned.
      </p>

      <MountainScene />

      <div
        style={{
          borderRadius: 18, padding: "16px 14px", margin: "0 0 18px", textAlign: "center",
          background: "linear-gradient(135deg, #4a3a6b, #2a2140)",
          boxShadow: "0 8px 22px rgba(42,33,64,.28)",
        }}
      >
        <div className="label" style={{ color: "rgba(255,255,255,.7)", marginBottom: 2 }}>Ranked · {season.name}</div>
        <div className="display" style={{ color: "#fff", fontSize: 17, marginBottom: 12 }}>
          Season ends when fall begins
        </div>
        <Countdown to={season.end} />
      </div>

      {ranks.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", fontSize: 14, padding: 24 }}>
          No one&apos;s on the board yet. Earn a badge and start the climb.
        </p>
      ) : (
        ranks.map((r, i) => (
          <div
            key={r.userId}
            className={"lbrow" + (r.userId === profile.id ? " me" : "")}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            {i < 3 ? (
              <span className="lbmedal" style={{ background: MEDAL[i] }}>{i + 1}</span>
            ) : (
              <span className="lbrank muted">{i + 1}</span>
            )}
            <Avatar name={r.name} handle={r.handle} img={r.avatarUrl} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.name}{r.userId === profile.id && <span style={{ color: "var(--accent)" }}> · you</span>}
              </div>
              <div className="muted" style={{ fontSize: 12.5 }}>{r.badges} badge{r.badges === 1 ? "" : "s"}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div className="display" style={{ fontSize: 19, color: "var(--accent)" }}>{r.pts}</div>
              <div className="label">pts</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
