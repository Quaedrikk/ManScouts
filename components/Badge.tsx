"use client";
import Ico from "./Ico";
import { useCatalog } from "@/lib/catalog";
import type { Challenge, BadgeShape, BadgeEffect } from "@/lib/types";

interface Props {
  ch: Challenge;
  size?: number;
  drawn?: boolean;
  rot?: number;
}

// Effects driven purely by a CSS filter/transform on the emblem.
const FILTER_FX: BadgeEffect[] = ["aura", "shimmer", "pulse", "spin", "gold"];

// Decorative particle/elemental overlays drawn on top of the emblem.
function BadgeFx({ effect }: { effect: BadgeEffect }) {
  switch (effect) {
    case "orbit":
      return (
        <div className="bfx bfx-orbit">
          {[0, 120, 240].map((a) => (
            <div key={a} style={{ position: "absolute", inset: 0, transform: `rotate(${a}deg)` }}>
              <span className="ostar">✦</span>
            </div>
          ))}
        </div>
      );
    case "sparkle":
      return (
        <div className="bfx">
          {[[12, 14, 0], [80, 20, 0.5], [70, 78, 1], [22, 72, 1.5]].map(([l, t, d], i) => (
            <span key={i} className="spk" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${d}s` }}>✦</span>
          ))}
        </div>
      );
    case "fire":
      return (
        <div className="bfx bfx-fire">
          <div className="fireglow" />
          {[20, 38, 50, 62, 80].map((l, i) => (
            <span key={i} className="ember" style={{ left: `${l}%`, animationDelay: `${i * 0.28}s` }} />
          ))}
        </div>
      );
    case "lightning":
      return (
        <div className="bfx bfx-bolt">
          <div className="boltflash" />
          <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
            <path d="M54 14 L34 52 H48 L42 86 L70 44 H54 Z" fill="#fff6a0" stroke="#ffe14d" strokeWidth="2" />
          </svg>
        </div>
      );
    case "water":
      return (
        <div className="bfx-water">
          <div className="wv wv1" />
          <div className="wv wv2" />
        </div>
      );
    case "frost":
      return (
        <div className="bfx bfx-frost">
          {[[16, 18, 0], [78, 24, 0.6], [68, 74, 1.2], [24, 70, 1.8], [50, 10, 0.9]].map(([l, t, d], i) => (
            <span key={i} className="flake" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${d}s` }}>❄</span>
          ))}
        </div>
      );
    case "petals":
      return (
        <div className="bfx">
          {[12, 36, 60, 84].map((l, i) => (
            <span key={i} className="petal" style={{ left: `${l}%`, animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>
      );
    default:
      return null;
  }
}

// Regular polygon / star / rosette points around center (50,50).
function poly(n: number, R: number, rotDeg = -90, inner?: number) {
  const steps = inner != null ? n * 2 : n;
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const r = inner != null ? (i % 2 === 0 ? R : inner) : R;
    const a = ((rotDeg + (i * 360) / steps) * Math.PI) / 180;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// One shape figure at baseline radius ~46, centered on (50,50).
function ShapeFig({ shape, ...rest }: { shape: BadgeShape } & React.SVGProps<SVGElement>) {
  const p = rest as Record<string, unknown>;
  switch (shape) {
    case "square": return <rect x={7} y={7} width={86} height={86} rx={18} {...p} />;
    case "hex": return <polygon points={poly(6, 46, 30)} {...p} />;
    case "star": return <polygon points={poly(5, 48, -90, 22)} {...p} />;
    case "rosette": return <polygon points={poly(12, 46, -90, 38)} {...p} />;
    case "shield": return <path d="M50 5 L90 19 V49 C90 74 72 91 50 96 C28 91 10 74 10 49 V19 Z" {...p} />;
    case "circle":
    default: return <circle cx={50} cy={50} r={46} {...p} />;
  }
}

export default function Badge({ ch, size = 82, drawn = false, rot = 0 }: Props) {
  const { catColor } = useCatalog();
  const col = ch.color ?? catColor(ch.cat);
  const shape = ch.shape ?? "circle";
  const effect = ch.effect ?? "none";
  const fxClass = FILTER_FX.includes(effect) ? ` fx-${effect}` : "";

  return (
    <div
      className="emblemwrap"
      style={{
        width: size, height: size, position: "relative", margin: "0 auto",
        transform: rot ? `rotate(${rot}deg)` : undefined,
      }}
    >
      <div className={"emblemfx" + fxClass} style={{ position: "absolute", inset: 0, ["--fx" as string]: col }}>
        <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <radialGradient id={`hl-${ch.id}`} cx="36%" cy="28%" r="75%">
              <stop offset="0%" stopColor="rgba(255,255,255,.4)" />
              <stop offset="62%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <ShapeFig shape={shape} fill={col} />
          <ShapeFig shape={shape} fill={`url(#hl-${ch.id})`} />
          <g transform="translate(50 50) scale(.86) translate(-50 -50)">
            <ShapeFig
              shape={shape}
              fill="none"
              stroke="rgba(255,255,255,.45)"
              strokeWidth={1.6}
              strokeDasharray="4 4"
              className={drawn ? "stitchdraw" : ""}
            />
          </g>
        </svg>
        {ch.imageUrl ? (
          <div style={{ position: "absolute", inset: "18%", borderRadius: shape === "square" ? 10 : "50%", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ch.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div style={{ position: "absolute", inset: "26%" }}>
            <Ico name={ch.ico} />
          </div>
        )}
      </div>
      <BadgeFx effect={effect} />
    </div>
  );
}
