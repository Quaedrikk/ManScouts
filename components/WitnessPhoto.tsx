"use client";
import { useState } from "react";

// Renders the "witnessed by X" content. If a witness photo exists, the content
// becomes tappable and opens the photo in a lightbox.
export default function WitnessPhoto({ url, children }: { url?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!url) return <>{children}</>;
  return (
    <>
      <span
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{ cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 2 }}
      >
        {children} <span aria-hidden>📷</span>
      </span>
      {open && (
        <div className="scrim" style={{ alignItems: "center", zIndex: 70 }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, width: "92%", textAlign: "center" }}>
            <div className="label" style={{ color: "#fff", marginBottom: 8 }}>Witness proof</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="witness proof" style={{ width: "100%", borderRadius: 16, display: "block" }} />
            <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
