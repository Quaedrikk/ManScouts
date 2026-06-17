"use client";
import { useMemo } from "react";
import Badge from "./Badge";
import Particles from "./Particles";
import type { Challenge } from "@/lib/types";

interface Props {
  ch: Challenge;
  onClose: () => void;
}

const CONFETTI_COLORS = ["#e5552b", "#d9a441", "#1f8a5b", "#4a5ad9", "#b5384d", "#2f8f8a", "#ffffff"];

function Cannon({ side }: { side: "left" | "right" }) {
  const dir = side === "left" ? 1 : -1;
  const pieces = useMemo(
    () => Array.from({ length: 20 }).map((_, i) => ({
      dx: dir * (40 + Math.random() * 240),
      dy: -(180 + Math.random() * 340),
      r: Math.random() * 720 - 360,
      c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.25,
      dur: 1.3 + Math.random() * 0.9,
    })),
    [dir]
  );
  return (
    <div className={"cannon " + side}>
      {pieces.map((p, i) => (
        <i key={i} style={{
          background: p.c,
          ["--dx" as string]: `${p.dx}px`,
          ["--dy" as string]: `${p.dy}px`,
          ["--r" as string]: `${p.r}deg`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`,
        }} />
      ))}
    </div>
  );
}

export default function Unlock({ ch, onClose }: Props) {
  return (
    <div className="unlock">
      <Particles an={ch.an} />
      <Cannon side="left" />
      <Cannon side="right" />
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
