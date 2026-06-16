export interface Challenge {
  id: string;
  nm: string;
  cat: string;
  df: "Tenderfoot" | "Trailhand" | "Pathfinder" | "Frontiersman";
  ico: string;
  an: string;
  pts: number;
  blurb: string;
  how: string[];
  care?: string;
  stars?: number; // 1–5 difficulty; falls back to a mapping from `df`
  // Admin-created badges:
  imageUrl?: string; // custom uploaded art (used instead of the line icon)
  color?: string;    // explicit emblem color (falls back to category color)
  shape?: BadgeShape;
  effect?: BadgeEffect;     // legacy single effect (still honored)
  effects?: BadgeEffect[];  // combinable effects
  effectColor?: string;     // main color for the effects (falls back to emblem color)
  custom?: boolean;  // true for admin-created badges
}

export type BadgeShape =
  | "circle" | "shield" | "hex" | "rosette" | "square" | "star"
  | "fish" | "heart" | "diamond" | "octagon" | "flower" | "leaf";
export type BadgeEffect =
  | "none" | "aura" | "shimmer" | "pulse" | "spin" | "gold"
  | "orbit" | "sparkle" | "fire" | "lightning" | "water" | "frost" | "petals"
  | "smoke" | "rainbow" | "glitch" | "emberring";

export interface Category {
  name: string;
  color: string;
}

export interface WitnessSession {
  token: string;
  earnerId: string;
  earnerName: string;
  challengeId: string;
  challengeName: string;
  status: "pending" | "confirmed";
  witnessId?: string;
  witnessName?: string;
  witnessHandle?: string;
  witnessPhotoUrl?: string;
  createdAt: string;
}

// Per-user free-placement layout for the sash: postId -> position.
export type SashLayout = Record<string, { x: number; y: number; rot: number }>;

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  challengeId: string;
  proofUrl: string;
  proofType: "photo" | "video";
  place: string;
  lat?: number;
  lng?: number;
  note: string;
  witnessName: string;
  witnessHandle: string;
  witnessPhotoUrl?: string;
  cheerCount: number;
  createdAt: string;
}

export interface SeedPost {
  id: string;
  cid: string;
  name: string;
  handle: string;
  ago: string;
  place: string;
  cap: string;
  witness: string;
  cheers: number;
}
