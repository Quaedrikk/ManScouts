"use client";
import { useState } from "react";
import Avatar from "../Avatar";
import { ClimbVideo } from "./ClimbBits";
import CIcon from "./ClimbIcons";
import { colorHex, colorText, type ClimbComment, type ClimbPost } from "@/lib/climb";

function fmtAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "now"; if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h"; return Math.floor(s / 86400) + "d";
}

type Vis = NonNullable<ClimbPost["visibility"]>;

const VIS_LABEL: Record<Vis, string> = { everyone: "Everybody", followers: "Followers", me: "Only me" };

export default function ClimbCard({ post, meId, canDelete, onDelete, onUpdate, onOpenUser, onAddToCollection }: {
  post: ClimbPost; meId: string; canDelete: boolean; onDelete: () => void; onUpdate: (p: ClimbPost) => void;
  onOpenUser?: (id: string) => void; onAddToCollection?: () => void;
}) {
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<ClimbComment | null>(null);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.note ?? "");
  const [draftVis, setDraftVis] = useState<Vis>(post.visibility ?? "everyone");
  const [savingEdit, setSavingEdit] = useState(false);
  const isMine = post.userId === meId;
  const likes = post.likes ?? [];
  const iLike = likes.includes(meId);

  async function share() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/climbing` : "/climbing";
    const data = { title: `${post.userName} on the Post Wall`, text: `${post.userName} sent ${post.grade === 0 ? "a route" : "V" + post.grade} at ${post.gym} • ${post.wall}${post.note ? ` — ${post.note}` : ""}`, url };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(url);
      alert("Link copied:\n" + url);
    } catch { /* cancelled */ }
  }

  async function engage(action: string, extra?: Record<string, unknown>) {
    try {
      const res = await fetch("/api/climbing/engage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: post.id, action, ...extra }) });
      const d = await res.json(); if (d.post) onUpdate(d.post);
    } catch { /* */ }
  }
  async function sendComment() {
    if (!comment.trim()) return; const t = comment.trim(); const parentId = replyTo?.id;
    setComment(""); setReplyTo(null);
    await engage("comment", { text: t, parentId });
  }
  async function saveEdit() {
    setSavingEdit(true);
    try {
      const res = await fetch("/api/climbing/posts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, note: draft, visibility: draftVis }) });
      const d = await res.json(); if (d.post) onUpdate(d.post);
      setEditing(false);
    } catch { /* */ }
    setSavingEdit(false);
  }

  const comments = post.comments ?? [];
  const tops = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);
  const visIcon: Record<Vis, string> = { everyone: "globe", followers: "users", me: "lock" };

  function CommentLine({ c, reply }: { c: ClimbComment; reply?: boolean }) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7, marginLeft: reply ? 34 : 0 }}>
        <Avatar name={c.name} handle={c.name} img={c.avatarUrl} size={reply ? 22 : 26} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, lineHeight: 1.4 }}><span style={{ fontWeight: 800 }}>{c.name}</span> {c.text}</div>
          <button onClick={() => setReplyTo(c)} style={{ background: "none", border: "none", padding: 0, marginTop: 2, cursor: "pointer", color: "var(--muted)", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <CIcon name="reply" size={12} stroke={2.4} /> Reply
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card post fadeup">
      <div className="ph" style={{ alignItems: "flex-start", position: "relative" }}>
        <div onClick={onOpenUser ? () => onOpenUser(post.userId) : undefined} style={{ cursor: onOpenUser ? "pointer" : "default" }}>
          <Avatar name={post.userName} handle={post.userHandle} img={post.userAvatarUrl} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div onClick={onOpenUser ? () => onOpenUser(post.userId) : undefined} style={{ fontWeight: 800, fontSize: 14.5, cursor: onOpenUser ? "pointer" : "default" }}>{post.userName}</div>
          <div className="muted" style={{ fontSize: 12 }}>{post.userHandle}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
            <CIcon name="pin" size={12} stroke={2} /> {post.gym} • {post.wall} · {fmtAgo(post.createdAt)}
            <span style={{ opacity: .45, marginLeft: 4 }}>· {VIS_LABEL[(post.visibility ?? "everyone") as Vis]}</span>
          </div>
        </div>
        <span className="chip" style={{ background: colorHex(post.color), color: colorText(post.color), textShadow: post.color === "white" || post.color === "yellow" ? "none" : "0 1px 2px rgba(0,0,0,.4)" }}>V{post.grade}</span>
        {(isMine || canDelete || onAddToCollection) && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setMenu((m) => !m)} title="More" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--muted)" }}>
              <CIcon name="dots" size={18} />
            </button>
            {menu && (
              <div className="ddmenu pop" style={{ left: "auto", right: 0, minWidth: 160 }}>
                {isMine && <button className="ddopt" onClick={() => { setMenu(false); setEditing(true); setDraft(post.note ?? ""); setDraftVis(post.visibility ?? "everyone"); }}><CIcon name="pencil" size={15} style={{ marginRight: 8 }} /> Edit</button>}
                {onAddToCollection && <button className="ddopt" onClick={() => { setMenu(false); onAddToCollection(); }}><CIcon name="plus" size={15} style={{ marginRight: 8 }} /> Add to collection</button>}
                {canDelete && <button className="ddopt" onClick={() => { setMenu(false); onDelete(); }} style={{ color: "var(--accent-d)" }}><CIcon name="x" size={15} style={{ marginRight: 8 }} /> Delete</button>}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <ClimbVideo url={post.videoUrl} startSec={post.startSec} />
      </div>

      {editing ? (
        <div style={{ marginTop: 10, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          <textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Caption…" />
          <div className="seg" style={{ margin: "8px 0" }}>
            {(["everyone", "followers", "me"] as Vis[]).map((v) => (
              <button key={v} className={"chip" + (draftVis === v ? " on" : "")} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => setDraftVis(v)}>
                <CIcon name={visIcon[v]} size={14} /> {VIS_LABEL[v]}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" disabled={savingEdit} onClick={saveEdit}>{savingEdit ? "Saving…" : "Save"}</button>
            <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        post.note && (
          <div style={{ fontSize: 14, margin: "16px 2px 0", padding: "14px 0 2px", borderTop: "1px solid var(--line)", lineHeight: 1.45 }}>
            <b>{post.userName}</b> {post.note}
          </div>
        )
      )}

      {/* Like + Share */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => engage("like")} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, border: "none", borderRadius: 999, padding: "9px 12px", fontWeight: 800, fontSize: 13, cursor: "pointer", background: iLike ? "#ffe6dc" : "var(--tint)", color: iLike ? "var(--accent-d)" : "var(--ink)" }}>
          <CIcon name={iLike ? "heartFill" : "heart"} size={16} /> {iLike ? "Liked" : "Like"}{likes.length ? ` · ${likes.length}` : ""}
        </button>
        <button onClick={share} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, border: "none", borderRadius: 999, padding: "9px 12px", fontWeight: 800, fontSize: 13, cursor: "pointer", background: "var(--tint)", color: "var(--ink)" }}>
          <CIcon name="share" size={16} /> Share
        </button>
      </div>

      {/* Comments — Instagram style, with replies */}
      <div style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
        {tops.map((c) => (
          <div key={c.id}>
            <CommentLine c={c} />
            {repliesOf(c.id).map((r) => <CommentLine key={r.id} c={r} reply />)}
          </div>
        ))}
        {replyTo && (
          <div className="muted" style={{ fontSize: 12, margin: "2px 2px 6px", display: "flex", alignItems: "center", gap: 6 }}>
            Replying to <b>{replyTo.name}</b>
            <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "inline-flex" }}><CIcon name="x" size={13} /></button>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={replyTo ? `Reply to ${replyTo.name}…` : "Add a comment…"} onKeyDown={(e) => { if (e.key === "Enter") sendComment(); }} style={{ padding: "10px 12px" }} />
          {comment.trim() && <button className="btn" style={{ width: "auto", padding: "0 16px" }} onClick={sendComment}>Post</button>}
        </div>
      </div>
    </div>
  );
}
