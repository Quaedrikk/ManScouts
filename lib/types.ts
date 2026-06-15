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
}

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
  note: string;
  witnessName: string;
  witnessHandle: string;
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
