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

export default function ClimbCard({ post, meId, canDelete, onDelete, onUpdate, onOpenUser }: {
  post: ClimbPost; meId: string; canDelete: boolean; onDelete: () => void; onUpdate: (p: ClimbPost) => void;
  onOpenUser?: (id: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<ClimbComment | null>(null);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.note ?? "");
  const [draftVis, setDraftVis] = useState<Vis>(post.visibility ?? "everyone");
  const [savingEdit, setSavingEdit] = useState(false);
  const likes = post.likes ?? [], supers = post.superLikes ?? [];
  const iLike = likes.includes(meId), iSuper = supers.includes(meId);
  const isMine = post.userId === meId;

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

  const pill = (active: boolean, bg: string): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999,
    fontWeight: 800, fontSize: 12, cursor: "pointer", border: "none",
    background: active ? bg : "rgba(0,0,0,.55)", color: "#fff",
  });

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
          </div>
        </div>
        <span className="chip" style={{ background: colorHex(post.color), color: colorText(post.color), textShadow: post.color === "white" || post.color === "yellow" ? "none" : "0 1px 2px rgba(0,0,0,.4)" }}>V{post.grade}</span>
        {(isMine || canDelete) && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setMenu((m) => !m)} title="More" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--muted)" }}>
              <CIcon name="dots" size={18} />
            </button>
            {menu && (
              <div className="ddmenu pop" style={{ left: "auto", right: 0, minWidth: 130 }}>
                {isMine && <button className="ddopt" onClick={() => { setMenu(false); setEditing(true); setDraft(post.note ?? ""); setDraftVis(post.visibility ?? "everyone"); }}><CIcon name="pencil" size={15} style={{ marginRight: 8 }} /> Edit</button>}
                {canDelete && <button className="ddopt" onClick={() => { setMenu(false); onDelete(); }} style={{ color: "var(--accent-d)" }}><CIcon name="x" size={15} style={{ marginRight: 8 }} /> Delete</button>}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <ClimbVideo url={post.videoUrl} startSec={post.startSec} />
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
          <button onClick={() => engage("super")} style={pill(iSuper, "rgba(229,85,43,.95)")}><CIcon name="flame" size={14} /> Highly Recommended{supers.length ? ` ${supers.length}` : ""}</button>
          <button onClick={() => engage("like")} style={pill(iLike, "rgba(47,111,224,.95)")}><CIcon name="thumb" size={14} /> Recommended{likes.length ? ` ${likes.length}` : ""}</button>
        </div>
      </div>

      {editing ? (
        <div style={{ marginTop: 10 }}>
          <textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Caption…" />
          <div className="seg" style={{ margin: "8px 0" }}>
            {(["everyone", "followers", "me"] as Vis[]).map((v) => (
              <button key={v} className={"chip" + (draftVis === v ? " on" : "")} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={() => setDraftVis(v)}>
                <CIcon name={visIcon[v]} size={14} /> {v === "everyone" ? "Everyone" : v === "followers" ? "Followers" : "Only me"}
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
          <div style={{ fontSize: 14, margin: "10px 2px 4px", lineHeight: 1.45 }}>
            <b>{post.userName}</b> {post.note}
          </div>
        )
      )}

      {/* Comments — Instagram style, with replies */}
      <div style={{ marginTop: 10 }}>
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
