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
      <div style={{ position: "absolute", inset: "28%" }}>
        <Ico name={coat.icon} stroke={coat.iconColor} />
      </div>
    </div>
  );
}
