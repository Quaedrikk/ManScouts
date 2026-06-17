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
  effectColor?: string;     // fallback color for effects (legacy / shared)
  effectColors?: Partial<Record<BadgeEffect, string>>; // per-effect color
  proofMedia?: "photo" | "video" | "either"; // required proof format
  custom?: boolean;  // true for admin-created badges
}

export type BadgeShape =
  | "circle" | "shield" | "hex" | "rosette" | "square" | "star"
  | "fish" | "heart" | "diamond" | "octagon" | "flower" | "leaf"
  | "triangle" | "pentagon" | "arrow" | "crescent" | "gem" | "paw";
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
  witnesses: WitnessEntry[]; // everyone who scanned in and confirmed with a photo
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
  featured?: string[]; // up to 3 challenge ids shown on the leaderboard
  squadId?: string;
}

export interface CoatOfArms {
  shape: "shield" | "circle" | "diamond" | "banner";
  division: "solid" | "pale" | "fess" | "bend" | "chevron";
  field: string;
  field2: string;
  icon: string;
  iconColor: string;
}

export interface Squad {
  id: string;
  name: string;
  stakes: string;
  coat: CoatOfArms;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  code: string; // invite code
}

// Lightweight squad snapshot stored on a profile/post for display.
export interface SquadBadge {
  id: string;
  name: string;
  coat: CoatOfArms;
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
  witnessName: string;       // joined names, for summary lines
  witnessHandle: string;     // first witness handle (legacy)
  witnessPhotoUrl?: string;  // first witness photo (legacy)
  witnesses?: WitnessEntry[];
  squad?: SquadBadge;        // poster's squad at time of posting
  cheerCount: number;
  createdAt: string;
}

export interface WitnessEntry {
  id: string;
  name: string;
  handle: string;
  photoUrl?: string;
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
