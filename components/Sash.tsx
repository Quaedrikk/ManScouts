"use client";
import Badge from "./Badge";
import Avatar from "./Avatar";
import SashBoard from "./SashBoard";
import { DIFFS } from "@/lib/challenges";
import { useCatalog } from "@/lib/catalog";
import type { UserProfile, Post, Challenge } from "@/lib/types";

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
}

export default function Sash({ profile, posts, totalPts, onEdit, onPick }: Props) {
  const { byId } = useCatalog();
  const earned = posts.map((p) => ({ ...p, ch: byId(p.challengeId) })).filter((p) => p.ch) as (Post & { ch: Challenge })[];

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
          <div className="display" style={{ color: "var(--accent)", fontSize: 26 }}>{earned.length}</div>
          <div className="label" style={{ marginTop: 3 }}>Badges</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
          <div className="display" style={{ color: "var(--accent)", fontSize: 26 }}>{totalPts}</div>
          <div className="label" style={{ marginTop: 3 }}>Points</div>
        </div>
        <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center", cursor: "pointer" }} onClick={onEdit}>
          <div style={{ width: 24, height: 24, margin: "0 auto" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#7a7367" strokeWidth="2">
              <path d="M4 20h4l10-10-4-4L4 16z" />
            </svg>
          </div>
          <div className="label" style={{ marginTop: 7 }}>Edit</div>
        </div>
      </div>

      <div className="label" style={{ margin: "6px 2px 8px" }}>The Sash</div>
      <p className="muted" style={{ fontSize: 12, margin: "0 2px 8px" }}>
        Drag your badges anywhere. Tap one to open it. Hover for the name.
      </p>
      <SashBoard earned={earned} onPick={onPick} />

      <div className="label" style={{ margin: "22px 2px 10px" }}>Field log</div>
      {earned.length === 0 && (
        <p className="muted" style={{ textAlign: "center", fontSize: 13, padding: 12 }}>
          Earned challenges show here with proof, place and witness.
        </p>
      )}
      {earned.map((p) => (
        <div key={p.id} className="card post">
          <div className="ph">
            <Badge ch={p.ch} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{p.ch.nm}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{fmtFull(p.createdAt)}</div>
            </div>
            <span className="chip" style={{ background: DIFFS[p.ch.df].c, color: "#fff", fontSize: 10 }}>
              {p.ch.df}
            </span>
          </div>
          {p.proofUrl && <img className="proof" src={p.proofUrl} alt="proof" />}
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
            <div>Witnessed by <b style={{ color: "var(--ink)" }}>{p.witnessName}</b> {p.witnessHandle}</div>
            {p.note && <div style={{ marginTop: 5, fontStyle: "italic" }}>"{p.note}"</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
