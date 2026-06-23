"use client";
import { useRef, useState } from "react";
import type { FacilityBox } from "@/lib/climb";

// Read-only / selectable facility map.
export function FacilityMap({ boxes, selected, onSelect, height = 190 }: {
  boxes: FacilityBox[]; selected?: string; onSelect?: (label: string) => void; height?: number;
}) {
  return (
    <div style={{ position: "relative", width: "100%", height, borderRadius: 16, overflow: "hidden",
      background: "repeating-linear-gradient(45deg,#eceadf 0 12px,#e6e3d6 12px 24px)", border: "1px solid var(--line)" }}>
      {boxes.length === 0 && (
        <div className="muted" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>No map yet</div>
      )}
      {boxes.map((b) => {
        const on = selected === b.label;
        return (
          <div key={b.id}
            onClick={onSelect ? () => onSelect(b.label) : undefined}
            style={{
              position: "absolute", left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%`,
              background: on ? "var(--accent)" : "rgba(31,31,31,.82)", color: "#fff", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
              fontWeight: 800, fontSize: 11.5, padding: 4, cursor: onSelect ? "pointer" : "default",
              boxShadow: on ? "0 0 0 3px rgba(229,85,43,.4)" : "0 2px 6px rgba(0,0,0,.2)", overflow: "hidden",
            }}>
            {b.label}
          </div>
        );
      })}
    </div>
  );
}

// Admin editor — add/move/resize/label boxes within the rectangle.
export function FacilityEditor({ gym, initial, onClose }: { gym: string; initial: FacilityBox[]; onClose: () => void }) {
  const [boxes, setBoxes] = useState<FacilityBox[]>(initial);
  const [selId, setSelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; mode: "move" | "resize"; dx: number; dy: number } | null>(null);
  const sel = boxes.find((b) => b.id === selId) ?? null;

  function frac(e: React.PointerEvent) {
    const r = ref.current!.getBoundingClientRect();
    return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height };
  }
  function down(e: React.PointerEvent, id: string, mode: "move" | "resize") {
    e.stopPropagation();
    setSelId(id);
    const b = boxes.find((x) => x.id === id)!;
    const { fx, fy } = frac(e);
    drag.current = { id, mode, dx: fx - b.x, dy: fy - b.y };
  }
  function move(e: React.PointerEvent) {
    if (!drag.current) return;
    const { fx, fy } = frac(e);
    setBoxes((prev) => prev.map((b) => {
      if (b.id !== drag.current!.id) return b;
      if (drag.current!.mode === "move") {
        return { ...b, x: Math.min(1 - b.w, Math.max(0, fx - drag.current!.dx)), y: Math.min(1 - b.h, Math.max(0, fy - drag.current!.dy)) };
      }
      return { ...b, w: Math.min(1 - b.x, Math.max(0.06, fx - b.x)), h: Math.min(1 - b.y, Math.max(0.06, fy - b.y)) };
    }));
  }
  function up() { drag.current = null; }

  function addBox() {
    const id = `b${Date.now()}`;
    setBoxes((p) => [...p, { id, label: "New Wall", x: 0.12, y: 0.12, w: 0.32, h: 0.22 }]);
    setSelId(id);
  }
  async function save() {
    setSaving(true);
    try { await fetch("/api/climbing/facility", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gym, boxes }) }); onClose(); }
    catch { alert("Couldn't save."); setSaving(false); }
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 4px" }}>Facility map editor</h2>
        <p className="muted" style={{ textAlign: "center", fontSize: 12.5, margin: "0 0 12px" }}>Drag boxes to move · drag the ◢ corner to resize.</p>

        <div ref={ref} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onClick={() => setSelId(null)}
          style={{ position: "relative", width: "100%", height: 240, borderRadius: 16, overflow: "hidden", touchAction: "none",
            background: "repeating-linear-gradient(45deg,#eceadf 0 12px,#e6e3d6 12px 24px)", border: "1px solid var(--line)" }}>
          {boxes.map((b) => {
            const on = b.id === selId;
            return (
              <div key={b.id} onPointerDown={(e) => down(e, b.id, "move")}
                style={{ position: "absolute", left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%`,
                  background: on ? "var(--accent)" : "rgba(31,31,31,.82)", color: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  textAlign: "center", fontWeight: 800, fontSize: 11, padding: 4, cursor: "grab", boxShadow: on ? "0 0 0 3px rgba(229,85,43,.4)" : "none", overflow: "hidden" }}>
                {b.label}
                <div onPointerDown={(e) => down(e, b.id, "resize")}
                  style={{ position: "absolute", right: 0, bottom: 0, width: 18, height: 18, cursor: "nwse-resize", color: "#fff", fontSize: 12, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>◢</div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 10 }} />
        <button className="btn ghost" onClick={addBox}>+ Add wall box</button>

        {sel && (
          <div className="card" style={{ padding: 12, marginTop: 12 }}>
            <div className="label" style={{ marginBottom: 6 }}>Box label</div>
            <input value={sel.label} onChange={(e) => setBoxes((p) => p.map((b) => b.id === sel.id ? { ...b, label: e.target.value } : b))} />
            <div style={{ height: 8 }} />
            <button className="btn ghost" style={{ color: "var(--accent-d)" }} onClick={() => { setBoxes((p) => p.filter((b) => b.id !== sel.id)); setSelId(null); }}>Delete box</button>
          </div>
        )}

        <div style={{ height: 14 }} />
        <button className="btn" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save map"}</button>
        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
