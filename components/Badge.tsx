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

// Effects applied as a CSS filter/transform on a wrapper (stackable by nesting).
const FILTER_FX: BadgeEffect[] = [
  "aura", "shimmer", "pulse", "spin", "gold", "rainbow", "glitch",
  "shake", "bounce", "wobble", "breathe", "neon", "glow", "jelly", "flip",
];
// Effects drawn as particle/elemental overlays.
const OVERLAY_FX: BadgeEffect[] = [
  "orbit", "sparkle", "fire", "lightning", "water", "frost", "petals", "smoke", "emberring",
  "bubbles", "snow", "rays", "runes", "confetti", "comet",
];

// Icon placement per shape (so the charge sits in the visual center of the shape).
function iconStyle(shape: BadgeShape): React.CSSProperties {
  switch (shape) {
    case "paw": return { left: "30%", top: "50%", width: "40%", height: "33%" };
    case "triangle": return { left: "30%", top: "44%", width: "40%", height: "36%" };
    case "gem": return { left: "30%", top: "26%", width: "40%", height: "36%" };
    case "crescent": return { left: "40%", top: "26%", width: "44%", height: "48%" };
    case "fish": return { left: "20%", top: "30%", width: "44%", height: "40%" };
    default: return { left: "26%", top: "26%", width: "48%", height: "48%" };
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

function ShapeFig({ shape, ...rest }: { shape: BadgeShape } & React.SVGProps<SVGElement>) {
  const p = rest as Record<string, unknown>;
  switch (shape) {
    case "square": return <rect x={7} y={7} width={86} height={86} rx={18} {...p} />;
    case "hex": return <polygon points={poly(6, 46, 30)} {...p} />;
    case "star": return <polygon points={poly(5, 48, -90, 22)} {...p} />;
    case "rosette": return <polygon points={poly(12, 46, -90, 38)} {...p} />;
    case "octagon": return <polygon points={poly(8, 46, 22.5)} {...p} />;
    case "diamond": return <polygon points={poly(4, 49, -90)} {...p} />;
    case "flower": return <polygon points={poly(8, 47, -90, 28)} {...p} />;
    case "triangle": return <polygon points={poly(3, 52, -90)} {...p} />;
    case "pentagon": return <polygon points={poly(5, 47, -90)} {...p} />;
    case "shield": return <path d="M50 5 L90 19 V49 C90 74 72 91 50 96 C28 91 10 74 10 49 V19 Z" {...p} />;
    case "heart": return <path d="M50 90 C8 60 6 28 30 20 C43 15.5 50 26 50 36 C50 26 57 15.5 70 20 C94 28 92 60 50 90 Z" {...p} />;
    case "leaf": return <path d="M50 5 C86 24 86 64 50 95 C14 64 14 24 50 5 Z" {...p} />;
    case "fish": return <path d="M12 50 C28 20 60 20 74 50 C60 80 28 80 12 50 Z M74 50 L95 34 L95 66 Z" {...p} />;
    case "arrow": return <path d="M50 6 L88 46 H66 V94 H34 V46 H12 Z" {...p} />;
    case "crescent": return <path fillRule="evenodd" d="M4 50 a46 46 0 1 0 92 0 a46 46 0 1 0 -92 0 Z M28 46 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0 Z" {...p} />;
    case "gem": return <path d="M30 18 H70 L90 44 L50 94 L10 44 Z" {...p} />;
    case "paw": return <path d="M22 38 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z M36 26 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z M48 26 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z M62 38 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z M50 48 C67 48 81 61 74 76 C68 87 32 87 26 76 C19 61 33 48 50 48 Z" {...p} />;
    case "circle":
    default: return <circle cx={50} cy={50} r={46} {...p} />;
  }
}

function BadgeFx({ effect, color }: { effect: BadgeEffect; color?: string }) {
  const cv = (color ? { ["--fxc"]: color } : undefined) as React.CSSProperties | undefined;
  switch (effect) {
    case "orbit":
      return (
        <div className="bfx-orbit" style={cv}>
          {[0, 120, 240].map((a) => (
            <div key={a} style={{ position: "absolute", inset: 0, transform: `rotate(${a}deg)` }}>
              <span className="ostar">✦</span>
            </div>
          ))}
        </div>
      );
    case "emberring":
      return (
        <div className="bfx-ring" style={cv}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <div key={a} style={{ position: "absolute", inset: 0, transform: `rotate(${a}deg)` }}>
              <span className="rember" />
            </div>
          ))}
        </div>
      );
    case "sparkle":
      return (
        <div className="bfx" style={cv}>
          {[[12, 14, 0], [80, 20, 0.5], [70, 78, 1], [22, 72, 1.5]].map(([l, t, d], i) => (
            <span key={i} className="spk" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${d}s` }}>✦</span>
          ))}
        </div>
      );
    case "fire":
      return (
        <div className="bfx bfx-fire" style={cv}>
          {[20, 38, 50, 62, 80].map((l, i) => (
            <span key={i} className="ember" style={{ left: `${l}%`, animationDelay: `${i * 0.28}s` }} />
          ))}
        </div>
      );
    case "smoke":
      return (
        <div className="bfx bfx-smoke" style={cv}>
          {[30, 50, 70].map((l, i) => (
            <span key={i} style={{ left: `${l}%`, animationDelay: `${i * 0.6}s` }} />
          ))}
        </div>
      );
    case "lightning":
      return (
        <div className="bfx bfx-bolt" style={cv}>
          <div className="boltflash" />
          <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }} fill="none">
            <path className="blt b1" d="M8 22 L40 40 L26 50 L66 78" />
            <path className="blt b2" d="M74 10 L48 38 L62 46 L34 82" />
            <path className="blt b3" d="M22 6 L52 34 L40 42 L78 66" />
          </svg>
        </div>
      );
    case "water":
      return (
        <div className="bfx-water" style={cv}>
          <div className="wv wv1" />
          <div className="wv wv2" />
        </div>
      );
    case "frost":
      return (
        <div className="bfx bfx-frost" style={cv}>
          {[[16, 18, 0], [78, 24, 0.6], [68, 74, 1.2], [24, 70, 1.8], [50, 10, 0.9]].map(([l, t, d], i) => (
            <span key={i} className="flake" style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${d}s` }}>❄</span>
          ))}
        </div>
      );
    case "petals":
      return (
        <div className="bfx" style={cv}>
          {[12, 36, 60, 84].map((l, i) => (
            <span key={i} className="petal" style={{ left: `${l}%`, animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>
      );
    case "bubbles":
      return (
        <div className="bfx bfx-bubbles" style={cv}>
          {[18, 34, 50, 66, 82].map((l, i) => (
            <span key={i} style={{ left: `${l}%`, animationDelay: `${i * 0.4}s`, width: 5 + (i % 3) * 3, height: 5 + (i % 3) * 3 }} />
          ))}
        </div>
      );
    case "snow":
      return (
        <div className="bfx bfx-snow" style={cv}>
          {[14, 30, 46, 62, 78, 90].map((l, i) => (
            <span key={i} style={{ left: `${l}%`, animationDelay: `${i * 0.5}s` }}>❄</span>
          ))}
        </div>
      );
    case "rays":
      return (
        <div className="bfx-rays" style={cv}>
          {[0, 45, 90, 135].map((a) => <span key={a} style={{ transform: `rotate(${a}deg)` }} />)}
        </div>
      );
    case "runes":
      return (
        <div className="bfx-orbit" style={cv}>
          {["✦", "❂", "✧", "❖"].map((g, i) => (
            <div key={i} style={{ position: "absolute", inset: 0, transform: `rotate(${i * 90}deg)` }}>
              <span className="orune">{g}</span>
            </div>
          ))}
        </div>
      );
    case "confetti":
      return (
        <div className="bfx bfx-confetti">
          {[10, 26, 42, 58, 74, 90].map((l, i) => (
            <span key={i} style={{ left: `${l}%`, animationDelay: `${i * 0.3}s`, background: ["#e5552b", "#d9a441", "#1f8a5b", "#4a5ad9", "#b5384d"][i % 5] }} />
          ))}
        </div>
      );
    case "comet":
      return (
        <div className="bfx-orbit" style={{ ...cv, animationDuration: "2.4s" }}>
          <div style={{ position: "absolute", inset: 0 }}><span className="ocomet" /></div>
        </div>
      );
    default:
      return null;
  }
}

export default function Badge({ ch, size = 82, drawn = false, rot = 0 }: Props) {
  const { catColor } = useCatalog();
  const col = ch.color ?? catColor(ch.cat);
  const shape = ch.shape ?? "circle";
  // Each effect can carry its own color; falls back to a shared one, then the badge color.
  const filColor = (f: BadgeEffect) => ch.effectColors?.[f] ?? ch.effectColor ?? col;
  const ovColor = (f: BadgeEffect) => ch.effectColors?.[f] ?? ch.effectColor; // undefined => elemental default

  // Resolve the combinable effect list (with legacy single-effect fallback).
  const all: BadgeEffect[] = ch.effects?.length
    ? ch.effects
    : (ch.effect && ch.effect !== "none" ? [ch.effect] : []);
  const filterFx = all.filter((f) => FILTER_FX.includes(f));
  const overlayFx = all.filter((f) => OVERLAY_FX.includes(f));

  let core: React.ReactNode = (
    <div className="emblemfx" style={{ position: "absolute", inset: 0 }}>
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
          <ShapeFig shape={shape} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={1.6} strokeDasharray="4 4" className={drawn ? "stitchdraw" : ""} />
        </g>
      </svg>
      {ch.imageUrl ? (
        <div style={{ position: "absolute", inset: "18%", borderRadius: shape === "square" ? 10 : "50%", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ch.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{ position: "absolute", ...iconStyle(shape) }}>
          <Ico name={ch.ico} />
        </div>
      )}
    </div>
  );

  // Stack filter effects by nesting wrappers so their filters/transforms compose.
  for (const f of filterFx) {
    core = (
      <div className={`fx-${f}`} style={{ position: "absolute", inset: 0, ["--fx" as string]: filColor(f) }}>
        {core}
      </div>
    );
  }

  return (
    <div
      className="emblemwrap"
      style={{ width: size, height: size, position: "relative", margin: "0 auto", transform: rot ? `rotate(${rot}deg)` : undefined }}
    >
      {core}
      {overlayFx.map((f) => (
        <BadgeFx key={f} effect={f} color={ovColor(f)} />
      ))}
    </div>
  );
}
