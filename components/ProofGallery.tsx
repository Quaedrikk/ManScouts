"use client";
import type { ProofEntry } from "@/lib/types";

// Renders all proof captures (one per step), or a single legacy proof.
export default function ProofGallery({ proofs, fallbackUrl, fallbackType }: {
  proofs?: ProofEntry[];
  fallbackUrl?: string;
  fallbackType?: "photo" | "video";
}) {
  const list: ProofEntry[] = (proofs && proofs.length)
    ? proofs
    : (fallbackUrl ? [{ url: fallbackUrl, type: fallbackType ?? "photo" }] : []);
  if (!list.length) return null;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {list.map((p, i) => (
        <div key={i}>
          {p.step && <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>{i + 1}. {p.step}</div>}
          {p.type === "video"
            ? <video className="proof" src={p.url} controls playsInline />
            // eslint-disable-next-line @next/next/no-img-element
            : <img className="proof" src={p.url} alt="proof" />}
        </div>
      ))}
    </div>
  );
}
