"use client";
import { useEffect, useMemo, useState } from "react";
import Badge from "./Badge";
import Stars from "./Stars";
import { chStars } from "@/lib/challenges";
import { useCatalog } from "@/lib/catalog";
import type { Challenge, Proposal, SeasonPhase } from "@/lib/types";

const PHASE_LABEL: Record<SeasonPhase, string> = {
  off: "Not open yet", voting: "Voting open", review: "Review & vote", closed: "Closed",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function BadgeVoting() {
  const { challenges, isAdmin, refresh } = useCatalog();
  const [phase, setPhase] = useState<SeasonPhase>("off");
  const [overlay, setOverlay] = useState<null | "intro" | "propose" | "review">(null);

  const loadSeason = () => fetch("/api/season").then((r) => r.json()).then((d) => setPhase(d.season?.phase ?? "off")).catch(() => {});
  useEffect(() => { loadSeason(); }, []);

  function openFlow() {
    // Show the explainer first, then drop into the active flow.
    if (!localStorage.getItem("ms:seenVoteIntro")) { setOverlay("intro"); return; }
    setOverlay(phase === "review" ? "review" : "propose");
  }
  function introDone() {
    localStorage.setItem("ms:seenVoteIntro", "1");
    setOverlay(phase === "review" ? "review" : "propose");
  }

  async function adminPost(body: object) {
    await fetch("/api/season", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await loadSeason();
    await refresh();
  }

  return (
    <div className="votebox">
      <div className="voteshine" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="label" style={{ color: "rgba(255,255,255,.7)" }}>Pre-Season · {PHASE_LABEL[phase]}</div>
        <div className="display" style={{ color: "#fff", fontSize: 22, margin: "2px 0 6px" }}>🗳 Badge Voting</div>
        <p style={{ color: "rgba(255,255,255,.8)", fontSize: 13, margin: "0 0 14px" }}>
          {phase === "voting" && "Review every badge and propose changes before the season starts."}
          {phase === "review" && "Vote yes/no on the proposed changes. Majority rules."}
          {phase === "off" && "Voting opens before the season. Sit tight."}
          {phase === "closed" && "Voting is closed — approved changes are live for the season."}
        </p>

        {(phase === "voting" || phase === "review") && (
          <button className="btn" onClick={openFlow} style={{ background: "#fff", color: "#2a2140" }}>
            {phase === "voting" ? "Review badges & propose changes" : "Vote on proposed changes"}
          </button>
        )}
        <button className="btn ghost" style={{ marginTop: 8, color: "#fff", background: "rgba(255,255,255,.14)" }} onClick={() => setOverlay("intro")}>
          How it works
        </button>

        {isAdmin && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.2)" }}>
            <div className="label" style={{ color: "rgba(255,255,255,.6)", marginBottom: 8 }}>Admin · simulate</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button className="chip" onClick={() => adminPost({ phase: "voting" })}>Open voting</button>
              <button className="chip" onClick={() => adminPost({ phase: "review" })}>→ Review</button>
              <button className="chip" onClick={() => adminPost({ action: "apply" })}>Tally &amp; apply</button>
              <button className="chip" onClick={() => adminPost({ action: "seed" })}>Seed demo</button>
              <button className="chip" onClick={() => adminPost({ action: "reset" })}>Reset</button>
            </div>
          </div>
        )}
      </div>

      {overlay === "intro" && <VoteIntro onClose={introDone} />}
      {overlay === "propose" && <Proposer challenges={challenges} onClose={() => setOverlay(null)} />}
      {overlay === "review" && <ReviewVote onClose={() => setOverlay(null)} />}
    </div>
  );
}

function VoteIntro({ onClose }: { onClose: () => void }) {
  const steps = [
    { n: "1", t: "Preview every badge", d: "All badges are pre-generated. Everyone reviews them before the season starts." },
    { n: "2", t: "Propose changes", d: "For any badge, propose new points, completion criteria, or whether it needs a witness. Your proposals are saved." },
    { n: "3", t: "Vote it in", d: "After voting closes, everyone votes yes/no on each proposal. A majority yes changes the badge for the season." },
  ];
  return (
    <div className="scrim" style={{ alignItems: "center" }} onClick={onClose}>
      <div className="sheet" style={{ borderRadius: 24, maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <div className="display votepop" style={{ fontSize: 24, textAlign: "center", margin: "2px 0 4px" }}>Pre-Season Voting</div>
        <p className="muted" style={{ textAlign: "center", fontSize: 13.5, margin: "0 0 18px" }}>Keep the contest fair — shape the badges together.</p>
        {steps.map((s, i) => (
          <div key={s.n} className="fadeup voteintrostep" style={{ animationDelay: `${0.1 + i * 0.12}s`, display: "flex", gap: 12, marginBottom: 14 }}>
            <span className="votestepnum">{s.n}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{s.t}</div>
              <div className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>{s.d}</div>
            </div>
          </div>
        ))}
        <div style={{ height: 8 }} />
        <button className="btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

function Proposer({ challenges, onClose }: { challenges: Challenge[]; onClose: () => void }) {
  const order = useMemo(() => shuffle(challenges), [challenges]);
  const [i, setI] = useState(0);
  const [editing, setEditing] = useState(false);
  const ch = order[i];
  const [pts, setPts] = useState(0);
  const [how, setHow] = useState("");
  const [witness, setWitness] = useState(true);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(0);

  useEffect(() => {
    if (!ch) return;
    setPts(ch.pts); setHow((ch.how ?? []).join("\n")); setWitness(ch.needsWitness !== false); setNote(""); setEditing(false);
  }, [ch]);

  if (!ch) return null;
  const done = i >= order.length;
  function next() { setI((x) => x + 1); }

  async function saveChange() {
    setBusy(true);
    const howArr = how.split("\n").map((s) => s.trim()).filter(Boolean);
    const changed: Record<string, unknown> = { challengeId: ch.id, challengeName: ch.nm };
    if (pts !== ch.pts) changed.pts = pts;
    if (JSON.stringify(howArr) !== JSON.stringify(ch.how ?? [])) changed.how = howArr;
    if (witness !== (ch.needsWitness !== false)) changed.needsWitness = witness;
    if (note.trim()) changed.note = note.trim();
    const hasChange = "pts" in changed || "how" in changed || "needsWitness" in changed;
    if (hasChange) {
      try { await fetch("/api/proposals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changed) }); setSubmitted((s) => s + 1); } catch { /* ignore */ }
    }
    setBusy(false);
    next();
  }

  return (
    <div className="scrim" style={{ alignItems: "center" }} onClick={onClose}>
      <div className="sheet" style={{ borderRadius: 24, maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        {done ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div className="votepop" style={{ fontSize: 46 }}>🎉</div>
            <div className="display" style={{ fontSize: 22, marginTop: 6 }}>All reviewed!</div>
            <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>You submitted {submitted} proposal{submitted === 1 ? "" : "s"}. They&apos;re saved for the review round.</p>
            <div style={{ height: 14 }} />
            <button className="btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <div key={ch.id} className="votecard">
            <div className="muted" style={{ textAlign: "center", fontSize: 12, fontWeight: 700 }}>{i + 1} / {order.length}</div>
            <div style={{ padding: "6px 0 8px" }}><Badge ch={ch} size={84} /></div>
            <div className="display" style={{ fontSize: 22, textAlign: "center" }}>{ch.nm}</div>
            <div className="muted" style={{ fontSize: 12, textAlign: "center", marginTop: 2 }}>{ch.cat}</div>

            {!editing ? (
              <>
                {/* Static read-only view */}
                <div className="card" style={{ padding: "12px 14px", margin: "14px 0 6px" }}>
                  <div className="label" style={{ marginBottom: 8 }}>Completion criteria</div>
                  {(ch.how ?? []).length === 0 ? (
                    <div className="muted" style={{ fontSize: 13 }}>One proof of completion.</div>
                  ) : (ch.how ?? []).map((h, k) => (
                    <div key={k} style={{ fontSize: 13.5, display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, color: "var(--muted)" }}>{k + 1}.</span>{h}
                    </div>
                  ))}
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
                    {ch.needsWitness === false ? "No witness required" : "Witness required"}
                  </div>
                </div>
                <div style={{ textAlign: "center", margin: "10px 0 16px" }}>
                  <div className="display" style={{ color: "var(--accent)", fontSize: 40, lineHeight: 1 }}>{ch.pts} pts</div>
                  <div style={{ marginTop: 4 }}><Stars n={chStars(ch)} size={15} /></div>
                </div>

                <button className="btn" onClick={next}>Next</button>
                <div style={{ height: 8 }} />
                <button className="btn ghost" onClick={() => setEditing(true)}>Propose change</button>
              </>
            ) : (
              <>
                <div className="label" style={{ margin: "14px 0 6px" }}>Points ({chStars({ pts })}★)</div>
                <input type="number" value={pts} onChange={(e) => setPts(Number(e.target.value) || 0)} />

                <div className="label" style={{ margin: "12px 0 6px" }}>Completion criteria (one capture per line)</div>
                <textarea rows={3} value={how} onChange={(e) => setHow(e.target.value)} />

                <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: 13.5, cursor: "pointer" }}>
                  <input type="checkbox" checked={witness} onChange={(e) => setWitness(e.target.checked)} style={{ width: 18, height: 18 }} />
                  Needs a witness
                </label>

                <div className="label" style={{ margin: "12px 0 6px" }}>Why? (optional)</div>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for the change" />

                <div style={{ height: 16 }} />
                <button className="btn green" disabled={busy} onClick={saveChange}>Done — save proposal</button>
                <div style={{ height: 8 }} />
                <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Diff({ from, to }: { from: React.ReactNode; to: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <span className="muted" style={{ textDecoration: "line-through" }}>{from}</span>
      <span style={{ color: "var(--muted)" }}>→</span>
      <span style={{ fontWeight: 800, color: "var(--accent)" }}>{to}</span>
    </span>
  );
}

function ReviewVote({ onClose }: { onClose: () => void }) {
  const { byId } = useCatalog();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<Set<string> | null>(null); // null = all
  const [started, setStarted] = useState(false);
  const load = () => fetch("/api/proposals").then((r) => r.json()).then((d) => setProposals(d.proposals ?? [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const catOf = (p: Proposal) => byId(p.challengeId)?.cat ?? "Other";
  const cats = Array.from(new Set(proposals.map(catOf))).sort();
  const sel = picked ?? new Set(cats);
  const shown = proposals.filter((p) => sel.has(catOf(p)));
  function toggleCat(c: string) {
    const next = new Set(sel);
    if (next.has(c)) next.delete(c); else next.add(c);
    setPicked(next);
  }

  async function vote(id: string, v: "yes" | "no") {
    setProposals((prev) => prev.map((p) => p.id === id ? { ...p, myVote: v, votesYes: (p.votesYes ?? 0) + (v === "yes" && p.myVote !== "yes" ? 1 : 0) - (p.myVote === "yes" && v !== "yes" ? 1 : 0), votesNo: (p.votesNo ?? 0) + (v === "no" && p.myVote !== "no" ? 1 : 0) - (p.myVote === "no" && v !== "no" ? 1 : 0) } : p));
    try { await fetch("/api/proposals/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ proposalId: id, vote: v }) }); } catch { /* ignore */ }
  }

  return (
    <div className="scrim" style={{ alignItems: "center" }} onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        <div className="display" style={{ fontSize: 22, textAlign: "center", margin: "2px 0 4px" }}>Review the proposals</div>
        <p className="muted" style={{ textAlign: "center", fontSize: 13, margin: "0 0 16px" }}>Majority yes changes the badge for the season.</p>

        {loading ? (
          <div className="display muted" style={{ textAlign: "center", padding: 30 }}>Loading…</div>
        ) : proposals.length === 0 ? (
          <p className="muted" style={{ textAlign: "center", padding: 24 }}>No proposals were submitted.</p>
        ) : !started ? (
          <>
            <div className="label" style={{ marginBottom: 8 }}>Which categories will you vote on?</div>
            <div className="seg" style={{ marginBottom: 14 }}>
              {cats.map((c) => (
                <button key={c} className={"chip" + (sel.has(c) ? " on" : "")} onClick={() => toggleCat(c)}>{c}</button>
              ))}
            </div>
            <div className="card" style={{ padding: 14, textAlign: "center", marginBottom: 14 }}>
              <div className="display" style={{ fontSize: 30, color: "var(--accent)" }}>{shown.length}</div>
              <div className="muted" style={{ fontSize: 13 }}>change{shown.length === 1 ? "" : "s"} to vote on</div>
            </div>
            <button className="btn" disabled={shown.length === 0} onClick={() => setStarted(true)}>Start voting</button>
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            {shown.map((p) => {
              const orig = byId(p.challengeId);
              return (
                <div key={p.id} className="card fadeup" style={{ padding: 14, marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{p.challengeName}</div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{catOf(p)} · proposed by {p.userName}</div>
                  <div style={{ display: "grid", gap: 6, fontSize: 13, marginBottom: 8 }}>
                    {typeof p.pts === "number" && <div><Diff from={`${orig?.pts ?? "?"} pts`} to={`${p.pts} pts`} /></div>}
                    {p.needsWitness != null && <div><Diff from={(orig?.needsWitness === false) ? "No witness" : "Witness"} to={p.needsWitness ? "Witness" : "No witness"} /></div>}
                    {p.how && (
                      <div>
                        <div className="muted" style={{ fontWeight: 700, marginBottom: 2 }}>Criteria →</div>
                        {p.how.map((h, k) => <div key={k} style={{ fontWeight: 700 }}>{k + 1}. {h}</div>)}
                      </div>
                    )}
                  </div>
                  {p.note && <div style={{ fontSize: 13, fontStyle: "italic", marginBottom: 10 }}>&quot;{p.note}&quot;</div>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className={"btn" + (p.myVote === "yes" ? " green" : " ghost")} style={{ flex: 1 }} onClick={() => vote(p.id, "yes")}>Yes · {p.votesYes ?? 0}</button>
                    <button className={"btn ghost"} style={{ flex: 1, ...(p.myVote === "no" ? { background: "var(--accent-d)", color: "#fff", boxShadow: "none" } : {}) }} onClick={() => vote(p.id, "no")}>No · {p.votesNo ?? 0}</button>
                  </div>
                </div>
              );
            })}
            <div style={{ height: 8 }} />
            <button className="btn ghost" onClick={onClose}>Done</button>
          </>
        )}
      </div>
    </div>
  );
}
