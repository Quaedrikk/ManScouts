"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Badge from "./Badge";
import type { Post, Challenge, SashLayout } from "@/lib/types";

const BADGE = 60;

interface Props {
  earned: (Post & { ch: Challenge })[];
  onPick: (ch: Challenge) => void;
}

// Default position (as 0..1 fractions) laid out in a loose grid.
function defaultPos(i: number): { x: number; y: number; rot: number } {
  const cols = 4;
  const col = i % cols;
  const row = Math.floor(i / cols);
  return {
    x: 0.14 + col * 0.24,
    y: 0.12 + row * 0.2,
    rot: (i % 3 - 1) * 6,
  };
}

export default function SashBoard({ earned, onPick }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<SashLayout>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const layoutRef = useRef<SashLayout>({});
  const drag = useRef<{ id: string; moved: boolean } | null>(null);

  // Load saved layout once.
  useEffect(() => {
    let active = true;
    fetch("/api/sash")
      .then((r) => r.json())
      .then((d) => { if (active) { setLayout(d.layout ?? {}); layoutRef.current = d.layout ?? {}; } })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const pos = (id: string, i: number) => layout[id] ?? defaultPos(i);

  const save = useCallback(() => {
    fetch("/api/sash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: layoutRef.current }),
    }).catch(() => {});
  }, []);

  function onPointerDown(e: React.PointerEvent, id: string, i: number) {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!layout[id]) {
      const p = defaultPos(i);
      const next = { ...layoutRef.current, [id]: p };
      layoutRef.current = next; setLayout(next);
    }
    drag.current = { id, moved: false };
    setDragId(id);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const half = BADGE / 2;
    // Keep the badge fully inside the board.
    const minX = half / rect.width, maxX = 1 - half / rect.width;
    const minY = half / rect.height, maxY = 1 - half / rect.height;
    const x = Math.min(maxX, Math.max(minX, (e.clientX - rect.left) / rect.width));
    const y = Math.min(maxY, Math.max(minY, (e.clientY - rect.top) / rect.height));
    drag.current.moved = true;
    const id = drag.current.id;
    const prev = layoutRef.current[id] ?? { x, y, rot: 0 };
    const next = { ...layoutRef.current, [id]: { ...prev, x, y } };
    layoutRef.current = next;
    setLayout(next);
  }

  function onPointerUp(ch: Challenge) {
    const d = drag.current;
    drag.current = null;
    setDragId(null);
    if (!d) return;
    if (d.moved) save();
    else onPick(ch); // a tap (no drag) opens the badge
  }

  if (earned.length === 0) {
    return (
      <div className="sashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,.8)", fontSize: 13, textAlign: "center", padding: "0 20px", position: "relative", zIndex: 1 }}>
          Empty for now. Earn a badge and pin it to your sash.
        </div>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="sashboard" onPointerMove={onPointerMove}>
      {earned.map((p, i) => {
        const pp = pos(p.id, i);
        return (
          <div
            key={p.id}
            className={"sashbadge" + (dragId === p.id ? " dragging" : "")}
            style={{ left: `${pp.x * 100}%`, top: `${pp.y * 100}%`, transform: `translate(-50%, -50%) rotate(${pp.rot}deg)`, width: BADGE, height: BADGE }}
            onPointerDown={(e) => onPointerDown(e, p.id, i)}
            onPointerUp={() => onPointerUp(p.ch)}
            onMouseEnter={() => setHoverId(p.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            {hoverId === p.id && dragId !== p.id && <div className="sashtip">{p.ch.nm}</div>}
            <Badge ch={p.ch} size={BADGE} />
          </div>
        );
      })}
    </div>
  );
}
