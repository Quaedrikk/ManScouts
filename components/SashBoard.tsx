"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { BASE_PATH } from "@/lib/basePath";
import Badge from "./Badge";
import Avatar from "./Avatar";
import CoatOfArms from "./CoatOfArms";
import SashScene from "./SashScene";
import { useCatalog } from "@/lib/catalog";
import type { UserProfile, Post, Challenge, SashLayout, SquadBadge } from "@/lib/types";

const BADGE = 54;

export interface SashTheme { name: string; bg: string; band: string; fg: string; sub: string; lockCat?: string; scene?: string; }
export const SASH_THEMES: Record<string, SashTheme> = {
  forest: { name: "Forest", fg: "#fff", sub: "rgba(255,255,255,.8)", bg: "linear-gradient(160deg,#2f5d45,#23433a)", band: "linear-gradient(180deg,#b8902f,#8c6b1f)" },
  midnight: { name: "Midnight", fg: "#fff", sub: "rgba(255,255,255,.78)", bg: "linear-gradient(160deg,#1c2540,#0f1626)", band: "linear-gradient(180deg,#9aa7c7,#5a6b88)" },
  crimson: { name: "Crimson", fg: "#fff", sub: "rgba(255,255,255,.82)", bg: "linear-gradient(160deg,#6e1f24,#3f1216)", band: "linear-gradient(180deg,#d9a441,#a87a23)" },
  canvas: { name: "Canvas", fg: "#3a2f20", sub: "rgba(58,47,32,.7)", bg: "linear-gradient(160deg,#e8dcc0,#d6c39c)", band: "linear-gradient(180deg,#7a4a24,#5a3618)" },
  ranger: { name: "Ranger", fg: "#fff", sub: "rgba(255,255,255,.82)", bg: "linear-gradient(160deg,#4a5a32,#2f3a20)", band: "linear-gradient(180deg,#e0613a,#b2451f)" },
  ocean: { name: "Ocean", fg: "#fff", sub: "rgba(255,255,255,.82)", bg: "linear-gradient(160deg,#1f5f6e,#123a44)", band: "linear-gradient(180deg,#d9d2b0,#a89f78)" },
  slate: { name: "Slate", fg: "#fff", sub: "rgba(255,255,255,.78)", bg: "linear-gradient(160deg,#3a4452,#222932)", band: "linear-gradient(180deg,#c9cfd8,#8a929c)" },
  rose: { name: "Rose", fg: "#fff", sub: "rgba(255,255,255,.85)", bg: "linear-gradient(160deg,#a3486a,#6e2b46)", band: "linear-gradient(180deg,#ffd9a8,#e0a36a)" },
  royal: { name: "Royal", fg: "#fff", sub: "rgba(255,255,255,.82)", bg: "linear-gradient(160deg,#3a2f6e,#221a45)", band: "linear-gradient(180deg,#e8c64b,#b8932a)" },
  obsidian: { name: "Obsidian", fg: "#fff", sub: "rgba(255,255,255,.7)", bg: "linear-gradient(160deg,#15161a,#000)", band: "linear-gradient(180deg,#e5552b,#a8381a)" },
  // Category-locked: need 5 badges in that category.
  hooligan: { name: "Hooligan", lockCat: "Hooligan", scene: "night", fg: "#fff", sub: "rgba(255,255,255,.85)", bg: "linear-gradient(160deg,#7a1f33,#2a0a14)", band: "linear-gradient(180deg,#b5384d,#7a2030)" },
  angler: { name: "Angler", lockCat: "Angler", scene: "ocean", fg: "#fff", sub: "rgba(255,255,255,.85)", bg: "linear-gradient(160deg,#2f86a8,#0f3346)", band: "linear-gradient(180deg,#d9e7ef,#9fc2d4)" },
  wildernessTheme: { name: "Wild", lockCat: "Wilderness", scene: "forest", fg: "#fff", sub: "rgba(255,255,255,.85)", bg: "linear-gradient(160deg,#2f6a44,#11301f)", band: "linear-gradient(180deg,#cdebcf,#8fc79a)" },
  greenthumb: { name: "Green Thumb", lockCat: "Green Thumb", scene: "meadow", fg: "#fff", sub: "rgba(255,255,255,.85)", bg: "linear-gradient(160deg,#5a9a3c,#244016)", band: "linear-gradient(180deg,#e3f0a8,#aacf6a)" },
  nomad: { name: "Nomad", lockCat: "Nomad", scene: "desert", fg: "#3a2f20", sub: "rgba(58,47,32,.7)", bg: "linear-gradient(160deg,#f0cd92,#c48a3a)", band: "linear-gradient(180deg,#7a4a24,#5a3618)" },
  samaritan: { name: "Samaritan", lockCat: "Samaritan", scene: "meadow", fg: "#fff", sub: "rgba(255,255,255,.85)", bg: "linear-gradient(160deg,#2f8f8a,#16504d)", band: "linear-gradient(180deg,#fff,#cfe9e7)" },
  courageTheme: { name: "Courage", lockCat: "Courage", scene: "volcano", fg: "#fff", sub: "rgba(255,255,255,.85)", bg: "linear-gradient(160deg,#c0461f,#4e1a0a)", band: "linear-gradient(180deg,#ffd98a,#e0a847)" },
  adventureTheme: { name: "Adventure", lockCat: "Adventure", scene: "mountains", fg: "#fff", sub: "rgba(255,255,255,.85)", bg: "linear-gradient(160deg,#7fa6b8,#3e5a68)", band: "linear-gradient(180deg,#f0d8a8,#c9a36a)" },
  urbanist: { name: "Urbanist", lockCat: "Urbanist", scene: "city", fg: "#fff", sub: "rgba(255,255,255,.8)", bg: "linear-gradient(160deg,#56636f,#252c33)", band: "linear-gradient(180deg,#aab4be,#76808a)" },
  athlete: { name: "Athlete", lockCat: "Athlete", scene: "track", fg: "#fff", sub: "rgba(255,255,255,.85)", bg: "linear-gradient(160deg,#3a4ad9,#1f2680)", band: "linear-gradient(180deg,#ffe14d,#e0b020)" },
};
const NEED = 5;

interface Props {
  profile: UserProfile;
  earned: (Post & { ch: Challenge })[];
  onPick: (ch: Challenge) => void;
  onEditProfile?: () => void;
  readOnly?: boolean;
  sash?: { layout: SashLayout; style: string };
  squad?: SquadBadge | null;
  onOpenSquad?: (id: string) => void;
  onAddSquad?: () => void;
}

function defaultPos(i: number): { x: number; y: number; rot: number } {
  const cols = 4;
  return { x: 0.14 + (i % cols) * 0.24, y: 0.5 + Math.floor(i / cols) * 0.2, rot: (i % 3 - 1) * 6 };
}

export default function SashBoard({ profile, earned, onPick, onEditProfile, readOnly, sash, squad, onOpenSquad, onAddSquad }: Props) {
  const { isAdmin } = useCatalog();
  const boxRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<SashLayout>(sash?.layout ?? {});
  const [style, setStyle] = useState(sash?.style ?? "forest");
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [showThemes, setShowThemes] = useState(false);
  const layoutRef = useRef<SashLayout>(sash?.layout ?? {});
  const styleRef = useRef(sash?.style ?? "forest");
  const drag = useRef<{ id: string; moved: boolean } | null>(null);

  // Earned count per category, for unlocking category sash themes.
  const byCat: Record<string, number> = {};
  for (const p of earned) byCat[p.ch.cat] = (byCat[p.ch.cat] ?? 0) + 1;
  const unlocked = (t: SashTheme) => isAdmin || !t.lockCat || (byCat[t.lockCat] ?? 0) >= NEED;

  useEffect(() => {
    if (readOnly) {
      setLayout(sash?.layout ?? {}); layoutRef.current = sash?.layout ?? {};
      setStyle(sash?.style ?? "forest"); styleRef.current = sash?.style ?? "forest";
      return;
    }
    let active = true;
    fetch(`${BASE_PATH}/api/sash`).then((r) => r.json()).then((d) => {
      if (!active) return;
      setLayout(d.layout ?? {}); layoutRef.current = d.layout ?? {};
      setStyle(d.style ?? "forest"); styleRef.current = d.style ?? "forest";
    }).catch(() => {});
    return () => { active = false; };
  }, [readOnly, sash]);

  const save = useCallback(() => {
    if (readOnly) return;
    fetch(`${BASE_PATH}/api/sash`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ layout: layoutRef.current, style: styleRef.current }) }).catch(() => {});
  }, [readOnly]);

  function chooseTheme(key: string, t: SashTheme) {
    if (!unlocked(t)) { alert(`Locked — earn ${NEED} ${t.lockCat} badges to unlock the ${t.name} sash.`); return; }
    setStyle(key); styleRef.current = key; setShowThemes(false); save();
  }

  function onPointerDown(e: React.PointerEvent, id: string, i: number) {
    if (!readOnly) {
      e.currentTarget.setPointerCapture(e.pointerId);
      if (!layout[id]) { const p = defaultPos(i); const next = { ...layoutRef.current, [id]: p }; layoutRef.current = next; setLayout(next); }
    }
    drag.current = { id, moved: false };
    setDragId(id);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (readOnly || !drag.current || !boxRef.current) return;
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
    const d = drag.current; drag.current = null; setDragId(null);
    if (!d) return;
    if (d.moved) save(); else onPick(ch);
  }

  const theme = SASH_THEMES[style] ?? SASH_THEMES.forest;

  return (
    <div ref={boxRef} className="sashboard" style={{ background: theme.bg, color: theme.fg, height: 300 }} onPointerMove={onPointerMove}>
      <SashScene scene={theme.scene} />
      <div className="sashband" style={{ background: theme.band }} />

      <div className="sashhead">
        <Avatar name={profile.name} handle={profile.handle} img={profile.avatarUrl} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="display" style={{ fontSize: 18, color: theme.fg }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: theme.sub }}>{profile.handle}</div>
          {profile.bio && <div style={{ fontSize: 12, color: theme.sub, marginTop: 2 }}>{profile.bio}</div>}
        </div>
        {!readOnly && (
          <div style={{ display: "flex", gap: 6 }}>
            {onEditProfile && <button className="sashbtn" title="Edit profile" onClick={onEditProfile}>✎</button>}
            <button className="sashbtn" title="Customize sash" onClick={() => setShowThemes((s) => !s)}>🎨</button>
          </div>
        )}
      </div>

      {!readOnly && showThemes && (
        <div className="sashthemes">
          {Object.entries(SASH_THEMES).map(([key, t]) => {
            const open = unlocked(t);
            return (
              <button key={key} onClick={() => chooseTheme(key, t)} title={open ? t.name : `${t.name} — locked`}
                style={{ background: t.bg, outline: style === key ? "2px solid #fff" : "1px solid rgba(255,255,255,.4)", position: "relative", opacity: open ? 1 : 0.45 }}>
                {!open && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🔒</span>}
              </button>
            );
          })}
        </div>
      )}

      {earned.length === 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: "52%", textAlign: "center", color: theme.sub, fontSize: 13, padding: "0 20px" }}>
          Earn a badge and pin it to your sash.
        </div>
      ) : (
        earned.map((p, i) => {
          const pp = layout[p.id] ?? defaultPos(i);
          return (
            <div key={p.id} className={"sashbadge" + (dragId === p.id ? " dragging" : "")}
              style={{ left: `${pp.x * 100}%`, top: `${pp.y * 100}%`, transform: `translate(-50%, -50%) rotate(${pp.rot}deg)`, width: BADGE, height: BADGE }}
              onPointerDown={(e) => onPointerDown(e, p.id, i)}
              onPointerUp={() => onPointerUp(p.ch)}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}>
              {hoverId === p.id && dragId !== p.id && <div className="sashtip">{p.ch.nm}</div>}
              <Badge ch={p.ch} size={BADGE} />
            </div>
          );
        })
      )}

      {/* Squad coat of arms (or prompt) — bottom right */}
      {squad ? (
        <div className="sashsquad" onClick={() => onOpenSquad?.(squad.id)}>
          <span className="sqname" style={{ color: theme.fg }}>{squad.name}</span>
          <CoatOfArms coat={squad.coat} size={40} />
        </div>
      ) : onAddSquad ? (
        <div className="sashsquad" onClick={onAddSquad}>
          <span className="sqname" style={{ color: theme.fg }}>Squads</span>
          <svg width="40" height="40" viewBox="0 0 100 100">
            <path d="M50 8 L86 20 V48 C86 72 70 88 50 94 C30 88 14 72 14 48 V20 Z" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.8)" strokeWidth="4" strokeDasharray="6 5" />
            <path d="M50 38 V66 M36 52 H64" stroke="rgba(255,255,255,.9)" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
    </div>
  );
}
