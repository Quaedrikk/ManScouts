"use client";
import { useId } from "react";
import Ico from "./Ico";
import type { CoatOfArms as Coat } from "@/lib/types";

function shapeEl(shape: Coat["shape"], props: Record<string, unknown>) {
  switch (shape) {
    case "circle": return <circle cx={50} cy={50} r={46} {...props} />;
    case "diamond": return <polygon points="50,3 97,50 50,97 3,50" {...props} />;
    case "banner": return <path d="M12 8 H88 V72 L50 92 L12 72 Z" {...props} />;
    case "shield":
    default: return <path d="M50 5 L92 19 V50 C92 76 72 92 50 96 C28 92 8 76 8 50 V19 Z" {...props} />;
  }
}

export default function CoatOfArms({ coat, size = 64 }: { coat: Coat; size?: number }) {
  const uid = useId().replace(/:/g, "");
  const clip = `coat-${uid}`;
  const charges = (coat.icons && coat.icons.length ? coat.icons : [coat.icon]).slice(0, 3);
  return (
    <div style={{ width: size, height: size, position: "relative", filter: "drop-shadow(0 2px 4px rgba(0,0,0,.25))" }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs><clipPath id={clip}>{shapeEl(coat.shape, {})}</clipPath></defs>
        <g clipPath={`url(#${clip})`}>
          <rect x="0" y="0" width="100" height="100" fill={coat.field} />
          {coat.division === "pale" && <rect x="50" y="0" width="50" height="100" fill={coat.field2} />}
          {coat.division === "fess" && <rect x="0" y="50" width="100" height="50" fill={coat.field2} />}
          {coat.division === "bend" && <polygon points="0,0 100,0 100,100" fill={coat.field2} />}
          {coat.division === "chevron" && <polygon points="0,100 0,84 50,44 100,84 100,100" fill={coat.field2} />}
        </g>
        {shapeEl(coat.shape, { fill: "none", stroke: "rgba(255,255,255,.7)", strokeWidth: 2.5 })}
        {shapeEl(coat.shape, { fill: "none", stroke: "rgba(0,0,0,.35)", strokeWidth: 1 })}
      </svg>
      <div className={"coatanim " + (coat.anim && coat.anim !== "none" ? `coat-${coat.anim}` : "")} style={{ position: "absolute", inset: 0 }}>
        {charges.map((nm, i) => (
          <div key={i} style={{ position: "absolute", ...chargePos(charges.length, i) }}>
            <Ico name={nm} stroke={coat.iconColor} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Lay out 1–3 charges within the shield.
function chargePos(n: number, i: number): React.CSSProperties {
  if (n <= 1) return { inset: "28%" };
  if (n === 2) return i === 0 ? { left: "16%", top: "30%", width: "34%", height: "34%" } : { left: "50%", top: "30%", width: "34%", height: "34%" };
  // 3: one on top, two below
  if (i === 0) return { left: "33%", top: "18%", width: "34%", height: "30%" };
  return i === 1 ? { left: "16%", top: "48%", width: "32%", height: "30%" } : { left: "52%", top: "48%", width: "32%", height: "30%" };
}
