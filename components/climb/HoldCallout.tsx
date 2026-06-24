"use client";
import { useRef } from "react";
import { HOLD_TYPES, type HoldType, type RouteHold } from "@/lib/climb";

export const HOLD_TYPE_COLOR: Record<HoldType, string> = {
  Crimp: "#e0559f", Sloper: "#2f6fe0", Pinch: "#e8b800", Jug: "#2faa50", Pocket: "#7b3fb5",
};

function labelPos(h: RouteHold) {
  return { lx: h.lx ?? h.x, ly: h.ly ?? Math.max(0.05, h.y - 0.12) };
}

// Renders, over a position:relative image, each hold as a translucent climb-coloured
// marker plus a draggable label that points back to the hold with a leader line.
export function RouteHoldsLayer({ containerRef, holds, color, showText, size = "md", onMoveLabel, onRemove }: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  holds: RouteHold[]; color: string; showText: boolean; size?: "sm" | "md";
  onMoveLabel?: (i: number, lx: number, ly: number) => void; onRemove?: (i: number) => void;
}) {
  const ring = size === "sm" ? 14 : 18;
  const font = size === "sm" ? 10.5 : 12;
  const editable = !!onMoveLabel;
  const drag = useRef<{ i: number; moved: boolean } | null>(null);

  function down(e: React.PointerEvent, i: number) {
    if (!editable) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { i, moved: false };
  }
  function move(e: React.PointerEvent) {
    if (!drag.current || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const lx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const ly = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    drag.current.moved = true;
    onMoveLabel?.(drag.current.i, lx, ly);
  }
  function up(i: number) {
    const d = drag.current; drag.current = null;
    if (d && !d.moved && onRemove) onRemove(i); // tap (no drag) removes
  }

  const fill = `color-mix(in srgb, ${color} 50%, transparent)`;
  const stroke = `color-mix(in srgb, ${color} 80%, transparent)`;
  const bubbleBg = `color-mix(in srgb, ${color} 78%, transparent)`;

  return (
    <>
      {showText && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
          {holds.map((h, i) => { const { lx, ly } = labelPos(h); return (
            <line key={i} x1={h.x * 100} y1={h.y * 100} x2={lx * 100} y2={ly * 100} stroke={color} strokeOpacity={0.65} strokeWidth={0.5} />
          ); })}
        </svg>
      )}

      {/* translucent climb-coloured markers on the holds */}
      {holds.map((h, i) => (
        <div key={"m" + i} style={{ position: "absolute", left: `${h.x * 100}%`, top: `${h.y * 100}%`, transform: "translate(-50%,-50%)", width: ring, height: ring, borderRadius: "50%", background: fill, border: `2px solid ${stroke}`, boxShadow: "0 0 0 1px rgba(255,255,255,.45)", pointerEvents: "none", zIndex: 2 }} />
      ))}

      {/* draggable labels */}
      {showText && holds.map((h, i) => { const { lx, ly } = labelPos(h); return (
        <div key={"b" + i}
          onPointerDown={(e) => down(e, i)} onPointerMove={move} onPointerUp={() => up(i)}
          style={{ position: "absolute", left: `${lx * 100}%`, top: `${ly * 100}%`, transform: "translate(-50%,-50%)", background: bubbleBg, color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.5)", fontWeight: 800, fontSize: font, lineHeight: 1, padding: "4px 8px", borderRadius: 8, whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(0,0,0,.3)", cursor: editable ? "grab" : "default", pointerEvents: editable ? "auto" : "none", touchAction: "none", zIndex: 3 }}>
          {h.type}{editable ? " ✕" : ""}
        </div>
      ); })}
    </>
  );
}

// "3 Crimp · 2 Jug · 1 Sloper" summary from a route's holds.
export function holdCounts(holds: RouteHold[]): { type: HoldType; n: number }[] {
  return HOLD_TYPES.map((t) => ({ type: t, n: holds.filter((h) => h.type === t).length })).filter((x) => x.n > 0);
}
