"use client";
import Ico from "./Ico";
import { useCatalog } from "@/lib/catalog";
import type { Challenge, BadgeShape } from "@/lib/types";

interface Props {
  ch: Challenge;
  size?: number;
  drawn?: boolean;
  rot?: number;
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
  const fxClass = effect !== "none" ? ` fx-${effect}` : "";

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
    </div>
  );
}
