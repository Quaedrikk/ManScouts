"use client";
import { useState } from "react";
import { BASE_PATH } from "@/lib/basePath";
import { upload } from "@vercel/blob/client";
import Ico from "./Ico";
import Badge from "./Badge";
import Stars from "./Stars";
import { chStars } from "@/lib/challenges";
import { useCatalog } from "@/lib/catalog";
import type { Challenge, BadgeShape, BadgeEffect } from "@/lib/types";

const REVOKE_PHRASE = "I revoke this right of passage";
const SHAPES: BadgeShape[] = [
  "circle", "shield", "hex", "rosette", "square", "star",
  "fish", "heart", "diamond", "octagon", "flower", "leaf",
  "triangle", "pentagon", "arrow", "crescent", "gem", "paw",
];
const EFFECTS: { key: BadgeEffect; label: string }[] = [
  { key: "aura", label: "Aura" }, { key: "shimmer", label: "Shimmer" },
  { key: "pulse", label: "Pulse" }, { key: "spin", label: "Spin" },
  { key: "gold", label: "Gold" }, { key: "rainbow", label: "🌈 Rainbow" },
  { key: "glitch", label: "Glitch" }, { key: "orbit", label: "★ Orbit" },
  { key: "sparkle", label: "Sparkle" }, { key: "fire", label: "🔥 Fire" },
  { key: "emberring", label: "Ember ring" }, { key: "smoke", label: "💨 Smoke" },
  { key: "lightning", label: "⚡ Lightning" }, { key: "water", label: "💧 Water" },
  { key: "frost", label: "❄ Frost" }, { key: "petals", label: "🍃 Petals" },
  { key: "shake", label: "Shake" }, { key: "bounce", label: "Bounce" },
  { key: "wobble", label: "Wobble" }, { key: "breathe", label: "Breathe" },
  { key: "neon", label: "Neon" }, { key: "glow", label: "Glow" },
  { key: "jelly", label: "Jelly" }, { key: "flip", label: "Flip" },
  { key: "bubbles", label: "Bubbles" }, { key: "snow", label: "❄ Snow" },
  { key: "rays", label: "Rays" }, { key: "runes", label: "Runes" },
  { key: "confetti", label: "🎉 Confetti" }, { key: "comet", label: "☄ Comet" },
];

function starsToDf(s: number): Challenge["df"] {
  return s <= 1 ? "Tenderfoot" : s === 2 ? "Trailhand" : s === 3 ? "Pathfinder" : "Frontiersman";
}

const ICON_NAMES = [
  "mountain", "tent", "flame", "water", "compass", "leaf", "fish", "axe",
  "sunrise", "boot", "moon", "knife", "knot", "wrench", "pot", "bowl",
  "hands", "horn", "bag", "teach", "seed", "drop", "pack", "stars", "wave", "board",
  "trophy", "star", "heart", "bolt", "crown", "anchor", "book", "camera",
  "globe", "dumbbell", "paw", "sword", "gear", "target", "music", "feather", "flag",
  "rock", "controller", "ball", "bike", "car", "key", "bulb", "clock",
  "phone", "rocket", "skull", "dice", "mask", "brush", "shield",
];

type Tool = "create" | "passages" | "categories" | "bulk";

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const { challenges, catList, cats, catColor, customCats, refresh } = useCatalog();
  const [tool, setTool] = useState<Tool>("create");

  // Create / edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nm, setNm] = useState("");
  const [blurb, setBlurb] = useState("");
  const [cat, setCat] = useState("Real Passages");
  const [stars, setStars] = useState(3);
  const [pts, setPts] = useState(50);
  const [artMode, setArtMode] = useState<"icon" | "image">("icon");
  const [ico, setIco] = useState("stars");
  const [imageUrl, setImageUrl] = useState("");
  const [shape, setShape] = useState<BadgeShape>("circle");
  const [effects, setEffects] = useState<BadgeEffect[]>([]);
  const [effectColors, setEffectColors] = useState<Partial<Record<BadgeEffect, string>>>({});
  const [proofMedia, setProofMedia] = useState<"photo" | "video" | "either">("either");
  const [how, setHow] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toggleEffect = (k: BadgeEffect) =>
    setEffects((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  const setFxColor = (k: BadgeEffect, c: string) => setEffectColors((p) => ({ ...p, [k]: c }));

  // Delete passage flow
  const [toDelete, setToDelete] = useState<Challenge | null>(null);
  const [confirmText, setConfirmText] = useState("");

  // Category form
  const [catName, setCatName] = useState("");
  const [catColorVal, setCatColorVal] = useState("#6f4a2a");
  const [catEdits, setCatEdits] = useState<Record<string, string>>({});

  // Passage editor controls
  const [pq, setPq] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  // Bulk import
  const [importText, setImportText] = useState("");

  // Full export of the current catalog (built-in + custom) with stylization.
  const exportJson = JSON.stringify(
    challenges.map((c) => ({
      nm: c.nm, cat: c.cat, stars: chStars(c), pts: c.pts, blurb: c.blurb,
      ico: c.ico, shape: c.shape ?? "circle", effects: c.effects ?? [],
      effectColors: c.effectColors ?? {}, color: c.color, proofMedia: c.proofMedia ?? "either",
      how: c.how ?? [], imageUrl: c.imageUrl, custom: !!c.custom,
    })),
    null, 2
  );

  async function copyExport() {
    try { await navigator.clipboard.writeText(exportJson); alert("Copied all passages to clipboard."); }
    catch { alert("Couldn't copy — select the text and copy manually."); }
  }

  async function importAll() {
    let arr: Partial<Challenge>[];
    try { arr = JSON.parse(importText); if (!Array.isArray(arr)) throw new Error(); }
    catch { alert("That isn't a valid JSON array."); return; }
    if (!confirm(`Import ${arr.length} passage(s)?`)) return;
    setSaving(true);
    let ok = 0;
    for (const b of arr) {
      try {
        const res = await fetch(`${BASE_PATH}/api/challenges`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...b, color: b.color ?? catColor(b.cat ?? "Real Passages") }),
        });
        if (res.ok) ok++;
      } catch { /* skip */ }
    }
    await refresh();
    setImportText("");
    setSaving(false);
    alert(`Imported ${ok} of ${arr.length}.`);
  }

  const customBadges = challenges.filter((c) => c.custom);
  const customCatNames = new Set(customCats.map((c) => c.name));

  const preview: Challenge = {
    id: "preview", nm: nm || "New Passage", cat, df: starsToDf(stars), stars, ico, an: "rays", pts,
    blurb, how: [], color: cats[cat]?.c, shape, effects, effectColors, proofMedia,
    imageUrl: artMode === "image" ? imageUrl : undefined, custom: true,
  };

  function resetForm() {
    setEditingId(null); setNm(""); setBlurb(""); setCat("Real Passages"); setStars(3);
    setPts(50); setArtMode("icon"); setIco("stars"); setImageUrl(""); setShape("circle");
    setEffects([]); setEffectColors({}); setProofMedia("either"); setHow("");
  }

  function loadForEdit(c: Challenge) {
    setEditingId(c.id);
    setNm(c.nm); setBlurb(c.blurb ?? ""); setCat(c.cat); setStars(chStars(c)); setPts(c.pts);
    setShape(c.shape ?? "circle"); setEffects(c.effects ?? []); setEffectColors(c.effectColors ?? {});
    setProofMedia(c.proofMedia ?? "either"); setHow((c.how ?? []).join("\n"));
    if (c.imageUrl) { setArtMode("image"); setImageUrl(c.imageUrl); }
    else { setArtMode("icon"); setIco(c.ico || "stars"); setImageUrl(""); }
    setTool("create");
  }

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const blob = await upload(`badges/${f.name}`, f, { access: "public", handleUploadUrl: `${BASE_PATH}/api/upload` });
      setImageUrl(blob.url);
    } catch { alert("Upload failed — try again."); }
    setUploading(false);
  }

  async function saveBadge() {
    if (!nm.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          nm, cat, df: starsToDf(stars), stars, pts, blurb, shape, effects, effectColors, proofMedia,
          ico: artMode === "icon" ? ico : "stars",
          imageUrl: artMode === "image" ? imageUrl : undefined,
          color: catColor(cat),
          how: how.split("\n").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) { alert("Couldn't save — admin only."); setSaving(false); return; }
      await refresh();
      const wasEditing = !!editingId;
      resetForm();
      alert(wasEditing ? "Updated!" : "Saved! It's now in Rights of Passage.");
    } catch { alert("Couldn't save — try again."); }
    setSaving(false);
  }

  async function deleteBadge() {
    if (!toDelete || confirmText.trim() !== REVOKE_PHRASE) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/challenges?id=${encodeURIComponent(toDelete.id)}`, { method: "DELETE" });
      if (!res.ok) { alert("Couldn't delete — admin only."); setSaving(false); return; }
      await refresh();
      setToDelete(null); setConfirmText("");
    } catch { alert("Couldn't delete — try again."); }
    setSaving(false);
  }

  async function deleteAllPassages() {
    if (!confirm(`Delete ALL ${customBadges.length} custom Rights of Passage? Built-in ones stay. This can't be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/challenges?all=1`, { method: "DELETE" });
      if (!res.ok) { alert("Couldn't delete — admin only."); setSaving(false); return; }
      await refresh();
      alert("All custom passages deleted.");
    } catch { alert("Couldn't delete — try again."); }
    setSaving(false);
  }

  async function deleteBuiltin(c: Challenge) {
    if (!confirm(`Remove the built-in passage "${c.nm}"? You can restore built-ins later.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/challenges?id=${encodeURIComponent(c.id)}`, { method: "DELETE" });
      if (!res.ok) { alert("Couldn't remove — admin only."); setSaving(false); return; }
      await refresh();
    } catch { alert("Couldn't remove — try again."); }
    setSaving(false);
  }

  async function restoreBuiltins() {
    setSaving(true);
    try {
      await fetch(`${BASE_PATH}/api/challenges?restore=1`, { method: "DELETE" });
      await refresh();
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function restoreBuiltinCats() {
    setSaving(true);
    try {
      await fetch(`${BASE_PATH}/api/categories?restore=1`, { method: "DELETE" });
      await refresh();
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function saveCategory(name: string, color: string) {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/categories`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      if (!res.ok) { alert("Couldn't save — admin only."); setSaving(false); return; }
      await refresh();
      setCatName("");
    } catch { alert("Couldn't save — try again."); }
    setSaving(false);
  }

  async function deleteCategory(name: string) {
    if (!confirm(`Delete the "${name}" category? Badges keep their tag but the category disappears from the list.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/categories?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      if (!res.ok) { alert("Couldn't delete — admin only."); setSaving(false); return; }
      await refresh();
    } catch { alert("Couldn't delete — try again."); }
    setSaving(false);
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 14px" }}>Admin Dashboard</h2>

        <div className="seg" style={{ marginBottom: 18 }}>
          <button className={"chip" + (tool === "create" ? " on" : "")} style={{ flex: 1 }} onClick={() => setTool("create")}>{editingId ? "Edit" : "Create"}</button>
          <button className={"chip" + (tool === "passages" ? " on" : "")} style={{ flex: 1 }} onClick={() => setTool("passages")}>Passages</button>
          <button className={"chip" + (tool === "categories" ? " on" : "")} style={{ flex: 1 }} onClick={() => setTool("categories")}>Categories</button>
          <button className={"chip" + (tool === "bulk" ? " on" : "")} style={{ flex: 1 }} onClick={() => setTool("bulk")}>Bulk</button>
        </div>

        {tool === "create" && (
          <>
            {editingId && (
              <div className="card" style={{ padding: "8px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>Editing an existing passage</span>
                <button className="chip" onClick={resetForm}>New instead</button>
              </div>
            )}
            <div style={{ padding: "4px 0 14px" }}><Badge ch={preview} size={92} /></div>

            <div className="label" style={{ margin: "0 0 6px" }}>Shape</div>
            <div className="seg" style={{ marginBottom: 12 }}>
              {SHAPES.map((s) => (
                <button key={s} className={"chip" + (shape === s ? " on" : "")} onClick={() => setShape(s)} style={{ textTransform: "capitalize" }}>{s}</button>
              ))}
            </div>

            <div className="label" style={{ margin: "0 0 6px" }}>Special effects (combine any)</div>
            <div className="seg" style={{ marginBottom: 12 }}>
              {EFFECTS.map((e) => (
                <button key={e.key} className={"chip" + (effects.includes(e.key) ? " on" : "")} onClick={() => toggleEffect(e.key)}>{e.label}</button>
              ))}
            </div>

            {effects.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="label" style={{ margin: "0 0 6px" }}>Color each effect</div>
                {effects.map((e) => {
                  const label = EFFECTS.find((x) => x.key === e)?.label ?? e;
                  return (
                    <div key={e} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                      <input type="color" value={effectColors[e] || catColor(cat)} onChange={(ev) => setFxColor(e, ev.target.value)} style={{ width: 40, height: 32, padding: 2 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{label}</span>
                      {effectColors[e] && (
                        <button className="chip" style={{ fontSize: 11 }} onClick={() => setEffectColors((p) => { const n = { ...p }; delete n[e]; return n; })}>Auto</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="label" style={{ margin: "0 0 6px" }}>Required proof</div>
            <div className="seg" style={{ marginBottom: 16 }}>
              {(["either", "photo", "video"] as const).map((m) => (
                <button key={m} className={"chip" + (proofMedia === m ? " on" : "")} onClick={() => setProofMedia(m)} style={{ textTransform: "capitalize" }}>
                  {m === "either" ? "Photo or video" : m}
                </button>
              ))}
            </div>

            <div className="label" style={{ marginBottom: 6 }}>Name</div>
            <input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="The Iron Mile" />

            <div className="label" style={{ margin: "14px 0 6px" }}>Description</div>
            <textarea rows={2} value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="What is this passage?" />

            <div className="label" style={{ margin: "14px 0 6px" }}>Category</div>
            <div className="seg">
              {catList.map((c) => (
                <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>

            <div className="label" style={{ margin: "14px 0 6px" }}>Difficulty</div>
            <div className="seg">
              {[1, 2, 3, 4, 5].map((d) => (
                <button key={d} className={"chip" + (stars === d ? " on" : "")} onClick={() => setStars(d)} style={{ display: "inline-flex", alignItems: "center" }}>
                  <Stars n={d} size={13} color={stars === d ? "#fff" : "var(--gold)"} />
                </button>
              ))}
            </div>

            <div className="label" style={{ margin: "14px 0 6px" }}>Points</div>
            <input type="number" value={pts} onChange={(e) => setPts(Number(e.target.value) || 0)} />

            <div className="label" style={{ margin: "14px 0 6px" }}>Badge art</div>
            <div className="seg" style={{ marginBottom: 10 }}>
              <button className={"chip" + (artMode === "icon" ? " on" : "")} onClick={() => setArtMode("icon")}>Pick an icon</button>
              <button className={"chip" + (artMode === "image" ? " on" : "")} onClick={() => setArtMode("image")}>Upload image</button>
            </div>

            {artMode === "icon" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8 }}>
                {ICON_NAMES.map((n) => (
                  <button key={n} onClick={() => setIco(n)}
                    style={{ aspectRatio: "1", borderRadius: 12, cursor: "pointer", border: ico === n ? "2px solid var(--ink)" : "1.5px solid var(--line)", background: ico === n ? catColor(cat) : "var(--card)", padding: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ico name={n} stroke={ico === n ? "#fff" : "var(--muted)"} />
                  </button>
                ))}
              </div>
            ) : (
              <label className="card" style={{ display: "block", padding: 24, textAlign: "center", cursor: "pointer", borderStyle: "dashed" }}>
                <div className="display" style={{ fontSize: 15, color: "var(--muted)" }}>
                  {uploading ? "Uploading…" : imageUrl ? "Image set — replace" : "Tap to upload badge art"}
                </div>
                <input type="file" accept="image/*" onChange={pickImage} className="hide" />
              </label>
            )}

            <div className="label" style={{ margin: "16px 0 6px" }}>How to earn it (one step per line)</div>
            <textarea rows={3} value={how} onChange={(e) => setHow(e.target.value)} placeholder={"Do the thing\nProve it\nGet it witnessed"} />

            <div style={{ height: 18 }} />
            <button className="btn" disabled={!nm.trim() || saving} onClick={saveBadge}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create Right of Passage"}
            </button>
          </>
        )}

        {tool === "passages" && (
          <>
            <input value={pq} onChange={(e) => setPq(e.target.value)} placeholder="🔎 Search passages…" style={{ marginBottom: 8 }} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, margin: "0 2px 12px", cursor: "pointer" }}>
              <input type="checkbox" checked={showInfo} onChange={(e) => setShowInfo(e.target.checked)} style={{ width: 16, height: 16 }} />
              Show all info (steps)
            </label>
            {challenges
              .filter((c) => { const q = pq.trim().toLowerCase(); return !q || c.nm.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q); })
              .map((c) => (
              <div key={c.id} className="card" style={{ padding: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Badge ch={c} size={42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                      {c.nm}
                      {c.generated ? <span style={{ fontWeight: 800, fontSize: 10.5, color: "#7b219f" }}> · generated</span>
                        : !c.custom ? <span className="muted" style={{ fontWeight: 400, fontSize: 11 }}> · built-in</span> : null}
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>{c.cat} · <Stars n={chStars(c)} size={10} /> · {c.pts} pts</div>
                  </div>
                  {c.custom ? (
                    <>
                      <button className="chip" onClick={() => loadForEdit(c)}>Edit</button>
                      <button onClick={() => { setToDelete(c); setConfirmText(""); }} style={{ background: "none", border: "none", color: "var(--accent-d)", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Delete</button>
                    </>
                  ) : (
                    <button onClick={() => deleteBuiltin(c)} style={{ background: "none", border: "none", color: "var(--accent-d)", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Remove</button>
                  )}
                </div>
                {showInfo && (c.how?.length ?? 0) > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                    {c.how.map((step, i) => (
                      <div key={i} className="muted" style={{ fontSize: 12.5, display: "flex", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 800, color: "var(--ink)" }}>{i + 1}.</span>{step}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div style={{ height: 8 }} />
            {customBadges.length > 0 && (
              <button className="btn" style={{ background: "var(--accent-d)", boxShadow: "none", marginBottom: 10 }} disabled={saving} onClick={deleteAllPassages}>
                Delete ALL custom passages ({customBadges.length})
              </button>
            )}
            <button className="btn ghost" disabled={saving} onClick={restoreBuiltins}>Restore removed built-in passages</button>
          </>
        )}

        {tool === "categories" && (
          <>
            <div className="label" style={{ marginBottom: 6 }}>New category</div>
            <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Brotherhood" />
            <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "10px 0 0" }}>
              <input type="color" value={catColorVal} onChange={(e) => setCatColorVal(e.target.value)} style={{ width: 50, height: 40, padding: 4 }} />
              <button className="btn" style={{ flex: 1 }} disabled={!catName.trim() || saving} onClick={() => saveCategory(catName, catColorVal)}>
                {saving ? "Saving…" : "Add category"}
              </button>
            </div>

            <div className="label" style={{ margin: "20px 0 8px" }}>All categories</div>
            {catList.map((c) => {
              const current = catEdits[c] ?? catColor(c);
              const isCustom = customCatNames.has(c);
              return (
                <div key={c} className="card" style={{ padding: 10, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="color" value={current} onChange={(e) => setCatEdits((p) => ({ ...p, [c]: e.target.value }))} style={{ width: 36, height: 30, padding: 2 }} />
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 13.5 }}>{c}{!isCustom && <span className="muted" style={{ fontWeight: 400 }}> · built-in</span>}</span>
                  {catEdits[c] && catEdits[c] !== catColor(c) && (
                    <button className="chip" onClick={() => saveCategory(c, catEdits[c])}>Save</button>
                  )}
                  <button onClick={() => deleteCategory(c)} style={{ background: "none", border: "none", color: "var(--accent-d)", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Delete</button>
                </div>
              );
            })}
            <div style={{ height: 6 }} />
            <button className="btn ghost" disabled={saving} onClick={restoreBuiltinCats}>Restore removed built-in categories</button>
            <p className="muted" style={{ fontSize: 12, textAlign: "center", marginTop: 8 }}>
              Recoloring a built-in saves an override. Deleting a built-in hides it (restorable); custom ones are removed.
            </p>
          </>
        )}

        {tool === "bulk" && (
          <>
            <div className="label" style={{ margin: "0 0 6px" }}>Export — current passages ({challenges.length})</div>
            <p className="muted" style={{ fontSize: 12.5, margin: "0 0 8px" }}>
              Copy this and paste it to Claude to generate new passages in the same style.
            </p>
            <textarea readOnly value={exportJson} rows={8} style={{ fontFamily: "monospace", fontSize: 11 }} onFocus={(e) => e.currentTarget.select()} />
            <div style={{ height: 8 }} />
            <button className="btn" onClick={copyExport}>Copy all passages</button>

            <div className="label" style={{ margin: "20px 0 6px" }}>Import — paste a JSON array</div>
            <p className="muted" style={{ fontSize: 12.5, margin: "0 0 8px" }}>
              Paste generated passages (array of objects) to add them all at once.
            </p>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={6} placeholder='[ { "nm": "...", "cat": "Real Passages", "stars": 3, "pts": 50, "blurb": "...", "ico": "flame", "shape": "shield", "effects": ["fire"], "how": ["..."] } ]' style={{ fontFamily: "monospace", fontSize: 11 }} />
            <div style={{ height: 10 }} />
            <button className="btn" disabled={!importText.trim() || saving} onClick={importAll}>{saving ? "Importing…" : "Import all"}</button>
          </>
        )}

        <div style={{ height: 10 }} />
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>

      {toDelete && (
        <div className="scrim" style={{ alignItems: "center", zIndex: 60 }} onClick={() => setToDelete(null)}>
          <div className="sheet" style={{ borderRadius: 24, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="grip" />
            <h3 className="display" style={{ fontSize: 20, textAlign: "center" }}>Revoke “{toDelete.nm}”?</h3>
            <p className="muted" style={{ fontSize: 14, textAlign: "center", margin: "8px 0 16px" }}>
              This permanently deletes the right of passage for everyone. To confirm, type:
              <br /><b style={{ color: "var(--ink)" }}>{REVOKE_PHRASE}</b>
            </p>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={REVOKE_PHRASE} autoFocus />
            <div style={{ height: 16 }} />
            <button className="btn" style={{ background: "var(--accent-d)", boxShadow: "none" }} disabled={confirmText.trim() !== REVOKE_PHRASE || saving} onClick={deleteBadge}>
              {saving ? "Revoking…" : "Permanently revoke"}
            </button>
            <div style={{ height: 10 }} />
            <button className="btn ghost" onClick={() => setToDelete(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
