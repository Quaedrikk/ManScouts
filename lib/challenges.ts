import type { Challenge } from "./types";

export const DIFFS: Record<string, { c: string }> = {
  Tenderfoot: { c: "#1f8a5b" },
  Trailhand: { c: "#d9a441" },
  Pathfinder: { c: "#e5552b" },
  Frontiersman: { c: "#6d4ea8" },
};

// Difficulty is shown as 1–5 stars. Built-in tiers map onto the scale; admin
// badges can set any value 1–5 via `stars`.
export const DIFF_STARS: Record<string, number> = {
  Tenderfoot: 1,
  Trailhand: 2,
  Pathfinder: 3,
  Frontiersman: 4,
};

export const CATS: Record<string, { c: string }> = {
  Angler: { c: "#2f6f8f" },
  Wilderness: { c: "#2f7d57" },
  "Green Thumb": { c: "#5a9a3c" },
  Hooligan: { c: "#b5384d" },
  Samaritan: { c: "#2f8f8a" },
  Courage: { c: "#e0613a" },
  Urbanist: { c: "#5a6b78" },
  Athlete: { c: "#4a5ad9" },
};

export const CHALLENGES: Challenge[] = [
  { id: "summit", nm: "Summit Seeker", cat: "Wilderness", df: "Pathfinder", ico: "mountain", an: "rays", pts: 50, blurb: "Climb to the top of a real peak under your own power.", how: ["Photo at the base showing the peak ahead", "Photo at the summit marker or the view from the top"] },
  { id: "sky", nm: "Under Open Sky", cat: "Wilderness", df: "Trailhand", ico: "tent", an: "twinkle", pts: 35, blurb: "Sleep a full night outdoors.", how: ["Photo of your set-up camp at dusk", "Photo at the same camp the next sunrise"] },
  { id: "fire", nm: "Firebringer", cat: "Wilderness", df: "Trailhand", ico: "flame", an: "embers", pts: 35, blurb: "Build a fire from scratch with no lighter fluid.", how: ["Photo of your tinder and kindling laid out", "Video of lighting it with flint, friction, or one match", "Photo of the established fire"] },
  { id: "cold", nm: "Cold Water Oath", cat: "Athlete", df: "Trailhand", ico: "water", an: "ripple", pts: 35, blurb: "Submerge fully in cold natural water.", how: ["Video of you fully submerging in the cold water"], care: "Know your limits and never enter cold water alone." },
  { id: "forage", nm: "Wild Harvest", cat: "Green Thumb", df: "Pathfinder", ico: "leaf", an: "leaves", pts: 50, blurb: "Identify and gather a wild edible.", how: ["Photo of the wild edible with your ID/field-guide", "Photo of your responsible harvest"], care: "Only eat wild plants confirmed by an expert. When unsure, don't." },
  { id: "catch", nm: "Hook & Coal", cat: "Angler", df: "Trailhand", ico: "fish", an: "embers", pts: 35, blurb: "Catch a fish and cook it over a fire.", how: ["Photo/video of the fish you caught", "Photo of it cooked over the fire"] },
  { id: "chop", nm: "The Splitter", cat: "Wilderness", df: "Trailhand", ico: "axe", an: "sparks", pts: 35, blurb: "Split and stack firewood by hand.", how: ["Video of you splitting a round", "Photo of the finished stacked pile"] },
  { id: "dawn", nm: "Dawn Patrol", cat: "Athlete", df: "Tenderfoot", ico: "sunrise", an: "rays", pts: 20, blurb: "Be up before the sun and watch it rise.", how: ["Photo of the dark sky before first light", "Photo of the sunrise breaking the horizon"] },
  { id: "march", nm: "The Long March", cat: "Athlete", df: "Pathfinder", ico: "boot", an: "rays", pts: 50, blurb: "Cover ten miles on foot in a single day.", how: ["Photo at the start of your route", "Screenshot of your tracker showing 10+ miles in one day"] },
  { id: "silent", nm: "Silent Sabbath", cat: "Courage", df: "Tenderfoot", ico: "moon", an: "twinkle", pts: 20, blurb: "Spend 24 hours with no phone or screens.", how: ["Photo of your powered-off device at the start", "Photo of what you did with the screen-free day"] },
  { id: "whittle", nm: "The Whittler", cat: "Wilderness", df: "Tenderfoot", ico: "knife", an: "sparks", pts: 20, blurb: "Carve a useful object from wood.", how: ["Photo of your raw piece of wood", "Photo of the finished carved object"] },
  { id: "knots", nm: "Knot Master", cat: "Wilderness", df: "Tenderfoot", ico: "knot", an: "sparks", pts: 20, blurb: "Tie five essential knots from memory.", how: ["Video tying bowline, clove hitch, taut-line, figure-8 and square knots in a row, no reference"] },
  { id: "fix", nm: "The Mender", cat: "Urbanist", df: "Trailhand", ico: "wrench", an: "sparks", pts: 35, blurb: "Repair something broken instead of replacing it.", how: ["Photo of the broken item", "Photo/video of it working again after your repair"] },
  { id: "scratch", nm: "From Scratch", cat: "Green Thumb", df: "Trailhand", ico: "pot", an: "embers", pts: 35, blurb: "Cook a full meal from raw ingredients over flame.", how: ["Photo of your raw ingredients", "Photo/video of it cooking over flame", "Photo of the finished plate"] },
  { id: "bread", nm: "Break Bread", cat: "Samaritan", df: "Trailhand", ico: "bowl", an: "conf", pts: 35, blurb: "Share a real meal with a stranger.", how: ["Photo of the shared table with your new acquaintance (with their okay)"] },
  { id: "mend", nm: "Mend the Rift", cat: "Courage", df: "Pathfinder", ico: "hands", an: "conf", pts: 50, blurb: "Repair a relationship — apologize and mean it.", how: ["Photo or screenshot showing you reached out and made peace"] },
  { id: "speak", nm: "Stand & Speak", cat: "Courage", df: "Pathfinder", ico: "horn", an: "conf", pts: 50, blurb: "Speak or perform in front of a crowd.", how: ["Video of you speaking or performing in front of a real audience"] },
  { id: "steward", nm: "Trail Steward", cat: "Samaritan", df: "Tenderfoot", ico: "bag", an: "leaves", pts: 20, blurb: "Pack out more trash than you brought in.", how: ["Photo of the littered area before", "Photo of the full bag of trash you packed out"] },
  { id: "mentor", nm: "Pass It On", cat: "Samaritan", df: "Trailhand", ico: "teach", an: "conf", pts: 35, blurb: "Teach someone a skill you've earned.", how: ["Photo/video of you teaching the skill", "Photo of your student doing it themselves"] },
  { id: "plant", nm: "Rootmaker", cat: "Green Thumb", df: "Tenderfoot", ico: "seed", an: "leaves", pts: 20, blurb: "Plant a tree or garden.", how: ["Photo of the seedling/tree in the ground", "Photo of you watering it in"] },
  { id: "blood", nm: "Lifeblood", cat: "Samaritan", df: "Pathfinder", ico: "drop", an: "ripple", pts: 50, blurb: "Donate blood.", how: ["Photo in the donation chair mid-donation", "Photo of your bandage or donor wristband"] },
];

export const byId = (id: string) => CHALLENGES.find((c) => c.id === id);

// Difficulty as a 1–5 star count for any challenge.
export const chStars = (ch: { stars?: number; df?: string }): number =>
  ch.stars ?? DIFF_STARS[ch.df ?? ""] ?? 3;
