"use client";
import { useState } from "react";
import ClimbCard from "./ClimbCard";
import WallBoard from "./WallBoard";
import { climberTier, type ClimbPost, type ClimbProfile } from "@/lib/climb";

export default function ClimbProfileOther({ profile, posts, meId, following, onToggleFollow, onUpdate, onClose }: {
  profile: ClimbProfile; posts: ClimbPost[]; meId: string; following: boolean;
  onToggleFollow: () => void; onUpdate: (p: ClimbPost) => void; onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  // Only posts this viewer is allowed to see.
  const theirs = posts.filter((p) => {
    if (p.userId !== profile.id) return false;
    const v = p.visibility ?? "everyone";
    if (v === "everyone") return true;
    if (v === "followers") return following || p.userId === meId;
    return p.userId === meId;
  });
  const maxGrade = theirs.reduce((m, p) => Math.max(m, p.grade ?? 0), 0);
  const { tier, v } = climberTier(maxGrade);

  async function follow() { setBusy(true); await onToggleFollow(); setBusy(false); }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <WallBoard profile={profile} editable={false} onSave={() => {}} />

        <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
          <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
            <div className="display" style={{ color: "var(--accent)", fontSize: 20 }}>{tier}</div>
            <div className="label" style={{ marginTop: 3 }}>V{v} climber</div>
          </div>
          <div className="card" style={{ flex: 1, padding: "14px 8px", textAlign: "center" }}>
            <div className="display" style={{ color: "var(--accent)", fontSize: 26 }}>{theirs.length}</div>
            <div className="label" style={{ marginTop: 3 }}>Climbs</div>
          </div>
        </div>

        {profile.id !== meId && (
          <button className={following ? "btn ghost" : "btn"} disabled={busy} onClick={follow}>
            {following ? "Following ✓" : "Follow"}
          </button>
        )}

        <div className="label" style={{ margin: "22px 2px 10px" }}>{profile.name}&apos;s climbs</div>
        {theirs.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 16 }}>No climbs to show.</p>}
        {theirs.map((p) => <ClimbCard key={p.id} post={p} meId={meId} canDelete={false} onDelete={() => {}} onUpdate={onUpdate} />)}

        <div style={{ height: 12 }} />
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
