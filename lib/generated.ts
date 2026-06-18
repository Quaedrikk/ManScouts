import type { Challenge } from "./types";

// AI-generated, code-shipped passages. Marked generated:true so the admin
// passage editor flags them. Excludes removed categories (Nomad/Adventure/Real Passages).
function dfFor(stars: number): Challenge["df"] {
  return stars <= 1 ? "Tenderfoot" : stars === 2 ? "Trailhand" : stars === 3 ? "Pathfinder" : "Frontiersman";
}

type Gen = Omit<Challenge, "df" | "an" | "custom" | "generated"> & { stars: number };

const RAW: Gen[] = [
  // Angler
  { id: "g-angler-release", nm: "Catch & Release", cat: "Angler", stars: 1, pts: 10, blurb: "", ico: "fish", shape: "circle", effects: [], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Photo/video of the fish, then a clip of you releasing it"] },
  { id: "g-angler-ice", nm: "Ice Ice Baby", cat: "Angler", stars: 2, pts: 20, blurb: "", ico: "fish", shape: "circle", effects: ["frost"], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Photo of your hole in the ice", "Photo with the fish you pulled up"] },
  { id: "g-angler-shore", nm: "Shore Lunch", cat: "Angler", stars: 2, pts: 25, blurb: "", ico: "pot", shape: "circle", effects: [], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Photo of the fish you caught", "Photo of it cooked over the fire"] },
  { id: "g-angler-fly", nm: "Fly Guy", cat: "Angler", stars: 3, pts: 35, blurb: "", ico: "fish", shape: "hex", effects: [], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Video of your fly cast", "Photo with the fish landed on the fly"] },
  { id: "g-angler-oldman", nm: "The Old Man & the Sea", cat: "Angler", stars: 3, pts: 35, blurb: "", ico: "anchor", shape: "circle", effects: ["water"], effectColors: {}, color: "#2f6f8f", proofMedia: "either", how: ["Photo on the boat on open water", "Photo with the fish you caught"] },
  { id: "g-angler-noodler", nm: "Noodler", cat: "Angler", stars: 4, pts: 50, blurb: "Bare hands", ico: "fish", shape: "rosette", effects: ["water", "pulse"], effectColors: { water: "#94e3fe" }, color: "#2f6f8f", proofMedia: "video", how: ["Video of you catching a fish with your bare hands"] },

  // Wilderness
  { id: "g-wild-fire", nm: "Firestarter", cat: "Wilderness", stars: 2, pts: 20, blurb: "", ico: "flame", shape: "circle", effects: ["fire"], effectColors: {}, color: "#2f7d57", proofMedia: "either", how: ["Photo of your tinder laid out", "Video of the first flames, no lighter fluid"] },
  { id: "g-wild-forage", nm: "Forager", cat: "Wilderness", stars: 2, pts: 25, blurb: "Only if you're sure", ico: "leaf", shape: "circle", effects: [], effectColors: {}, color: "#2f7d57", proofMedia: "either", how: ["Photo of the wild edible with your field-guide/app ID"] },
  { id: "g-wild-trail", nm: "Trail Blazer", cat: "Wilderness", stars: 3, pts: 35, blurb: "", ico: "boot", shape: "hex", effects: [], effectColors: {}, color: "#2f7d57", proofMedia: "either", how: ["Photo at the trailhead", "Screenshot of your tracker showing 15+ km"] },
  { id: "g-wild-summit", nm: "Summit Fever", cat: "Wilderness", stars: 4, pts: 60, blurb: "", ico: "mountain", shape: "shield", effects: ["pulse"], effectColors: {}, color: "#2f7d57", proofMedia: "either", how: ["Photo at the base", "Photo at the mountain summit"] },

  // Green Thumb
  { id: "g-green-compost", nm: "Composter", cat: "Green Thumb", stars: 1, pts: 10, blurb: "", ico: "leaf", shape: "circle", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Photo of your started compost bin"] },
  { id: "g-green-herb", nm: "Green Machine", cat: "Green Thumb", stars: 2, pts: 20, blurb: "", ico: "seed", shape: "circle", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Photo of your planted herb garden", "Photo of the sprouts a week later"] },
  { id: "g-green-tree", nm: "Tree Hugger", cat: "Green Thumb", stars: 2, pts: 25, blurb: "", ico: "leaf", shape: "leaf", effects: ["petals"], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Photo of the tree planted in the ground"] },
  { id: "g-green-bee", nm: "Bee Friendly", cat: "Green Thumb", stars: 2, pts: 20, blurb: "", ico: "seed", shape: "flower", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Photo of your planted flowers", "Photo of a pollinator visiting them"] },
  { id: "g-green-jungle", nm: "Jungle Room", cat: "Green Thumb", stars: 2, pts: 20, blurb: "", ico: "leaf", shape: "circle", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Photo of your 5 houseplants", "Photo of them all alive a month later"] },
  { id: "g-green-farm", nm: "Farm to Table", cat: "Green Thumb", stars: 3, pts: 35, blurb: "", ico: "pot", shape: "hex", effects: [], effectColors: {}, color: "#5a9a3c", proofMedia: "either", how: ["Photo of your home-grown ingredients", "Photo of the finished dish"] },

  // Courage
  { id: "g-cour-openmic", nm: "Open Mic", cat: "Courage", stars: 3, pts: 30, blurb: "", ico: "horn", shape: "circle", effects: [], effectColors: {}, color: "#e0613a", proofMedia: "either", how: ["Video of you performing on stage in front of strangers"] },
  { id: "g-cour-plunge", nm: "Polar Plunge", cat: "Courage", stars: 3, pts: 30, blurb: "", ico: "water", shape: "hex", effects: ["frost", "pulse"], effectColors: {}, color: "#e0613a", proofMedia: "either", how: ["Video of you plunging into the freezing water"] },
  { id: "g-cour-shot", nm: "Shoot Your Shot", cat: "Courage", stars: 4, pts: 40, blurb: "", ico: "heart", shape: "heart", effects: ["pulse"], effectColors: {}, color: "#e0613a", proofMedia: "either", how: ["Video of you asking a stranger on a date"] },

  // Urbanist
  { id: "g-urb-rooftop", nm: "Rooftop Riser", cat: "Urbanist", stars: 3, pts: 30, blurb: "", ico: "camera", shape: "circle", effects: [], effectColors: {}, color: "#5a6b78", proofMedia: "either", how: ["Photo of the city skyline from the rooftop at sunset"] },
  { id: "g-urb-transit", nm: "Transit Master", cat: "Urbanist", stars: 2, pts: 20, blurb: "", ico: "car", shape: "circle", effects: [], effectColors: {}, color: "#5a6b78", proofMedia: "either", how: ["Photo at your starting stop", "Photo across the city with your transit ticket"] },
  { id: "g-urb-eats", nm: "Street Eats", cat: "Urbanist", stars: 1, pts: 15, blurb: "", ico: "bowl", shape: "circle", effects: [], effectColors: {}, color: "#5a6b78", proofMedia: "either", how: ["Photo of the street-food cart and what you ordered"] },

  // Hooligan
  { id: "g-hool-midnight", nm: "Midnight Run", cat: "Hooligan", stars: 3, pts: 30, blurb: "", ico: "boot", shape: "pentagon", effects: [], effectColors: {}, color: "#b5384d", proofMedia: "video", how: ["Video of you sprinting through the fountain at night"] },
  { id: "g-hool-cart", nm: "Cart Surfer", cat: "Hooligan", stars: 2, pts: 25, blurb: "", ico: "car", shape: "gem", effects: [], effectColors: {}, color: "#b5384d", proofMedia: "either", how: ["Video of you riding the shopping cart across the lot"] },

  // Scholar
  { id: "g-sch-book", nm: "Bookworm", cat: "Scholar", stars: 2, pts: 20, blurb: "", ico: "book", shape: "circle", effects: [], effectColors: {}, color: "#a8c6fe", proofMedia: "either", how: ["Photo of the book cover", "Photo of the final page within a week"] },
  { id: "g-sch-poly", nm: "Polyglot", cat: "Scholar", stars: 3, pts: 40, blurb: "", ico: "globe", shape: "circle", effects: [], effectColors: {}, color: "#a8c6fe", proofMedia: "either", how: ["Video of you holding a 5-minute conversation in the new language"] },
  { id: "g-sch-chess", nm: "Chess Master", cat: "Scholar", stars: 3, pts: 30, blurb: "", ico: "crown", shape: "hex", effects: [], effectColors: {}, color: "#a8c6fe", proofMedia: "either", how: ["Screenshot of the won game vs a 1500+ opponent"] },
  { id: "g-sch-cube", nm: "Cube Solver", cat: "Scholar", stars: 3, pts: 30, blurb: "", ico: "bulb", shape: "square", effects: [], effectColors: {}, color: "#a8c6fe", proofMedia: "video", how: ["Video of your sub-2-minute cube solve"] },

  // Gamer
  { id: "g-game-speed", nm: "Speedrunner", cat: "Gamer", stars: 3, pts: 40, blurb: "", ico: "controller", shape: "shield", effects: ["shimmer"], effectColors: {}, color: "#7b219f", proofMedia: "either", how: ["Recording of your speedrun under the target time"] },
  { id: "g-game-pixel", nm: "Pixel Perfect", cat: "Gamer", stars: 2, pts: 25, blurb: "", ico: "controller", shape: "circle", effects: [], effectColors: {}, color: "#7b219f", proofMedia: "either", how: ["Screenshot of your new personal best score"] },
  { id: "g-game-retro", nm: "Retro Revival", cat: "Gamer", stars: 2, pts: 20, blurb: "", ico: "dice", shape: "circle", effects: [], effectColors: {}, color: "#7b219f", proofMedia: "either", how: ["Photo of the end credits of the retro game"] },
  { id: "g-game-nohit", nm: "No-Hit Run", cat: "Gamer", stars: 4, pts: 60, blurb: "", ico: "shield", shape: "hex", effects: ["aura"], effectColors: {}, color: "#7b219f", proofMedia: "either", how: ["Video of the boss beaten without taking damage"] },
  { id: "g-game-tourney", nm: "Tournament Arc", cat: "Gamer", stars: 4, pts: 80, blurb: "", ico: "trophy", shape: "rosette", effects: ["orbit", "sparkle"], effectColors: { orbit: "#9929bd" }, color: "#7b219f", proofMedia: "either", how: ["Photo of the bracket/standings showing your top-3 finish"] },
];

export const GENERATED: Challenge[] = RAW.map((g) => ({ ...g, df: dfFor(g.stars), an: "rays", generated: true }));
