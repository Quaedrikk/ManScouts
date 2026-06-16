"use client";
import Badge from "./Badge";
import Stars from "./Stars";
import WitnessPhoto from "./WitnessPhoto";
import { chStars } from "@/lib/challenges";
import type { Challenge, Post } from "@/lib/types";

function fmtFull(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
  );
}

interface Props {
  ch: Challenge;
  earned: boolean;
  post?: Post;
  onClose: () => void;
  onStart: () => void;
}

export default function Detail({ ch, earned, post, onClose, onStart }: Props) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <div style={{ padding: "6px 0" }}><Badge ch={ch} size={112} /></div>
        <h2 className="display" style={{ fontSize: 24, textAlign: "center", margin: "12px 0 8px" }}>{ch.nm}</h2>
        <div className="seg" style={{ justifyContent: "center", marginBottom: 14 }}>
          <span className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Stars n={chStars(ch)} /></span>
          <span className="chip">{ch.cat}</span>
          <span className="chip">{ch.pts} pts</span>
        </div>
        <p style={{ textAlign: "center", fontSize: 15, lineHeight: 1.5, margin: "0 6px 18px" }}>{ch.blurb}</p>
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div className="label" style={{ marginBottom: 10 }}>How to earn it</div>
          {ch.how.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 11, marginBottom: 9 }}>
              <span style={{
                minWidth: 22, height: 22, borderRadius: "50%", background: "var(--ink)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800,
              }}>{i + 1}</span>
              <span style={{ fontSize: 14, lineHeight: 1.4 }}>{s}</span>
            </div>
          ))}
          {ch.care && <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--accent-d)", fontWeight: 600 }}>⚠ {ch.care}</div>}
        </div>

        {earned && post ? (
          <div className="card" style={{ padding: 14 }}>
            <div className="label" style={{ marginBottom: 10, color: "var(--green)" }}>You earned this</div>
            {post.proofUrl && <img className="proof" src={post.proofUrl} alt="proof" />}
            <div className="muted" style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6 }}>
              <div><b style={{ color: "var(--ink)" }}>{fmtFull(post.createdAt)}</b></div>
              {(post.place || post.lat != null) && (
                <div>
                  📍 {post.lat != null && post.lng != null ? (
                    <a href={`https://maps.google.com/?q=${post.lat},${post.lng}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent-d)" }}>
                      {post.place || `${post.lat.toFixed(5)}, ${post.lng.toFixed(5)}`}
                    </a>
                  ) : post.place}
                </div>
              )}
              <div><WitnessPhoto url={post.witnessPhotoUrl} photos={post.witnesses?.map((w) => w.photoUrl)}>Witnessed by <b style={{ color: "var(--ink)" }}>{post.witnessName}</b> {post.witnessHandle}</WitnessPhoto></div>
              {post.note && <div style={{ marginTop: 6, fontStyle: "italic" }}>"{post.note}"</div>}
            </div>
          </div>
        ) : (
          <button className="btn" onClick={onStart}>Start this challenge</button>
        )}
        <div style={{ height: 10 }} />
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
