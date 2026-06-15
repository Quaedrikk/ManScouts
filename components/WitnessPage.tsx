"use client";
import { useState } from "react";

export default function WitnessPage() {
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div>
      <div className="display" style={{ fontSize: 26, margin: "18px 2px 4px" }}>Witness</div>
      <p className="muted" style={{ fontSize: 13.5, margin: "0 2px 16px" }}>
        Co-sign a scout's challenge so their badge counts.
      </p>
      <div className="card" style={{ padding: 18, textAlign: "center" }}>
        <div style={{ width: 54, height: 54, margin: "0 auto 10px" }}>
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="var(--green)" />
            <g fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50 70 C30 56 24 44 32 34 C40 26 50 32 50 40 C50 32 60 26 68 34 C76 44 70 56 50 70 Z" />
            </g>
          </svg>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }} className="muted">
          When a scout finishes a challenge they'll send you a witness code. Enter it to confirm you saw it happen.
        </div>
      </div>
      <div className="card" style={{ padding: 16, marginTop: 14 }}>
        <div className="label" style={{ marginBottom: 6 }}>Witness code</div>
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setDone(false); }}
          placeholder="OAK-1492"
        />
        <div style={{ height: 14 }} />
        {done ? (
          <div className="card" style={{ padding: 14, textAlign: "center", background: "var(--green)", border: "none", color: "#fff", fontWeight: 800 }}>
            Vouched. Badge confirmed.
          </div>
        ) : (
          <button className="btn green" disabled={code.trim().length < 3} onClick={() => setDone(true)}>
            Confirm I witnessed it
          </button>
        )}
      </div>
      <p className="muted" style={{ textAlign: "center", fontSize: 12.5, margin: "16px 10px", lineHeight: 1.5 }}>
        Cross-device witness verification coming soon — for now, the witness co-signs in the earn flow directly.
      </p>
    </div>
  );
}
