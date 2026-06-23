"use client";
import { useState } from "react";
import Avatar from "../Avatar";
import { ClimbVideo } from "./ClimbBits";
import { REACTIONS, colorHex, type ClimbPost } from "@/lib/climb";

function fmtAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "now"; if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h"; return Math.floor(s / 86400) + "d";
}

export default function ClimbCard({ post, meId, canDelete, onDelete, onUpdate }: {
  post: ClimbPost; meId: string; canDelete: boolean; onDelete: () => void; onUpdate: (p: ClimbPost) => void;
}) {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const likes = post.likes ?? [], supers = post.superLikes ?? [];
  const reactions = post.reactions ?? {};

  async function engage(action: string, extra?: Record<string, unknown>) {
    try {
      const res = await fetch("/api/climbing/engage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: post.id, action, ...extra }) });
      const d = await res.json(); if (d.post) onUpdate(d.post);
    } catch { /* */ }
  }
  async function sendComment() {
    if (!comment.trim()) return;
    const t = comment.trim(); setComment("");
    await engage("comment", { text: t });
    setShowComments(true);
  }

  return (
    <div className="card post fadeup">
      <div className="ph">
        <Avatar name={post.userName} handle={post.userHandle} img={post.userAvatarUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14.5 }}>{post.userName}</div>
          <div className="muted" style={{ fontSize: 12.5 }}>{post.wall} · {fmtAgo(post.createdAt)}</div>
        </div>
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: colorHex(post.color), border: "2px solid #fff", boxShadow: "0 0 0 1px var(--line)" }} />
        <span className="chip" style={{ background: "var(--ink)", color: "#fff" }}>V{post.grade}</span>
        {canDelete && (
          <button onClick={onDelete} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0a99a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7" /></svg>
          </button>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <ClimbVideo url={post.videoUrl} startSec={post.startSec} />
        {(supers.length > 0 || likes.length > 0) && (
          <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
            {supers.length > 0 && <span style={{ background: "rgba(229,85,43,.92)", color: "#fff", fontWeight: 800, fontSize: 12, padding: "3px 8px", borderRadius: 999 }}>⭐ {supers.length}</span>}
            {likes.length > 0 && <span style={{ background: "rgba(0,0,0,.6)", color: "#fff", fontWeight: 800, fontSize: 12, padding: "3px 8px", borderRadius: 999 }}>👍 {likes.length}</span>}
          </div>
        )}
      </div>

      {post.note && <div style={{ fontSize: 14, margin: "10px 2px 0", lineHeight: 1.45 }}>{post.note}</div>}

      {/* Like / super like */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className={"cheer" + (likes.includes(meId) ? " on" : "")} onClick={() => engage("like")}>👍 Like</button>
        <button className="cheer" style={supers.includes(meId) ? { background: "#ffe6dc", color: "var(--accent-d)" } : undefined} onClick={() => engage("super")}>⭐ Super</button>
        <button className="cheer" style={{ marginLeft: "auto" }} onClick={() => setShowComments((s) => !s)}>💬 {(post.comments ?? []).length}</button>
      </div>

      {/* Emoji reactions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {REACTIONS.map((e) => {
          const who = reactions[e] ?? [];
          const mine = who.includes(meId);
          return (
            <button key={e} onClick={() => engage("react", { emoji: e })}
              style={{ border: mine ? "1.5px solid var(--accent)" : "1px solid var(--line)", background: mine ? "#ffe6dc" : "var(--card)", borderRadius: 999, padding: "4px 9px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
              {e}{who.length > 0 ? ` ${who.length}` : ""}
            </button>
          );
        })}
      </div>

      {showComments && (
        <div style={{ marginTop: 10 }}>
          {(post.comments ?? []).map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <Avatar name={c.name} handle="" img={c.avatarUrl} size={28} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 800, fontSize: 13 }}>{c.name}</span>
                <span style={{ fontSize: 13.5, marginLeft: 6 }}>{c.text}</span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" onKeyDown={(e) => { if (e.key === "Enter") sendComment(); }} />
            <button className="btn" style={{ width: "auto", padding: "0 16px" }} onClick={sendComment}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
