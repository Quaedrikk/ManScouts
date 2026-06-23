"use client";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import ClimbCard from "./ClimbCard";
import CIcon from "./ClimbIcons";
import { colorHex, colorText, type ClimbCollection, type ClimbPost } from "@/lib/climb";

function fmtDay(iso: string) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }
  catch { return ""; }
}

function coverStyle(c: ClimbCollection, posts: ClimbPost[]): React.CSSProperties {
  if (c.coverUrl) return { background: `center/cover url(${c.coverUrl})` };
  const first = posts.find((p) => c.postIds.includes(p.id));
  if (first) { const h = colorHex(first.color); return { background: `linear-gradient(150deg, ${h}, color-mix(in srgb, ${h} 55%, #1a1813))` }; }
  return { background: "linear-gradient(150deg, var(--accent), var(--accent-d))" };
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
            <div style={{ width: 64, height: 64, borderRadius: "50%", ...coverStyle(c, posts), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "#fff", fontWeight: 900, fontSize: 16, boxShadow: "inset 0 0 0 3px #fff, 0 2px 8px rgba(26,24,19,.18)" }}>
              {!c.coverUrl && c.postIds.length}
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// A labelled climb row: coloured by climb colour, with VX / Gym / Wall / Day,
// an Add/Added toggle, and tapping the row previews the post.
function ClimbPickRow({ p, added, onToggle, onPreview }: { p: ClimbPost; added: boolean; onToggle: () => void; onPreview: () => void }) {
  const tc = colorText(p.color);
  return (
    <div onClick={onPreview}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", marginBottom: 8, borderRadius: 14, cursor: "pointer", background: colorHex(p.color), color: tc }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>{p.grade === 0 ? "Unrated" : `V${p.grade}`}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, opacity: .9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.gym} • {p.wall}</div>
        <div style={{ fontSize: 11.5, opacity: .8 }}>{fmtDay(p.createdAt)}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{ flexShrink: 0, border: "none", cursor: "pointer", borderRadius: 999, padding: "8px 14px", fontWeight: 800, fontSize: 12.5,
          background: added ? "rgba(255,255,255,.25)" : "#fff", color: added ? tc : "#1a1813", display: "inline-flex", alignItems: "center", gap: 5 }}>
        <CIcon name={added ? "check" : "plus"} size={14} stroke={2.6} /> {added ? "Added" : "Add"}
      </button>
    </div>
  );
}

// Single-post preview overlay.
function PostPreview({ post, meId, onClose }: { post: ClimbPost; meId: string; onClose: () => void }) {
  return (
    <div className="scrim" style={{ zIndex: 75 }} onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <ClimbCard post={post} meId={meId} canDelete={false} onDelete={() => {}} onUpdate={() => {}} />
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Create a new collection — nothing is saved until "Create collection".
export function CreateCollectionSheet({ ownerPosts, meId, onCreate, onClose }: {
  ownerPosts: ClimbPost[]; meId: string; onCreate: (c: { name: string; coverUrl?: string; postIds: string[] }) => void; onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [preview, setPreview] = useState<ClimbPost | null>(null);

  async function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    setUploading(true);
    try { const blob = await upload(`covers/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" }); setCoverUrl(blob.url); } catch { /* */ }
    setUploading(false);
  }
  function toggle(id: string) { setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]); }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 14px" }}>New collection</h2>

        <div className="label" style={{ marginBottom: 6 }}>Name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Projects, Outdoor, Comp…" />

        <div className="label" style={{ margin: "14px 0 6px" }}>Cover photo</div>
        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, border: "2px dashed var(--line)", ...(coverUrl ? { background: `center/cover url(${coverUrl})`, borderStyle: "solid" } : {}), display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", flexShrink: 0 }}>
            {!coverUrl && <CIcon name="camera" size={22} />}
          </div>
          <span className="muted" style={{ fontSize: 13 }}>{uploading ? "Uploading…" : coverUrl ? "Change cover" : "Choose a cover photo (optional)"}</span>
          <input type="file" accept="image/*" onChange={pickCover} className="hide" />
        </label>

        <div className="label" style={{ margin: "16px 0 8px" }}>Add your climbs</div>
        {ownerPosts.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 14 }}>You have no climbs yet.</p>}
        {ownerPosts.map((p) => <ClimbPickRow key={p.id} p={p} added={sel.includes(p.id)} onToggle={() => toggle(p.id)} onPreview={() => setPreview(p)} />)}

        <div style={{ height: 14 }} />
        <button className="btn" disabled={!name.trim()} onClick={() => onCreate({ name: name.trim(), coverUrl: coverUrl || undefined, postIds: sel })}>
          Create collection{sel.length ? ` · ${sel.length} climb${sel.length === 1 ? "" : "s"}` : ""}
        </button>
        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={onClose}>Cancel</button>

        {preview && <PostPreview post={preview} meId={meId} onClose={() => setPreview(null)} />}
      </div>
    </div>
  );
}

// View / edit an existing collection.
export function CollectionSheet({ collection, posts, ownerPosts, meId, isOwner, isAdmin, onAdd, onRemove, onRename, onSetCover, onDelete, onDeletePost, onUpdatePost, onOpenUser, onClose }: {
  collection: ClimbCollection; posts: ClimbPost[]; ownerPosts: ClimbPost[]; meId: string; isOwner: boolean; isAdmin: boolean;
  onAdd: (postId: string) => void; onRemove: (postId: string) => void; onRename: (name: string) => void; onSetCover: (url: string) => void; onDelete: () => void;
  onDeletePost: (id: string) => void; onUpdatePost: (p: ClimbPost) => void; onOpenUser: (id: string) => void; onClose: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(collection.name);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ClimbPost | null>(null);
  const inPosts = collection.postIds.map((id) => posts.find((p) => p.id === id)).filter(Boolean) as ClimbPost[];

  async function pickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
    setUploading(true);
    try { const blob = await upload(`covers/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" }); onSetCover(blob.url); } catch { /* */ }
    setUploading(false);
  }

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
            </>
          )}
        </div>

        {isOwner && (
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, border: "2px dashed var(--line)", ...(collection.coverUrl ? { background: `center/cover url(${collection.coverUrl})`, borderStyle: "solid" } : {}), display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", flexShrink: 0 }}>
              {!collection.coverUrl && <CIcon name="camera" size={20} />}
            </div>
            <span className="muted" style={{ fontSize: 13 }}>{uploading ? "Uploading…" : collection.coverUrl ? "Change cover photo" : "Add a cover photo"}</span>
            <input type="file" accept="image/*" onChange={pickCover} className="hide" />
          </label>
        )}

        {isOwner && (
          <>
            <div className="label" style={{ margin: "0 2px 8px" }}>Add your climbs</div>
            {ownerPosts.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 12 }}>You have no climbs yet.</p>}
            {ownerPosts.map((p) => (
              <ClimbPickRow key={p.id} p={p} added={collection.postIds.includes(p.id)}
                onToggle={() => (collection.postIds.includes(p.id) ? onRemove(p.id) : onAdd(p.id))} onPreview={() => setPreview(p)} />
            ))}
            <div className="label" style={{ margin: "16px 2px 8px" }}>In this collection</div>
          </>
        )}

        {inPosts.length === 0
          ? <p className="muted" style={{ textAlign: "center", padding: 18 }}>No climbs in this collection yet.</p>
          : inPosts.map((p) => (
            <ClimbCard key={p.id} post={p} meId={meId} canDelete={p.userId === meId || isAdmin} onDelete={() => onDeletePost(p.id)} onUpdate={onUpdatePost} onOpenUser={onOpenUser} />
          ))}

        {isOwner && (
          <>
            <div style={{ height: 8 }} />
            <button className="btn" style={{ background: "var(--accent-d)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }} onClick={onDelete}>
              <CIcon name="x" size={16} /> Delete collection
            </button>
          </>
        )}
        <div style={{ height: 8 }} />
        <button className="btn ghost" onClick={onClose}>Close</button>

        {preview && <PostPreview post={preview} meId={meId} onClose={() => setPreview(null)} />}
      </div>
    </div>
  );
}

// Pick / create a collection to add a post to (from the post menu).
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
              <div style={{ width: 40, height: 40, borderRadius: "50%", ...coverStyle(c, [post]), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, flexShrink: 0 }}>{!c.coverUrl && c.postIds.length}</div>
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
