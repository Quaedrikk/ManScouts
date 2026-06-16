"use client";
import Avatar from "./Avatar";
import Badge from "./Badge";
import Scene from "./Scene";
import Stars from "./Stars";
import { chStars } from "@/lib/challenges";
import { useCatalog } from "@/lib/catalog";
import type { UserProfile, Post, Challenge } from "@/lib/types";

const SEED = [
  { id: "s1", cid: "summit", name: "Mateo Ruiz", handle: "@mateosends", ago: "2h", place: "Mt. Sanitas, CO", cap: "first peak of the season. legs are jelly, worth it 🫡", witness: "@joon", cheers: 48 },
  { id: "s2", cid: "cold", name: "Theo Park", handle: "@theoplunge", ago: "5h", place: "Barton Springs, TX", cap: "58°F. screamed. did it anyway.", witness: "@dmoss", cheers: 127 },
  { id: "s3", cid: "bread", name: "Andre Cole", handle: "@andrec", ago: "8h", place: "corner diner", cap: "sat with a guy named Sal for 2 hrs. heard his whole life story. underrated.", witness: "@kwon", cheers: 73 },
  { id: "s4", cid: "fire", name: "Jonah Bell", handle: "@jonahmakes", ago: "1d", place: "backyard", cap: "flint & steel only. took 40 mins but we ate 🔥", witness: "@rafi", cheers: 91 },
  { id: "s5", cid: "stars", name: "Dev Anand", handle: "@devlooksup", ago: "1d", place: "Joshua Tree", cap: "orion, cassiopeia, the big dipper. no light pollution = unreal", witness: "@mira", cheers: 64 },
  { id: "s6", cid: "plant", name: "Cam Whit", handle: "@camgrows", ago: "2d", place: "community garden", cap: "planted an oak. it'll outlive me and that's the point.", witness: "@lopez", cheers: 39 },
];

function fmtAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
}

interface PostCardProps {
  id: string;
  cid: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  proofUrl?: string;
  place: string;
  cap: string;
  witness: string;
  cheerCount: number;
  cheered: boolean;
  ago: string;
  onCheer: () => void;
  onPick: (ch: Challenge) => void;
  onDelete?: () => void;
  uid?: string;
  onOpenProfile?: (userId: string) => void;
}

function PostCard({ id, cid, name, handle, avatarUrl, proofUrl, place, cap, witness, cheerCount, cheered, ago, onCheer, onPick, onDelete, uid, onOpenProfile }: PostCardProps) {
  const { byId } = useCatalog();
  const ch = byId(cid);
  if (!ch) return null;
  const openProfile = uid && onOpenProfile ? () => onOpenProfile(uid) : undefined;
  return (
    <div className="card post fadeup">
      <div className="ph">
        <div onClick={openProfile} style={{ cursor: openProfile ? "pointer" : "default" }}>
          <Avatar name={name} handle={handle} img={avatarUrl} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div onClick={openProfile} style={{ fontWeight: 800, fontSize: 14.5, letterSpacing: "-.01em", cursor: openProfile ? "pointer" : "default", display: "inline-block" }}>{name}</div>
          <div className="muted" style={{ fontSize: 12.5 }}>{handle} · {ago}</div>
        </div>
        <div onClick={() => onPick(ch)} style={{ cursor: "pointer" }}>
          <Badge ch={ch} size={42} />
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            title="Delete post"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, marginLeft: 2, alignSelf: "flex-start" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#b0a99a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7" />
              <path d="M10 11v5M14 11v5" />
            </svg>
          </button>
        )}
      </div>
      <div style={{ fontSize: 14.5, marginBottom: 10, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
        <span>Earned <b>{ch.nm}</b></span>
        <Stars n={chStars(ch)} size={12} />
      </div>
      {proofUrl
        ? <img className="proof" src={proofUrl} alt="proof" />
        : <Scene an={ch.an} id={id} />}
      <div style={{ fontSize: 14, margin: "11px 2px 8px", lineHeight: 1.45 }}>{cap}</div>
      <div className="muted" style={{ fontSize: 12.5, margin: "0 2px 12px" }}>
        {place && <>📍 {place} · </>}vouched by {witness}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className={"cheer" + (cheered ? " on" : "")} onClick={onCheer}>
          <svg width="15" height="15" viewBox="0 0 100 100">
            <path
              d="M50 22 C66 42 70 54 60 68 C56 74 44 74 40 68 C34 60 38 54 44 50 C42 60 52 62 54 54 C56 46 46 42 50 22 Z"
              fill={cheered ? "#e5552b" : "none"}
              stroke={cheered ? "#e5552b" : "#7a7367"}
              strokeWidth="6" strokeLinejoin="round"
            />
          </svg>
          {cheerCount}
        </button>
        <span className="muted" style={{ fontSize: 12.5 }}>cheers</span>
      </div>
    </div>
  );
}

interface Props {
  profile: UserProfile;
  posts: Post[];
  cheers: Record<string, boolean>;
  cheerCounts: Record<string, number>;
  onCheer: (id: string) => void;
  onPick: (ch: Challenge) => void;
  onDelete: (id: string) => void;
  onOpenProfile: (userId: string) => void;
  goTrail: () => void;
}

export default function Board({ profile, posts, cheers, cheerCounts, onCheer, onPick, onDelete, onOpenProfile, goTrail }: Props) {
  const { isAdmin } = useCatalog();
  const myPosts = posts.filter((p) => p.userId === profile.id).map((p) => ({
    id: p.id,
    cid: p.challengeId,
    name: p.userName,
    handle: p.userHandle,
    avatarUrl: p.userAvatarUrl,
    proofUrl: p.proofUrl,
    place: p.place,
    cap: p.note,
    witness: p.witnessHandle || p.witnessName,
    cheerCount: cheerCounts[p.id] ?? p.cheerCount ?? 0,
    cheered: !!cheers[p.id],
    ago: fmtAgo(p.createdAt),
    ts: new Date(p.createdAt).getTime(),
    uid: p.userId as string | undefined,
    del: (() => onDelete(p.id)) as (() => void) | undefined,
  }));

  const otherPosts = posts.filter((p) => p.userId !== profile.id).map((p) => ({
    id: p.id,
    cid: p.challengeId,
    name: p.userName,
    handle: p.userHandle,
    avatarUrl: p.userAvatarUrl,
    proofUrl: p.proofUrl,
    place: p.place,
    cap: p.note,
    witness: p.witnessHandle || p.witnessName,
    cheerCount: cheerCounts[p.id] ?? p.cheerCount ?? 0,
    cheered: !!cheers[p.id],
    ago: fmtAgo(p.createdAt),
    ts: new Date(p.createdAt).getTime(),
    uid: p.userId as string | undefined,
    // Admins can delete anyone's post.
    del: (isAdmin ? () => onDelete(p.id) : undefined) as (() => void) | undefined,
  }));

  const seedCards = SEED.map((s) => ({
    ...s,
    avatarUrl: undefined as string | undefined,
    proofUrl: undefined as string | undefined,
    cheerCount: s.cheers,
    cheered: false,
    ts: Date.now() - (parseInt(s.ago) * (s.ago.endsWith("d") ? 86400000 : s.ago.endsWith("h") ? 3600000 : 60000)),
    uid: undefined as string | undefined,
    del: undefined as (() => void) | undefined,
  }));

  const feed = [...myPosts, ...otherPosts, ...seedCards].sort((a, b) => b.ts - a.ts);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", margin: "18px 2px 14px" }}>
        <div>
          <div className="display" style={{ fontSize: 26 }}>Postboard</div>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 2 }}>What scouts are pulling off right now</div>
        </div>
      </div>

      {myPosts.length === 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1, fontSize: 14 }}>You haven't posted yet. Earn your first badge and it lands here.</div>
          <button className="btn" style={{ width: "auto", padding: "11px 16px" }} onClick={goTrail}>Find one</button>
        </div>
      )}

      {feed.map((p) => (
        <PostCard
          key={p.id}
          {...p}
          onCheer={() => onCheer(p.id)}
          onPick={onPick}
          onDelete={p.del}
          onOpenProfile={onOpenProfile}
        />
      ))}
    </div>
  );
}
