"use client";
import { useEffect, useState } from "react";
import { BASE_PATH } from "@/lib/basePath";
import Badge from "./Badge";
import SashBoard from "./SashBoard";
import SquadPanel from "./SquadPanel";
import Stars from "./Stars";
import WitnessPhoto from "./WitnessPhoto";
import ProofGallery from "./ProofGallery";
import { chStars } from "@/lib/challenges";
import { useCatalog } from "@/lib/catalog";
import type { UserProfile, Post, Challenge, SquadBadge } from "@/lib/types";

function fmtFull(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}

interface Props {
  profile: UserProfile;
  posts: Post[];
  totalPts: number;
  onEdit: () => void;
  onPick: (ch: Challenge) => void;
  onDelete: (id: string) => void;
  onUpdateProfile: (p: UserProfile) => void;
  onReloadProfile: () => void;
  onOpenSquad: (id: string) => void;
}

export default function Sash({ profile, posts, totalPts, onEdit, onPick, onDelete, onUpdateProfile, onReloadProfile, onOpenSquad }: Props) {
  const { byId } = useCatalog();
  const earned = posts.map((p) => ({ ...p, ch: byId(p.challengeId) })).filter((p) => p.ch) as (Post & { ch: Challenge })[];

  const [squad, setSquad] = useState<SquadBadge | null>(null);
  const [squadEditor, setSquadEditor] = useState(false);
  useEffect(() => {
    if (!profile.squadId) { setSquad(null); return; }
    let active = true;
    fetch(`${BASE_PATH}/api/squads?id=${encodeURIComponent(profile.squadId)}`).then((r) => r.json())
      .then((d) => { if (active && d.squad) setSquad({ id: d.squad.id, name: d.squad.name, coat: d.squad.coat }); })
      .catch(() => {});
    return () => { active = false; };
  }, [profile.squadId]);

  const pinnedId = profile.pinnedPostId;
  function togglePin(id: string) {
    onUpdateProfile({ ...profile, pinnedPostId: pinnedId === id ? undefined : id });
  }

  return (
    <div>
      <div style={{ height: 18 }} />
      <SashBoard
        profile={profile} earned={earned} onPick={onPick} onEditProfile={onEdit}
        squad={squad} onOpenSquad={onOpenSquad} onAddSquad={() => setSquadEditor(true)}
      />
      <p className="muted" style={{ fontSize: 12, margin: "8px 2px 0", textAlign: "center" }}>
        Drag badges to arrange · tap to open · 🎨 to restyle · tap the crest for your squad
      </p>
      {squadEditor && <SquadPanel onClose={() => setSquadEditor(false)} onReloadProfile={onReloadProfile} />}

      <div style={{ display: "flex", gap: 12, margin: "14px 0" }}>
        <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
          <div className="display" style={{ color: "var(--accent)", fontSize: 26 }}>{earned.length}</div>
          <div className="label" style={{ marginTop: 3 }}>Badges</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
          <div className="display" style={{ color: "var(--accent)", fontSize: 26 }}>{totalPts}</div>
          <div className="label" style={{ marginTop: 3 }}>Points</div>
        </div>
      </div>


      <div className="label" style={{ margin: "18px 2px 10px" }}>Field log</div>
      {earned.length === 0 && (
        <p className="muted" style={{ textAlign: "center", fontSize: 13, padding: 12 }}>
          Earned challenges show here with proof, place and witness.
        </p>
      )}
      {earned.map((p) => (
        <div key={p.id} className="card post" style={pinnedId === p.id ? { borderColor: "var(--gold)", boxShadow: "0 0 0 1px var(--gold)" } : undefined}>
          <div className="ph">
            <Badge ch={p.ch} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{p.ch.nm}{pinnedId === p.id && <span style={{ color: "var(--gold)", fontSize: 12 }}> · 📌 pinned</span>}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{fmtFull(p.createdAt)}</div>
            </div>
            <Stars n={chStars(p.ch)} size={12} />
            <button
              onClick={() => togglePin(p.id)}
              title={pinnedId === p.id ? "Unpin from profile" : "Pin to profile"}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: pinnedId === p.id ? 1 : 0.5 }}
            >📌</button>
            <button
              onClick={() => onDelete(p.id)}
              title="Delete post"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#b0a99a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7" />
                <path d="M10 11v5M14 11v5" />
              </svg>
            </button>
          </div>
          <ProofGallery proofs={p.proofs} fallbackUrl={p.proofUrl} fallbackType={p.proofType} />
          <div className="muted" style={{ marginTop: 9, fontSize: 13, lineHeight: 1.6 }}>
            {(p.place || p.lat != null) && (
              <div>
                📍 {p.lat != null && p.lng != null ? (
                  <a href={`https://maps.google.com/?q=${p.lat},${p.lng}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent-d)" }}>
                    {p.place || `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`}
                  </a>
                ) : p.place}
              </div>
            )}
            <div><WitnessPhoto url={p.witnessPhotoUrl} photos={p.witnesses?.map((w) => w.photoUrl)}>Witnessed by <b style={{ color: "var(--ink)" }}>{p.witnessName}</b> {p.witnessHandle}</WitnessPhoto></div>
            {p.note && <div style={{ marginTop: 5, fontStyle: "italic" }}>"{p.note}"</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
