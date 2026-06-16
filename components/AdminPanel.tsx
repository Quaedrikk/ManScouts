"use client";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import Ico from "./Ico";
import Badge from "./Badge";
import { DIFFS } from "@/lib/challenges";
import { useCatalog } from "@/lib/catalog";
import type { Challenge } from "@/lib/types";

const ICON_NAMES = [
  "mountain", "tent", "flame", "water", "compass", "leaf", "fish", "axe",
  "sunrise", "boot", "moon", "knife", "knot", "wrench", "pot", "bowl",
  "hands", "horn", "bag", "teach", "seed", "drop", "pack", "stars", "wave", "board",
];

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const { catList, cats, catColor, refresh } = useCatalog();
  const [mode, setMode] = useState<"badge" | "category">("badge");

  // Badge / Right of Passage form
  const [nm, setNm] = useState("");
  const [blurb, setBlurb] = useState("");
  const [cat, setCat] = useState("Real Passages");
  const [df, setDf] = useState<Challenge["df"]>("Frontiersman");
  const [pts, setPts] = useState(50);
  const [artMode, setArtMode] = useState<"icon" | "image">("icon");
  const [ico, setIco] = useState("stars");
  const [imageUrl, setImageUrl] = useState("");
  const [how, setHow] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Category form
  const [catName, setCatName] = useState("");
  const [catColorVal, setCatColorVal] = useState("#6f4a2a");

  // Live preview challenge object
  const preview: Challenge = {
    id: "preview", nm: nm || "New Passage", cat, df, ico, an: "rays", pts,
    blurb, how: [], color: artMode === "image" ? cats[cat]?.c : undefined,
    imageUrl: artMode === "image" ? imageUrl : undefined, custom: true,
  };

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const blob = await upload(`badges/${f.name}`, f, { access: "public", handleUploadUrl: "/api/upload" });
      setImageUrl(blob.url);
    } catch { alert("Upload failed — try again."); }
    setUploading(false);
  }

  async function saveBadge() {
    if (!nm.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nm, cat, df, pts, blurb,
          ico: artMode === "icon" ? ico : "stars",
          imageUrl: artMode === "image" ? imageUrl : undefined,
          color: catColor(cat),
          how: how.split("\n").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) { alert("Couldn't save — admin only."); setSaving(false); return; }
      await refresh();
      setNm(""); setBlurb(""); setImageUrl(""); setHow("");
      alert("Saved! It's now in Rights of Passage.");
    } catch { alert("Couldn't save — try again."); }
    setSaving(false);
  }

  async function saveCategory() {
    if (!catName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName.trim(), color: catColorVal }),
      });
      if (!res.ok) { alert("Couldn't save — admin only."); setSaving(false); return; }
      await refresh();
      setCatName("");
      alert("Category saved!");
    } catch { alert("Couldn't save — try again."); }
    setSaving(false);
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <h2 className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 14px" }}>Admin · Create</h2>

        <div className="seg" style={{ marginBottom: 18 }}>
          <button className={"chip" + (mode === "badge" ? " on" : "")} style={{ flex: 1 }} onClick={() => setMode("badge")}>Right of Passage</button>
          <button className={"chip" + (mode === "category" ? " on" : "")} style={{ flex: 1 }} onClick={() => setMode("category")}>Category</button>
        </div>

        {mode === "badge" ? (
          <>
            <div style={{ padding: "4px 0 14px" }}><Badge ch={preview} size={92} /></div>

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
              {Object.keys(DIFFS).map((d) => (
                <button key={d} className={"chip" + (df === d ? " on" : "")} onClick={() => setDf(d as Challenge["df"])}>{d}</button>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                {ICON_NAMES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setIco(n)}
                    style={{
                      aspectRatio: "1", borderRadius: 12, cursor: "pointer",
                      border: ico === n ? "2px solid var(--ink)" : "1.5px solid var(--line)",
                      background: ico === n ? catColor(cat) : "var(--card)",
                      padding: 8, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
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
              {saving ? "Saving…" : "Create Right of Passage"}
            </button>
          </>
        ) : (
          <>
            <div className="label" style={{ marginBottom: 6 }}>Category name</div>
            <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Brotherhood" />
            <div className="label" style={{ margin: "14px 0 6px" }}>Color</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input type="color" value={catColorVal} onChange={(e) => setCatColorVal(e.target.value)} style={{ width: 56, height: 44, padding: 4 }} />
              <input value={catColorVal} onChange={(e) => setCatColorVal(e.target.value)} placeholder="#6f4a2a" />
            </div>
            <div style={{ height: 18 }} />
            <button className="btn" disabled={!catName.trim() || saving} onClick={saveCategory}>
              {saving ? "Saving…" : "Save Category"}
            </button>
            <p className="muted" style={{ fontSize: 12.5, textAlign: "center", marginTop: 12 }}>
              Existing: {catList.join(", ")}
            </p>
          </>
        )}

        <div style={{ height: 10 }} />
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
