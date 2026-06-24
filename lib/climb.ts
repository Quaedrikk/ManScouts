// ManScouts/Climbing — shared types & constants.

export const GYMS = ["Vertical Adventures"] as const;
export const WALLS = ["East Wall", "West Wall", "The Cave", "Slab", "Overhang"] as const;

export type ClimbColor = "blue" | "green" | "yellow" | "purple" | "black" | "pink" | "red" | "white";
export const CLIMB_COLORS: { key: ClimbColor; hex: string }[] = [
  { key: "blue", hex: "#2f6fe0" },
  { key: "green", hex: "#2faa50" },
  { key: "yellow", hex: "#e8b800" },
  { key: "purple", hex: "#7b3fb5" },
  { key: "black", hex: "#1f1f1f" },
  { key: "pink", hex: "#e0559f" },
  { key: "red", hex: "#d6342c" },
  { key: "white", hex: "#f4f1ea" },
];
export const colorHex = (c: ClimbColor) => CLIMB_COLORS.find((x) => x.key === c)?.hex ?? "#888";
// Readable text colour on top of a hold colour (white/yellow need dark ink).
export const colorText = (c: ClimbColor) => (c === "white" || c === "yellow" ? "#1a1813" : "#fff");

// Bouldering hold shapes for the profile "holds box".
export const HOLD_SHAPES = ["jug", "crimp", "sloper", "pinch", "pocket"] as const;
export type HoldShape = (typeof HOLD_SHAPES)[number];

export interface WallHold { x: number; y: number; type: HoldShape; color: string; rot?: number; size?: number }
export interface ClimbWall { bg?: string; holds: WallHold[] }

// Animated wall backgrounds for the profile wall (CSS classes: wd-<key>).
export const WALL_DESIGNS: { key: string; label: string }[] = [
  { key: "aurora", label: "Aurora" },
  { key: "lava", label: "Lava" },
  { key: "ocean", label: "Ocean" },
  { key: "sunset", label: "Sunset" },
  { key: "forest", label: "Forest" },
  { key: "galaxy", label: "Galaxy" },
  { key: "neon", label: "Neon" },
  { key: "ember", label: "Ember" },
  { key: "ice", label: "Glacier" },
  { key: "magma", label: "Magma" },
];
export const isWallDesign = (bg?: string) => !!bg && !bg.startsWith("#");

// Instagram-Highlights-style grouping of a climber's posts.
export interface ClimbCollection {
  id: string;
  name: string;
  coverUrl?: string;
  postIds: string[];
}

export interface ClimbProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  holdColor?: string; // color of the rocks in their holds box
  wall?: ClimbWall;   // customizable info wall (drag-and-drop holds)
  isSetter?: boolean; // self-serve route-setter role
  following?: string[]; // ids of climbers this user follows
  collections?: ClimbCollection[]; // profile highlight collections
}

export interface ClimbUserLite { id: string; name: string; handle: string; avatarUrl: string }

// Climber tier from the highest V grade they've sent.
export type ClimbTier = "Starter" | "Experienced";
export function climberTier(maxGrade: number): { tier: ClimbTier; v: number } {
  const v = Math.max(0, maxGrade || 0);
  return { tier: v >= 5 ? "Experienced" : "Starter", v };
}

export const REACTIONS = ["🔥", "💪", "👏", "😮", "🧗", "😂"] as const;

export interface ClimbComment {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  text: string;
  parentId?: string; // set when this comment is a reply to another comment
  createdAt: string;
}

// A labelled box on the facility map (fractions of the map rectangle, 0..1).
export interface FacilityBox {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Hold markers tapped onto the route photo (fractions of the image, 0..1).
export const HOLD_TYPES = ["Crimp", "Sloper", "Pinch", "Jug", "Pocket"] as const;
export type HoldType = (typeof HOLD_TYPES)[number];
export interface RouteHold { x: number; y: number; type: HoldType }

export interface Route {
  id: string;
  gym: string;
  wall: string;
  color: ClimbColor;
  grade: number;          // 0 = Unrated
  suggestions?: Record<string, number>; // userId -> suggested V grade (Unrated routes)
  setters: string[];      // who set it (can be multiple)
  photoUrl: string;
  holds: RouteHold[];
  createdBy: string;
  createdAt: string;
}

// Average suggested grade for an Unrated route, rounded; null if none.
export function suggestedGrade(r: Route): number | null {
  const vals = Object.values(r.suggestions ?? {});
  if (vals.length === 0) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export interface ClimbPost {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  gym: string;
  wall: string;
  routeId?: string;
  color: ClimbColor;
  grade: number; // V1–V6
  visibility?: "everyone" | "followers" | "me"; // default everyone
  videoUrl: string;
  startSec?: number; // trimmed start of the successful climb
  note?: string;
  likes?: string[];
  superLikes?: string[];
  reactions?: Record<string, string[]>;
  comments?: ClimbComment[];
  createdAt: string;
}
