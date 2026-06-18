"use client";
import { useEffect } from "react";

export default function SeasonIntro({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="s1wrap" onClick={onClose}>
      <div className="s1rays" />
      <svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "38%", zIndex: 1 }}>
        <path d="M-10 120 L70 40 L120 86 L170 30 L240 96 L320 50 L320 120 Z" fill="rgba(255,255,255,.08)" />
        <path d="M170 30 L188 54 L178 50 L162 64 L154 52 Z" fill="rgba(255,255,255,.4)" />
      </svg>

      <div style={{ position: "relative", zIndex: 2 }}>
        <div className="s1ranked">R A N K E D</div>
        <div className="s1season">SEASON 1</div>
        <div className="s1sub">The climb begins. Earn badges, take the summit.</div>
        <button className="btn s1btn" onClick={onClose}>Enter</button>
      </div>
    </div>
  );
}
