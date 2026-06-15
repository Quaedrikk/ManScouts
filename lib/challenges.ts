import type { Challenge } from "./types";

export const DIFFS: Record<string, { c: string }> = {
  Tenderfoot: { c: "#1f8a5b" },
  Trailhand: { c: "#d9a441" },
  Pathfinder: { c: "#e5552b" },
  Frontiersman: { c: "#6d4ea8" },
};

export const CATS: Record<string, { c: string }> = {
  Wilderness: { c: "#2f7d57" },
  Provision: { c: "#cf8a32" },
  Craft: { c: "#9c6b3f" },
  Grit: { c: "#4a5a66" },
  Courage: { c: "#e0613a" },
  Service: { c: "#2f8f8a" },
  Adventure: { c: "#b25533" },
};

export const CHALLENGES: Challenge[] = [
  { id: "summit", nm: "Summit Seeker", cat: "Wilderness", df: "Pathfinder", ico: "mountain", an: "rays", pts: 50, blurb: "Climb to the top of a real peak under your own power and look back at how far you came.", how: ["Pick a hill or mountain with a true summit", "Hike to the top on foot", "Snap proof at the marker or the view"] },
  { id: "sky", nm: "Under Open Sky", cat: "Wilderness", df: "Trailhand", ico: "tent", an: "twinkle", pts: 35, blurb: "Sleep a full night outdoors with the sky as your roof.", how: ["Find a safe, legal spot", "Sleep the night outside", "Capture your camp at dusk or dawn"] },
  { id: "fire", nm: "Firebringer", cat: "Craft", df: "Trailhand", ico: "flame", an: "embers", pts: 35, blurb: "Build a fire from scratch with no lighter fluid.", how: ["Gather tinder, kindling, fuel", "Light it with flint, friction, or one match", "Film or photograph the first flames"] },
  { id: "cold", nm: "Cold Water Oath", cat: "Grit", df: "Trailhand", ico: "water", an: "ripple", pts: 35, blurb: "Submerge in cold natural water and hold your breath in it.", how: ["Find safe open water — never alone", "Get fully in", "Capture the moment you go under"], care: "Know your limits and never enter cold water alone." },
  { id: "north", nm: "True North", cat: "Wilderness", df: "Pathfinder", ico: "compass", an: "rays", pts: 50, blurb: "Complete a route using only a paper map and compass.", how: ["Plan a route on paper", "Navigate it without GPS", "Photograph map, compass, and destination"] },
  { id: "forage", nm: "Wild Harvest", cat: "Provision", df: "Pathfinder", ico: "leaf", an: "leaves", pts: 50, blurb: "Identify and gather a wild edible.", how: ["Positively identify a wild edible", "Harvest responsibly", "Photograph your find"], care: "Only eat wild plants confirmed by an expert. When unsure, don't." },
  { id: "catch", nm: "Hook & Coal", cat: "Provision", df: "Trailhand", ico: "fish", an: "embers", pts: 35, blurb: "Catch a fish and cook it over a fire.", how: ["Catch your own fish", "Cook it on flame or coals", "Photograph the catch and the meal"] },
  { id: "chop", nm: "The Splitter", cat: "Craft", df: "Trailhand", ico: "axe", an: "sparks", pts: 35, blurb: "Split and stack a load of firewood by hand.", how: ["Split rounds with an axe or maul", "Stack them clean and square", "Photograph the finished stack"] },
  { id: "dawn", nm: "Dawn Patrol", cat: "Grit", df: "Tenderfoot", ico: "sunrise", an: "rays", pts: 20, blurb: "Wake before the sun and watch it rise.", how: ["Be up before first light", "Watch the sun break the horizon", "Capture the sunrise"] },
  { id: "march", nm: "The Long March", cat: "Grit", df: "Pathfinder", ico: "boot", an: "rays", pts: 50, blurb: "Cover ten miles on foot in a single day.", how: ["Plan a 10-mile route", "Walk or ruck it in one go", "Show your tracker or the trail's end"] },
  { id: "silent", nm: "Silent Sabbath", cat: "Grit", df: "Tenderfoot", ico: "moon", an: "twinkle", pts: 20, blurb: "Spend 24 hours with no phone or screens.", how: ["Power down for a full day", "Do something real with the time", "Photograph the powered-off device or your day"] },
  { id: "whittle", nm: "The Whittler", cat: "Craft", df: "Tenderfoot", ico: "knife", an: "sparks", pts: 20, blurb: "Carve a useful object from a piece of wood.", how: ["Choose a safe blade and wood", "Whittle something with a purpose", "Photograph the finished piece"] },
  { id: "knots", nm: "Knot Master", cat: "Craft", df: "Tenderfoot", ico: "knot", an: "sparks", pts: 20, blurb: "Tie five essential knots from memory.", how: ["Learn bowline, clove hitch, taut-line, figure-8, square", "Tie all five without looking them up", "Film yourself doing it"] },
  { id: "fix", nm: "The Mender", cat: "Craft", df: "Trailhand", ico: "wrench", an: "sparks", pts: 35, blurb: "Repair something broken instead of replacing it.", how: ["Find something broken", "Fix it with your own hands", "Photograph it working again"] },
  { id: "scratch", nm: "From Scratch", cat: "Provision", df: "Trailhand", ico: "pot", an: "embers", pts: 35, blurb: "Cook a full meal from raw ingredients over flame.", how: ["Start from raw ingredients", "Cook over fire or coals", "Photograph the finished plate"] },
  { id: "bread", nm: "Break Bread", cat: "Courage", df: "Trailhand", ico: "bowl", an: "conf", pts: 35, blurb: "Share a real meal and conversation with a stranger.", how: ["Sit down with someone new", "Share food and an honest talk", "Capture the table (with their okay)"] },
  { id: "mend", nm: "Mend the Rift", cat: "Courage", df: "Pathfinder", ico: "hands", an: "conf", pts: 50, blurb: "Repair a relationship — apologize and mean it.", how: ["Reach out to someone you fell out with", "Own your part, no conditions", "Note when and where it happened"] },
  { id: "speak", nm: "Stand & Speak", cat: "Courage", df: "Pathfinder", ico: "horn", an: "conf", pts: 50, blurb: "Speak or perform in front of a crowd.", how: ["Get in front of a real audience", "Say or perform your piece", "Have someone film it"] },
  { id: "steward", nm: "Trail Steward", cat: "Service", df: "Tenderfoot", ico: "bag", an: "leaves", pts: 20, blurb: "Pack out more trash than you brought in.", how: ["Carry a bag on your next outing", "Leave it cleaner than you found it", "Photograph the haul"] },
  { id: "mentor", nm: "Pass It On", cat: "Service", df: "Trailhand", ico: "teach", an: "conf", pts: 35, blurb: "Teach someone a skill you've earned.", how: ["Pick a skill worth sharing", "Spend real time teaching it", "Capture the lesson"] },
  { id: "plant", nm: "Rootmaker", cat: "Service", df: "Tenderfoot", ico: "seed", an: "leaves", pts: 20, blurb: "Plant a tree or garden and document it.", how: ["Plant something that will grow for years", "Water it in", "Photograph the planting"] },
  { id: "blood", nm: "Lifeblood", cat: "Service", df: "Pathfinder", ico: "drop", an: "ripple", pts: 50, blurb: "Donate blood.", how: ["Book a donation", "Give", "Photograph your bandage or wristband"] },
  { id: "solo", nm: "The Lone Trail", cat: "Adventure", df: "Frontiersman", ico: "pack", an: "rays", pts: 80, blurb: "Take a real trip entirely on your own.", how: ["Plan a solo overnight journey", "Go alone and self-reliant", "Document the road and the return"] },
  { id: "stars", nm: "Skyreader", cat: "Adventure", df: "Tenderfoot", ico: "stars", an: "twinkle", pts: 20, blurb: "Find and name three constellations.", how: ["Get away from city light", "Identify three constellations", "Photograph the night sky"] },
  { id: "river", nm: "River Run", cat: "Adventure", df: "Trailhand", ico: "wave", an: "ripple", pts: 35, blurb: "Paddle a stretch of moving water.", how: ["Get a canoe, kayak, or raft", "Run a safe stretch of river", "Capture you on the water"], care: "Always wear a life vest on the water." },
];

export const byId = (id: string) => CHALLENGES.find((c) => c.id === id);
