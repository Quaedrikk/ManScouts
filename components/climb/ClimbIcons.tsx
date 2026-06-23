"use client";
import type { ReactNode } from "react";

// Self-made line/solid mini graphics (ManScouts style) — no emojis.
type Glyph = { solid?: boolean; node: ReactNode };

const GLYPHS: Record<string, Glyph> = {
  home: { node: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.8V20h14V9.8" /></> },
  climbs: { node: <><path d="M3 19.5h18" /><path d="m5 19.5 5-11 3.2 6 2.3-4 4 9" /></> },
  user: { node: <><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.7 3.1-6.4 7-6.4s7 2.7 7 6.4" /></> },
  thumb: { node: <><path d="M7 10.5V20H4.5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1z" /><path d="M7 10.5 11 4a2 2 0 0 1 2 2v3.2h5.1a2 2 0 0 1 2 2.35l-1.1 6A2 2 0 0 1 18 20H7" /></> },
  flame: { node: <path d="M12 2.5s5 3.8 5 8.7a5 5 0 0 1-10 0c0-2 .9-3.4 1.9-4.4.3 1.3 1.3 2.1 2.5 2.1C13.1 8.9 13.4 5.7 12 2.5z" /> },
  check: { node: <path d="m5 12.5 4.5 4.5L19 6.5" /> },
  flag: { node: <><path d="M6 21V4" /><path d="M6 4.5h11l-2.2 3.5L17 11.5H6" /></> },
  globe: { node: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.8 2.7 2.8 15.3 0 18M12 3c-2.8 2.7-2.8 15.3 0 18" /></> },
  users: { node: <><circle cx="9" cy="9" r="3.1" /><path d="M3 19c0-3.2 2.7-5 6-5s6 1.8 6 5" /><path d="M16.5 6.4a3.1 3.1 0 0 1 0 5.2" /><path d="M17.5 14.2c2 .6 3.5 1.9 3.5 4.6" /></> },
  lock: { node: <><rect x="5" y="11" width="14" height="9" rx="2.2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></> },
  camera: { node: <><rect x="3" y="7" width="18" height="13" rx="2.4" /><path d="M8.5 7 10 4h4l1.5 3" /><circle cx="12" cy="13.2" r="3.4" /></> },
  play: { solid: true, node: <path d="M8 5.2v13.6L19 12z" /> },
  pencil: { node: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5 17.5 10.5" /></> },
  plus: { node: <><path d="M12 5v14" /><path d="M5 12h14" /></> },
  dots: { solid: true, node: <><circle cx="5.5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="18.5" cy="12" r="1.7" /></> },
  reply: { node: <><path d="M9 7 4 12l5 5" /><path d="M4.5 12H13a6 6 0 0 1 6 6v1" /></> },
  spark: { solid: true, node: <path d="M12 3l1.9 5.4 5.4 1.9-5.4 1.9L12 17.6l-1.9-5.4L4.7 10.3l5.4-1.9z" /> },
  pin: { node: <><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" /><circle cx="12" cy="9.2" r="2.4" /></> },
  arrow: { node: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></> },
  x: { node: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></> },
  star: { solid: true, node: <path d="M12 3.5l2.6 5.6 6.1.6-4.6 4 1.4 6L12 16.9 6.5 19.7l1.4-6-4.6-4 6.1-.6z" /> },
};

export default function CIcon({ name, size = 18, stroke = 2, style, className }: {
  name: keyof typeof GLYPHS | string; size?: number; stroke?: number; style?: React.CSSProperties; className?: string;
}) {
  const g = GLYPHS[name];
  if (!g) return null;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill={g.solid ? "currentColor" : "none"} stroke={g.solid ? "none" : "currentColor"}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0, ...style }}>
      {g.node}
    </svg>
  );
}
