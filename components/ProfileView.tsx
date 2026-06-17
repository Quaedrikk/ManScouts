"use client";
import { useEffect, useState } from "react";
import Badge from "./Badge";
import Stars from "./Stars";
import SashBoard from "./SashBoard";
import WitnessPhoto from "./WitnessPhoto";
import CoatOfArms from "./CoatOfArms";
import { chStars } from "@/lib/challenges";
import { useCatalog } from "@/lib/catalog";
import type { UserProfile, Post, Challenge, SashLayout, Squad } from "@/lib/types";

function fmtFull(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}

interface Props {
  userId: string;
  posts: Post[];
  onClose: () => void;
  onPick: (ch: Challenge) => void;
  onOpenSquad: (id: string) => void;
}

export default function ProfileView({ userId, posts, onClose, onPick, onOpenSquad }: Props) {
  const { byId } = useCatalog();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sash, setSash] = useState<{ layout: SashLayout; style: string }>({ layout: {}, style: "forest" });
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSquad(null);
    fetch(`/api/users/${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setProfile(d.profile); setSash(d.sash ?? { layout: {}, style: "forest" });
        if (d.profile?.squadId) {
          fetch(`/api/squads?id=${encodeURIComponent(d.profile.squadId)}`).then((r) => r.json()).then((s) => { if (active) setSquad(s.squad ?? null); }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const userPosts = posts.filter((p) => p.userId === userId);
  const earned = userPosts
    .map((p) => ({ ...p, ch: byId(p.challengeId) }))
    .filter((p) => p.ch) as (Post & { ch: Challenge })[];
  const totalPts = earned.reduce((s, p) => s + (p.ch.pts ?? 0), 0);

  // Fall back to post fields if the profile record isn't found (e.g. legacy users).
  const display: UserProfile = profile ?? {
    id: userId,
    name: userPosts[0]?.userName ?? "Scout",
    handle: userPosts[0]?.userHandle ?? "",
    bio: "",
    avatarUrl: userPosts[0]?.userAvatarUrl ?? "",
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        {loading && earned.length === 0 ? (
          <div className="display muted" style={{ textAlign: "center", padding: 40 }}>Loading…</div>
        ) : (
          <>
            <SashBoard profile={display} earned={earned} onPick={onPick} readOnly sash={sash} />

            {squad && (
              <div className="card" style={{ padding: 10, marginTop: 12, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onOpenSquad(squad.id)}>
                <CoatOfArms coat={squad.coat} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="label">Squad</div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{squad.name}</div>
                </div>
                <span className="muted" style={{ fontSize: 18 }}>›</span>
              </div>
            )}

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

            <div className="label" style={{ margin: "8px 2px 10px" }}>Field log</div>
            {earned.length === 0 && (
              <p className="muted" style={{ textAlign: "center", fontSize: 13, padding: 12 }}>
                No badges earned yet.
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
                  <Stars n={chStars(p.ch)} size={12} />
                </div>
                {p.proofUrl && <img className="proof" src={p.proofUrl} alt="proof" />}
                <div className="muted" style={{ marginTop: 9, fontSize: 13, lineHeight: 1.6 }}>
                  {p.place && <div>📍 {p.place}</div>}
                  {p.witnessName && <div><WitnessPhoto url={p.witnessPhotoUrl} photos={p.witnesses?.map((w) => w.photoUrl)}>Witnessed by <b style={{ color: "var(--ink)" }}>{p.witnessName}</b> {p.witnessHandle}</WitnessPhoto></div>}
                  {p.note && <div style={{ marginTop: 5, fontStyle: "italic" }}>&quot;{p.note}&quot;</div>}
                </div>
              </div>
            ))}
          </>
        )}
        <div style={{ height: 12 }} />
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
