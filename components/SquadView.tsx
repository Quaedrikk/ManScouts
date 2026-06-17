"use client";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import CoatOfArms from "./CoatOfArms";
import type { Squad, UserProfile } from "@/lib/types";

interface Props {
  squadId: string;
  onClose: () => void;
  onOpenProfile: (userId: string) => void;
}

export default function SquadView({ squadId, onClose, onOpenProfile }: Props) {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/squads?id=${encodeURIComponent(squadId)}`)
      .then((r) => r.json())
      .then((d) => { if (active) { setSquad(d.squad); setMembers(d.members ?? []); } })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [squadId]);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        {loading ? (
          <div className="display muted" style={{ textAlign: "center", padding: 40 }}>Loading…</div>
        ) : !squad ? (
          <div style={{ textAlign: "center", padding: 30 }}>
            <h2 className="display" style={{ fontSize: 22 }}>Squad not found</h2>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", padding: "4px 0 6px" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><CoatOfArms coat={squad.coat} size={96} /></div>
              <h2 className="display" style={{ fontSize: 24, marginTop: 12 }}>{squad.name}</h2>
              <div className="muted" style={{ fontSize: 13 }}>{members.length} member{members.length === 1 ? "" : "s"}</div>
            </div>

            <div className="card" style={{ padding: 12, margin: "12px 0", background: "var(--tint)" }}>
              <div className="label" style={{ marginBottom: 4 }}>The Stakes</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{squad.stakes}</div>
            </div>

            <div className="label" style={{ margin: "8px 2px 10px" }}>Members</div>
            {members.map((m) => (
              <div key={m.id} className="card" style={{ padding: 10, marginBottom: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => { onClose(); onOpenProfile(m.id); }}>
                <Avatar name={m.name} handle={m.handle} img={m.avatarUrl} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{m.name}{m.id === squad.createdBy && <span className="muted" style={{ fontWeight: 400, fontSize: 11 }}> · founder</span>}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{m.handle}</div>
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
