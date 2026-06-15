"use client";
import Badge from "./Badge";
import Particles from "./Particles";
import type { Challenge } from "@/lib/types";

interface Props {
  ch: Challenge;
  onClose: () => void;
}

export default function Unlock({ ch, onClose }: Props) {
  return (
    <div className="unlock">
      <Particles an={ch.an} />
      <div className="ucard">
        <div className="stamp">
          <Badge ch={ch} size={140} drawn={true} />
        </div>
        <div style={{ marginTop: 18 }} className="fadeup">
          <span className="pill">Badge unlocked</span>
        </div>
        <div className="display" style={{ fontSize: 24, marginTop: 14 }}>{ch.nm}</div>
        <div className="muted" style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", marginTop: 4 }}>
          +{ch.pts} PTS · {ch.df.toUpperCase()}
        </div>
        <div style={{ height: 22 }} />
        <button className="btn" onClick={onClose}>Post to the board</button>
      </div>
    </div>
  );
}
