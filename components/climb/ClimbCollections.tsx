"use client";
import { useState } from "react";
import ClimbCard from "./ClimbCard";
import CIcon from "./ClimbIcons";
import { colorHex, colorText, type ClimbCollection, type ClimbPost } from "@/lib/climb";

function cover(c: ClimbCollection, posts: ClimbPost[]): string {
  const first = posts.find((p) => c.postIds.includes(p.id));
  if (first) { const h = colorHex(first.color); return `linear-gradient(150deg, ${h}, color-mix(in srgb, ${h} 55%, #1a1813))`; }
  return "linear-gradient(150deg, var(--accent), var(--accent-d))";
}

// Horizontal Highlights-style carousel of collections.
export function CollectionsBar({ collections, posts, isOwner, onOpen, onNew }: {
  collections: ClimbCollection[]; posts: ClimbPost[]; isOwner?: boolean;
  onOpen: (c: ClimbCollection) => void; onNew?: () => void;
}) {
  if (!isOwner && collections.length === 0) return null;
  return (
    <div style={{ margin: "8px 0 2px" }}>
      <div className="label" style={{ margin: "0 2px 8px" }}>Collections</div>
      <div className="hscroll" style={{ gap: 14, paddingBottom: 4 }}>
        {isOwner && (
          <button onClick={onNew} style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", width: 68, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px dashed var(--line)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "var(--muted)" }}>
              <CIcon name="plus" size={24} />
            </div>
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginTop: 5 }}>New</div>
          </button>
        )}
        {collections.map((c) => (
          <button key={c.id} onClick={() => onOpen(c)} style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", width: 68, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: cover(c, posts), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "#fff", fontWeight: 900, fontSize: 18, boxShadow: "inset 0 0 0 3px #fff, 0 2px 8px rgba(26,24,19,.18)" }}>
              {c.postIds.length}
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// A small tappable tile representing a post (no video playback).
function PostTile({ p, onClick, action }: { p: ClimbPost; onClick: () => void; action: "add" | "remove" }) {
  return (
    <button onClick={onClick} style={{ flexShrink: 0, width: 92, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: 8, cursor: "pointer", textAlign: "left" }}>
      <div style={{ height: 54, borderRadius: 8, background: colorHex(p.color), display: "flex", alignItems: "center", justifyContent: "center", color: colorText(p.color), fontWeight: 900, fontSize: 16, textShadow: p.color === "white" || p.color === "yellow" ? "none" : "0 1px 2px rgba(0,0,0,.4)" }}>V{p.grade}</div>
      <div style={{ fontSize: 11, fontWeight: 700, marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.wall}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 800, marginTop: 2, color: action === "add" ? "var(--green-d)" : "var(--accent-d)" }}>
        <CIcon name={action === "add" ? "plus" : "x"} size={12} /> {action === "add" ? "Add" : "Remove"}
      </div>
    </button>
  );
}

// View a collection's posts; owner can add/remove posts, rename, delete.
export function CollectionSheet({ collection, posts, ownerPosts, meId, isOwner, isAdmin, onAdd, onRemove, onRename, onDelete, onDeletePost, onUpdatePost, onOpenUser, onClose }: {
  collection: ClimbCollection; posts: ClimbPost[]; ownerPosts: ClimbPost[]; meId: string; isOwner: boolean; isAdmin: boolean;
  onAdd: (postId: string) => void; onRemove: (postId: string) => void; onRename: (name: string) => void; onDelete: () => void;
  onDeletePost: (id: string) => void; onUpdatePost: (p: ClimbPost) => void; onOpenUser: (id: string) => void; onClose: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(collection.name);
  const inPosts = collection.postIds.map((id) => posts.find((p) => p.id === id)).filter(Boolean) as ClimbPost[];
  const addable = ownerPosts.filter((p) => !collection.postIds.includes(p.id));

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {renaming ? (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
              <button className="chip on" onClick={() => { onRename(name.trim() || collection.name); setRenaming(false); }}>Save</button>
            </>
          ) : (
            <>
              <h2 className="display" style={{ fontSize: 22, flex: 1, margin: 0 }}>{collection.name}</h2>
              {isOwner && <button className="chip" style={{ display: "inline-flex", alignItems: "center", gap: 5 }} onClick={() => setRenaming(true)}><CIcon name="pencil" size={13} /> Rename</button>}
              {isOwner && <button onClick={onDelete} title="Delete collection" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-d)", display: "inline-flex" }}><CIcon name="x" size={18} /></button>}
            </>
          )}
        </div>

        {isOwner && addable.length > 0 && (
          <>
            <div className="label" style={{ margin: "0 2px 8px" }}>Add your climbs</div>
            <div className="hscroll" style={{ gap: 10, marginBottom: 14 }}>
              {addable.map((p) => <PostTile key={p.id} p={p} action="add" onClick={() => onAdd(p.id)} />)}
            </div>
          </>
        )}

        {inPosts.length === 0
          ? <p className="muted" style={{ textAlign: "center", padding: 18 }}>No climbs in this collection yet.</p>
          : inPosts.map((p) => (
            <div key={p.id}>
              {isOwner && (
                <button onClick={() => onRemove(p.id)} style={{ display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 6, background: "var(--tint)", border: "none", borderRadius: 999, padding: "5px 11px", fontWeight: 800, fontSize: 11.5, cursor: "pointer", color: "var(--accent-d)" }}>
                  <CIcon name="x" size={12} /> Remove from collection
                </button>
              )}
              <ClimbCard post={p} meId={meId} canDelete={p.userId === meId || isAdmin} onDelete={() => onDeletePost(p.id)} onUpdate={onUpdatePost} onOpenUser={onOpenUser} />
            </div>
          ))}

        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Pick / create a collection to add a post to.
export function AddToCollectionSheet({ post, collections, onToggle, onCreate, onClose }: {
  post: ClimbPost; collections: ClimbCollection[]; onToggle: (colId: string) => void; onCreate: (name: string) => void; onClose: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 14px" }}>Add to collection</h2>

        {collections.map((c) => {
          const inIt = c.postIds.includes(post.id);
          return (
            <button key={c.id} onClick={() => onToggle(c.id)} className="card"
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 12, marginBottom: 8, cursor: "pointer", border: "1px solid var(--line)", textAlign: "left" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(150deg, var(--accent), var(--accent-d))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, flexShrink: 0 }}>{c.postIds.length}</div>
              <div style={{ flex: 1, fontWeight: 800, fontSize: 14 }}>{c.name}</div>
              <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: inIt ? "var(--green)" : "var(--tint)", color: inIt ? "#fff" : "var(--muted)" }}>
                <CIcon name={inIt ? "check" : "plus"} size={15} stroke={2.6} />
              </div>
            </button>
          );
        })}

        {creating ? (
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name…" onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) { onCreate(name.trim()); } }} />
            <button className="btn" style={{ width: "auto", padding: "0 16px" }} disabled={!name.trim()} onClick={() => name.trim() && onCreate(name.trim())}>Create</button>
          </div>
        ) : (
          <button className="btn ghost" style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={() => setCreating(true)}><CIcon name="plus" size={16} /> New collection</button>
        )}

        <div style={{ height: 10 }} />
        <button className="btn ghost" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
