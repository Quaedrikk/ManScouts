// ManScouts/Climbing — shared types & constants.

export const GYMS = ["Vertical Adventures"] as const;
export const WALLS = ["East Wall", "West Wall", "The Cave", "Slab", "Overhang"] as const;

export type ClimbColor = "blue" | "green" | "yellow" | "purple" | "black" | "pink";
export const CLIMB_COLORS: { key: ClimbColor; hex: string }[] = [
  { key: "blue", hex: "#2f6fe0" },
  { key: "green", hex: "#2faa50" },
  { key: "yellow", hex: "#e8b800" },
  { key: "purple", hex: "#7b3fb5" },
  { key: "black", hex: "#1f1f1f" },
  { key: "pink", hex: "#e0559f" },
];
export const colorHex = (c: ClimbColor) => CLIMB_COLORS.find((x) => x.key === c)?.hex ?? "#888";

// Bouldering hold shapes for the profile "holds box".
export const HOLD_SHAPES = ["jug", "crimp", "sloper", "pinch", "pocket"] as const;
export type HoldShape = (typeof HOLD_SHAPES)[number];

export interface ClimbProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  holdColor?: string; // color of the rocks in their holds box
}

export interface ClimbPost {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatarUrl: string;
  gym: string;
  wall: string;
  color: ClimbColor;
  grade: number; // V1–V6
  videoUrl: string;
  startSec?: number; // trimmed start of the successful climb
  note?: string;
  cheerCount?: number;
  createdAt: string;
}
