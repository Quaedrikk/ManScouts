"use client";
import Ico from "./Ico";
import { CATS } from "@/lib/challenges";
import type { Challenge } from "@/lib/types";

interface Props {
  ch: Challenge;
  size?: number;
  drawn?: boolean;
  rot?: number;
}

export default function Badge({ ch, size = 82, drawn = false, rot = 0 }: Props) {
  const col = CATS[ch.cat]?.c ?? "#555";
  return (
    <div
      className="emblemwrap"
      style={{
        width: size, height: size, position: "relative", margin: "0 auto",
        filter: "drop-shadow(0 4px 8px rgba(26,24,19,.18))",
        transform: rot ? `rotate(${rot}deg)` : undefined,
      }}
    >
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id={`hl-${ch.id}`} cx="36%" cy="28%" r="75%">
            <stop offset="0%" stopColor="rgba(255,255,255,.4)" />
            <stop offset="62%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill={col} />
        <circle cx="50" cy="50" r="47" fill={`url(#hl-${ch.id})`} />
        <circle cx="50" cy="50" r="43.5" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.6" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke="rgba(255,255,255,.4)" strokeWidth="1.6"
          strokeDasharray="4 4"
          className={drawn ? "stitchdraw" : ""}
        />
      </svg>
      <div style={{ position: "absolute", inset: "24%" }}>
        <Ico name={ch.ico} />
      </div>
    </div>
  );
}
