import type { Challenge } from "./types";

// AI-generated, code-shipped passages. Marked generated:true so the admin
// passage editor flags them. Excludes removed categories (Nomad/Adventure/Real Passages).
function dfFor(stars: number): Challenge["df"] {
  return stars <= 1 ? "Tenderfoot" : stars === 2 ? "Trailhand" : stars === 3 ? "Pathfinder" : "Frontiersman";
}

type Gen = Omit<Challenge, "df" | "an" | "custom" | "generated"> & { stars: number };

const RAW: Gen[] = [
  // Angler
  { id: "g-angler-release", nm: "Catch & Release", cat: "Angler", stars: 1, pts: 10, blurb: "", ico: "fish", shape: "circle", effects: [], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Catch a fish and release it", "Record the release"] },
  { id: "g-angler-ice", nm: "Ice Ice Baby", cat: "Angler", stars: 2, pts: 20, blurb: "", ico: "fish", shape: "circle", effects: ["frost"], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Catch a fish through the ice", "Photo with the catch"] },
  { id: "g-angler-shore", nm: "Shore Lunch", cat: "Angler", stars: 2, pts: 25, blurb: "", ico: "pot", shape: "circle", effects: [], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Cook a fish you caught over a fire", "Photo of the meal"] },
  { id: "g-angler-fly", nm: "Fly Guy", cat: "Angler", stars: 3, pts: 35, blurb: "", ico: "fish", shape: "hex", effects: [], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Catch a fish on a fly rod", "Record the cast and catch"] },
  { id: "g-angler-oldman", nm: "The Old Man & the Sea", cat: "Angler", stars: 3, pts: 35, blurb: "", ico: "anchor", shape: "circle", effects: ["water"], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Catch a fish from a boat on open water", "Photo on the boat"] },
  { id: "g-angler-noodler", nm: "Noodler", cat: "Angler", stars: 4, pts: 50, blurb: "Bare hands", ico: "fish", shape: "rosette", effects: ["water", "pulse"], effectColors: { water: "#94e3fe" }, color: "#2f6f8f", proofMedia: "video", how: ["Catch a fish with your bare hands", "Record the whole thing"] },

  // Wilderness
  { id: "g-wild-fire", nm: "Firestarter", cat: "Wilderness", stars: 2, pts: 20, blurb: "", ico: "flame", shape: "circle", effects: ["fire"], effectColors: {}, color: "#2f7d57", proofMedia: "either", how: ["Start a fire with no lighter fluid", "Record the first flames"] },
  { id: "g-wild-forage", nm: "Forager", cat: "Wilderness", stars: 2, pts: 25, blurb: "Only if you're sure", ico: "leaf", shape: "circle", effects: [], effectColors: {}, color: "#2f7d57", proofMedia: "either", how: ["Identify a wild edible", "Photo of the find"] },
  { id: "g-wild-trail", nm: "Trail Blazer", cat: "Wilderness", stars: 3, pts: 35, blurb: "", ico: "boot", shape: "hex", effects: [], effectColors: {}, color: "#2f7d57", proofMedia: "either", how: ["Hike 15km in a single day", "Photo at the trail's end"] },
  { id: "g-wild-summit", nm: "Summit Fever", cat: "Wilderness", stars: 4, pts: 60, blurb: "", ico: "mountain", shape: "shield", effects: ["pulse"], effectColors: {}, color: "#2f7d57", proofMedia: "either", how: ["Summit a real mountain on foot", "Photo at the peak"] },

  // Green Thumb
  { id: "g-green-compost", nm: "Composter", cat: "Green Thumb", stars: 1, pts: 10, blurb: "", ico: "leaf", shape: "circle", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Start a compost bin", "Photo of it going"] },
  { id: "g-green-herb", nm: "Green Machine", cat: "Green Thumb", stars: 2, pts: 20, blurb: "", ico: "seed", shape: "circle", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Start a herb garden", "Photo of the sprouts"] },
  { id: "g-green-tree", nm: "Tree Hugger", cat: "Green Thumb", stars: 2, pts: 25, blurb: "", ico: "leaf", shape: "leaf", effects: ["petals"], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Plant a tree", "Photo of the planting"] },
  { id: "g-green-bee", nm: "Bee Friendly", cat: "Green Thumb", stars: 2, pts: 20, blurb: "", ico: "seed", shape: "flower", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Plant pollinator flowers", "Photo of a bee visiting"] },
  { id: "g-green-jungle", nm: "Jungle Room", cat: "Green Thumb", stars: 2, pts: 20, blurb: "", ico: "leaf", shape: "circle", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Keep 5 houseplants alive for a month", "Photo of them thriving"] },
  { id: "g-green-farm", nm: "Farm to Table", cat: "Green Thumb", stars: 3, pts: 35, blurb: "", ico: "pot", shape: "hex", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Cook a meal entirely from food you grew", "Photo of the plate"] },

  // Courage
  { id: "g-cour-openmic", nm: "Open Mic", cat: "Courage", stars: 3, pts: 30, blurb: "", ico: "horn", shape: "circle", effects: [], effectColors: {}, color: "#e0613a", proofMedia: "either", how: ["Perform on stage in front of strangers", "Record it"] },
  { id: "g-cour-plunge", nm: "Polar Plunge", cat: "Courage", stars: 3, pts: 30, blurb: "", ico: "water", shape: "hex", effects: ["frost", "pulse"], effectColors: {}, color: "#e0613a", proofMedia: "either", how: ["Plunge into freezing water", "Record the plunge"] },
  { id: "g-cour-shot", nm: "Shoot Your Shot", cat: "Courage", stars: 4, pts: 40, blurb: "", ico: "heart", shape: "heart", effects: ["pulse"], effectColors: {}, color: "#e0613a", proofMedia: "either", how: ["Ask a stranger on a date", "Record the ask"] },

  // Urbanist
  { id: "g-urb-rooftop", nm: "Rooftop Riser", cat: "Urbanist", stars: 3, pts: 30, blurb: "", ico: "camera", shape: "circle", effects: [], effectColors: {}, color: "#5a6b78", proofMedia: "either", how: ["Watch a sunset from a rooftop", "Photo of the skyline"] },
  { id: "g-urb-transit", nm: "Transit Master", cat: "Urbanist", stars: 2, pts: 20, blurb: "", ico: "car", shape: "circle", effects: [], effectColors: {}, color: "#5a6b78", proofMedia: "either", how: ["Cross the whole city using only public transit", "Photo of your transfers"] },
  { id: "g-urb-eats", nm: "Street Eats", cat: "Urbanist", stars: 1, pts: 15, blurb: "", ico: "bowl", shape: "circle", effects: [], effectColors: {}, color: "#5a6b78", proofMedia: "either", how: ["Try a street food cart you've never visited", "Photo of the food"] },

  // Hooligan
  { id: "g-hool-midnight", nm: "Midnight Run", cat: "Hooligan", stars: 3, pts: 30, blurb: "", ico: "boot", shape: "pentagon", effects: [], effectColors: {}, color: "#b5384d", proofMedia: "video", how: ["Sprint through a public fountain at night", "Record it"] },
  { id: "g-hool-cart", nm: "Cart Surfer", cat: "Hooligan", stars: 2, pts: 25, blurb: "", ico: "car", shape: "gem", effects: [], effectColors: {}, color: "#b5384d", proofMedia: "either", how: ["Ride a shopping cart across a parking lot", "Record the run"] },

  // Scholar
  { id: "g-sch-book", nm: "Bookworm", cat: "Scholar", stars: 2, pts: 20, blurb: "", ico: "book", shape: "circle", effects: [], effectColors: {}, color: "#a8c6fe", proofMedia: "either", how: ["Read a 300+ page book in a week", "Photo of the last page"] },
  { id: "g-sch-poly", nm: "Polyglot", cat: "Scholar", stars: 3, pts: 40, blurb: "", ico: "globe", shape: "circle", effects: [], effectColors: {}, color: "#a8c6fe", proofMedia: "either", how: ["Hold a 5-minute conversation in a new language", "Record it"] },
  { id: "g-sch-chess", nm: "Chess Master", cat: "Scholar", stars: 3, pts: 30, blurb: "", ico: "crown", shape: "hex", effects: [], effectColors: {}, color: "#a8c6fe", proofMedia: "either", how: ["Beat someone rated 1500+ in chess", "Screenshot the game"] },
  { id: "g-sch-cube", nm: "Cube Solver", cat: "Scholar", stars: 3, pts: 30, blurb: "", ico: "bulb", shape: "square", effects: [], effectColors: {}, color: "#a8c6fe", proofMedia: "video", how: ["Solve a Rubik's cube under 2 minutes", "Record the solve"] },

  // Gamer
  { id: "g-game-speed", nm: "Speedrunner", cat: "Gamer", stars: 3, pts: 40, blurb: "", ico: "controller", shape: "shield", effects: ["shimmer"], effectColors: {}, color: "#7b219f", proofMedia: "either", how: ["Beat a game under a known speedrun time", "Record the run"] },
  { id: "g-game-pixel", nm: "Pixel Perfect", cat: "Gamer", stars: 2, pts: 25, blurb: "", ico: "controller", shape: "circle", effects: [], effectColors: {}, color: "#7b219f", proofMedia: "either", how: ["Hit a personal best in any game", "Screenshot the score"] },
  { id: "g-game-retro", nm: "Retro Revival", cat: "Gamer", stars: 2, pts: 20, blurb: "", ico: "dice", shape: "circle", effects: [], effectColors: {}, color: "#7b219f", proofMedia: "either", how: ["Beat a game older than you", "Photo of the credits"] },
  { id: "g-game-nohit", nm: "No-Hit Run", cat: "Gamer", stars: 4, pts: 60, blurb: "", ico: "shield", shape: "hex", effects: ["aura"], effectColors: {}, color: "#7b219f", proofMedia: "either", how: ["Beat a boss without taking damage", "Record it"] },
  { id: "g-game-tourney", nm: "Tournament Arc", cat: "Gamer", stars: 4, pts: 80, blurb: "", ico: "trophy", shape: "rosette", effects: ["orbit", "sparkle"], effectColors: { orbit: "#9929bd" }, color: "#7b219f", proofMedia: "either", how: ["Place top 3 in a gaming tournament", "Photo of the bracket"] },
];

export const GENERATED: Challenge[] = RAW.map((g) => ({ ...g, df: dfFor(g.stars), an: "rays", generated: true }));
