"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Badge from "./Badge";
import Avatar from "./Avatar";
import type { UserProfile, Post, Challenge, SashLayout } from "@/lib/types";

const BADGE = 58;

export interface SashTheme { name: string; bg: string; band: string; fg: string; sub: string; }
export const SASH_THEMES: Record<string, SashTheme> = {
  forest: { name: "Forest", fg: "#fff", sub: "rgba(255,255,255,.8)",
    bg: "linear-gradient(160deg,#2f5d45,#23433a)", band: "linear-gradient(180deg,#b8902f,#8c6b1f)" },
  midnight: { name: "Midnight", fg: "#fff", sub: "rgba(255,255,255,.78)",
    bg: "linear-gradient(160deg,#1c2540,#0f1626)", band: "linear-gradient(180deg,#9aa7c7,#5a6b88)" },
  crimson: { name: "Crimson", fg: "#fff", sub: "rgba(255,255,255,.82)",
    bg: "linear-gradient(160deg,#6e1f24,#3f1216)", band: "linear-gradient(180deg,#d9a441,#a87a23)" },
  canvas: { name: "Canvas", fg: "#3a2f20", sub: "rgba(58,47,32,.7)",
    bg: "linear-gradient(160deg,#e8dcc0,#d6c39c)", band: "linear-gradient(180deg,#7a4a24,#5a3618)" },
  ranger: { name: "Ranger", fg: "#fff", sub: "rgba(255,255,255,.82)",
    bg: "linear-gradient(160deg,#4a5a32,#2f3a20)", band: "linear-gradient(180deg,#e0613a,#b2451f)" },
  ocean: { name: "Ocean", fg: "#fff", sub: "rgba(255,255,255,.82)",
    bg: "linear-gradient(160deg,#1f5f6e,#123a44)", band: "linear-gradient(180deg,#d9d2b0,#a89f78)" },
};

interface Props {
  profile: UserProfile;
  earned: (Post & { ch: Challenge })[];
  onPick: (ch: Challenge) => void;
  onEditProfile: () => void;
}

// Default position (0..1 fractions); badges start below the profile header.
function defaultPos(i: number): { x: number; y: number; rot: number } {
  const cols = 4;
  return {
    x: 0.15 + (i % cols) * 0.235,
    y: 0.46 + Math.floor(i / cols) * 0.17,
    rot: (i % 3 - 1) * 6,
  };
}

export default function SashBoard({ profile, earned, onPick, onEditProfile }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<SashLayout>({});
  const [style, setStyle] = useState("forest");
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [showThemes, setShowThemes] = useState(false);
  const layoutRef = useRef<SashLayout>({});
  const styleRef = useRef("forest");
  const drag = useRef<{ id: string; moved: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/sash").then((r) => r.json()).then((d) => {
      if (!active) return;
      setLayout(d.layout ?? {}); layoutRef.current = d.layout ?? {};
      setStyle(d.style ?? "forest"); styleRef.current = d.style ?? "forest";
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const save = useCallback(() => {
    fetch("/api/sash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: layoutRef.current, style: styleRef.current }),
    }).catch(() => {});
  }, []);

  function chooseTheme(key: string) {
    setStyle(key); styleRef.current = key; setShowThemes(false); save();
  }

  function onPointerDown(e: React.PointerEvent, id: string, i: number) {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!layout[id]) {
      const p = defaultPos(i);
      const next = { ...layoutRef.current, [id]: p };
      layoutRef.current = next; setLayout(next);
    }
    drag.current = { id, moved: false };
    setDragId(id);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const half = BADGE / 2;
    const x = Math.min(1 - half / rect.width, Math.max(half / rect.width, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1 - half / rect.height, Math.max(half / rect.height, (e.clientY - rect.top) / rect.height));
    drag.current.moved = true;
    const id = drag.current.id;
    const prev = layoutRef.current[id] ?? { x, y, rot: 0 };
    const next = { ...layoutRef.current, [id]: { ...prev, x, y } };
    layoutRef.current = next;
    setLayout(next);
  }

  function onPointerUp(ch: Challenge) {
    const d = drag.current;
    drag.current = null;
    setDragId(null);
    if (!d) return;
    if (d.moved) save();
    else onPick(ch);
  }

  const theme = SASH_THEMES[style] ?? SASH_THEMES.forest;

  return (
    <div
      ref={boxRef}
      className="sashboard"
      style={{ background: theme.bg, color: theme.fg, height: 430 }}
      onPointerMove={onPointerMove}
    >
      {/* diagonal sash band */}
      <div className="sashband" style={{ background: theme.band }} />

      {/* profile header */}
      <div className="sashhead">
        <Avatar name={profile.name} handle={profile.handle} img={profile.avatarUrl} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{ fontSize: 19, color: theme.fg }}>{profile.name}</div>
          <div style={{ fontSize: 12.5, color: theme.sub }}>{profile.handle}</div>
          {profile.bio && <div style={{ fontSize: 12.5, color: theme.sub, marginTop: 2 }}>{profile.bio}</div>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="sashbtn" title="Edit profile" onClick={onEditProfile}>✎</button>
          <button className="sashbtn" title="Customize sash" onClick={() => setShowThemes((s) => !s)}>🎨</button>
        </div>
      </div>

      {showThemes && (
        <div className="sashthemes">
          {Object.entries(SASH_THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => chooseTheme(key)}
              title={t.name}
              style={{ background: t.bg, outline: style === key ? "2px solid #fff" : "1px solid rgba(255,255,255,.4)" }}
            />
          ))}
        </div>
      )}

      {earned.length === 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", color: theme.sub, fontSize: 13, padding: "0 20px" }}>
          Earn a badge and pin it to your sash. Drag to arrange.
        </div>
      ) : (
        earned.map((p, i) => {
          const pp = layout[p.id] ?? defaultPos(i);
          return (
            <div
              key={p.id}
              className={"sashbadge" + (dragId === p.id ? " dragging" : "")}
              style={{ left: `${pp.x * 100}%`, top: `${pp.y * 100}%`, transform: `translate(-50%, -50%) rotate(${pp.rot}deg)`, width: BADGE, height: BADGE }}
              onPointerDown={(e) => onPointerDown(e, p.id, i)}
              onPointerUp={() => onPointerUp(p.ch)}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              {hoverId === p.id && dragId !== p.id && <div className="sashtip">{p.ch.nm}</div>}
              <Badge ch={p.ch} size={BADGE} />
            </div>
          );
        })
      )}
    </div>
  );
}
