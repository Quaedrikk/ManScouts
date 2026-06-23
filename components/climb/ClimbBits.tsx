"use client";
import { useRef } from "react";
import { CLIMB_COLORS, colorHex, type ClimbColor, type HoldShape } from "@/lib/climb";

// Hexagon color picker — each wedge is one color, tap to select.
export function ColorPolygon({ value, onChange, size = 180 }: { value: ClimbColor | null; onChange: (c: ClimbColor) => void; size?: number }) {
  const cx = 60, cy = 60, r = 56;
  const verts = Array.from({ length: 6 }, (_, i) => {
    const a = ((-90 + i * 60) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      {CLIMB_COLORS.map((c, i) => {
        const [x1, y1] = verts[i];
        const [x2, y2] = verts[(i + 1) % 6];
        const sel = value === c.key;
        return (
          <polygon key={c.key} points={`${cx},${cy} ${x1},${y1} ${x2},${y2}`} fill={c.hex}
            stroke={sel ? "#fff" : "rgba(0,0,0,.25)"} strokeWidth={sel ? 4 : 1}
            style={{ cursor: "pointer", filter: sel ? "none" : "brightness(.78)", transition: "filter .15s" }}
            onClick={() => onChange(c.key)} />
        );
      })}
      <circle cx={cx} cy={cy} r={18} fill={value ? colorHex(value) : "#fff"} stroke="#fff" strokeWidth={3} />
    </svg>
  );
}

export function Hold({ shape, color, size = 36 }: { shape: HoldShape; color: string; size?: number }) {
  const paths: Record<HoldShape, React.ReactNode> = {
    jug: <path d="M6 22 C6 9 34 9 34 22 C34 33 24 37 20 37 C16 37 6 33 6 22 Z" />,
    crimp: <path d="M5 17 H35 L30 27 H10 Z" />,
    sloper: <path d="M5 31 A17 13 0 0 1 35 31 Z" />,
    pinch: <path d="M10 11 C3 20 8 35 16 35 C18 35 19 25 19 20 C19 25 22 35 24 35 C32 35 37 20 30 11 C26 7 22 16 20 18 C18 16 14 7 10 11 Z" />,
    pocket: <path fillRule="evenodd" d="M20 5 a15 15 0 1 0 .1 0 Z M20 16 a4 4 0 1 0 .1 0 Z" />,
  };
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={{ color, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.25))" }}>
      <g fill="currentColor">{paths[shape]}</g>
    </svg>
  );
}

// Video that starts playback at the trimmed start of the climb.
export function ClimbVideo({ url, startSec }: { url: string; startSec?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <video
      ref={ref} className="proof" src={url} controls playsInline preload="metadata"
      onLoadedMetadata={(e) => { if (startSec) e.currentTarget.currentTime = startSec; }}
      onPlay={(e) => { if (startSec && e.currentTarget.currentTime < startSec) e.currentTarget.currentTime = startSec; }}
    />
  );
}
