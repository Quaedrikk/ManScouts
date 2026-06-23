"use client";
import { HOLD_TYPES, type HoldType, type RouteHold } from "@/lib/climb";

export const HOLD_TYPE_COLOR: Record<HoldType, string> = {
  Crimp: "#e0559f", Sloper: "#2f6fe0", Pinch: "#e8b800", Jug: "#2faa50", Pocket: "#7b3fb5",
};

// A speech-bubble that sits above a hold point with a tail pointing down at the
// exact spot, so the hold itself stays visible. Used in the setter and route detail.
export function HoldCallout({ hold, size = "md", onRemove }: {
  hold: RouteHold; size?: "sm" | "md"; onRemove?: () => void;
}) {
  const color = HOLD_TYPE_COLOR[hold.type];
  const ring = size === "sm" ? 14 : 18;
  const font = size === "sm" ? 10 : 11.5;
  return (
    <div style={{ position: "absolute", left: `${hold.x * 100}%`, top: `${hold.y * 100}%`, transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
      {/* hollow ring marks the exact hold without covering it */}
      <div style={{ width: ring, height: ring, borderRadius: "50%", border: `2.5px solid ${color}`, boxShadow: "0 0 0 1.5px rgba(255,255,255,.9)", background: "transparent" }} />
      {/* bubble above, with a downward tail toward the ring */}
      <div
        onClick={onRemove ? (e) => { e.stopPropagation(); onRemove(); } : undefined}
        style={{
          position: "absolute", left: "50%", bottom: ring + 8, transform: "translateX(-50%)",
          background: color, color: "#fff", fontWeight: 800, fontSize: font, lineHeight: 1,
          padding: "4px 8px", borderRadius: 8, whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(0,0,0,.35)",
          cursor: onRemove ? "pointer" : "default", pointerEvents: onRemove ? "auto" : "none",
        }}>
        {hold.type}{onRemove ? " ✕" : ""}
        <span style={{ position: "absolute", left: "50%", bottom: -5, transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${color}` }} />
      </div>
    </div>
  );
}

// "3 Crimp · 2 Jug · 1 Sloper" summary from a route's holds.
export function holdCounts(holds: RouteHold[]): { type: HoldType; n: number }[] {
  return HOLD_TYPES.map((t) => ({ type: t, n: holds.filter((h) => h.type === t).length })).filter((x) => x.n > 0);
}
