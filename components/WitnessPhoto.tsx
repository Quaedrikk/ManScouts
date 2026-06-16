"use client";
import { useState } from "react";

// Renders the "witnessed by X" content. If witness photos exist, the content
// becomes tappable and opens them in a lightbox gallery.
export default function WitnessPhoto({ url, photos, children }: { url?: string; photos?: (string | undefined)[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const imgs = (photos ?? [url]).filter(Boolean) as string[];
  if (imgs.length === 0) return <>{children}</>;
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
            <div className="label" style={{ color: "#fff", marginBottom: 8 }}>
              Witness proof{imgs.length > 1 ? ` (${imgs.length})` : ""}
            </div>
            <div style={{ display: "grid", gap: 10, maxHeight: "76vh", overflow: "auto" }}>
              {imgs.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="witness proof" style={{ width: "100%", borderRadius: 16, display: "block" }} />
              ))}
            </div>
            <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
