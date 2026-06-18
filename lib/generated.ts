import type { Challenge, BadgeShape, BadgeEffect } from "./types";

// AI-generated, code-shipped passages (generated:true). Includes refactored
// versions of the admin's earlier custom passages plus fillers so every kept
// category reaches 15 badges (with built-ins). Steps are measurable + capturable.
function dfFor(stars: number): Challenge["df"] {
  return stars <= 1 ? "Tenderfoot" : stars === 2 ? "Trailhand" : stars === 3 ? "Pathfinder" : "Frontiersman";
}

interface Gen {
  id: string; nm: string; cat: string; stars: number; pts: number; ico: string;
  shape: BadgeShape; effects: BadgeEffect[]; how: string[];
  effectColors?: Partial<Record<BadgeEffect, string>>; color: string;
  proofMedia?: "photo" | "video" | "either"; blurb?: string;
}

const C = {
  Angler: "#2f6f8f", Wilderness: "#2f7d57", "Green Thumb": "#5a9a3c", Hooligan: "#b5384d",
  Samaritan: "#2f8f8a", Courage: "#e0613a", Urbanist: "#5a6b78", Athlete: "#4a5ad9",
  Scholar: "#a8c6fe", Gamer: "#7b219f",
} as const;

const RAW: Gen[] = [
  // ===== Angler (14) =====
  { id: "g-an-the", nm: "The Angler", cat: "Angler", stars: 2, pts: 15, ico: "fish", shape: "circle", effects: [], color: C.Angler, how: ["Photo or video of the fish you caught"] },
  { id: "g-an-release", nm: "Catch & Release", cat: "Angler", stars: 1, pts: 10, ico: "fish", shape: "circle", effects: [], color: C.Angler, how: ["Video of the fish, then releasing it back"] },
  { id: "g-an-ice", nm: "Ice Ice Baby", cat: "Angler", stars: 2, pts: 20, ico: "fish", shape: "circle", effects: ["frost"], color: C.Angler, how: ["Photo of your ice hole", "Photo with the fish you pulled up"] },
  { id: "g-an-shore", nm: "Shore Lunch", cat: "Angler", stars: 2, pts: 25, ico: "pot", shape: "circle", effects: [], color: C.Angler, how: ["Photo of the fish you caught", "Photo of it cooked over the fire"] },
  { id: "g-an-clean", nm: "Clean Catch", cat: "Angler", stars: 2, pts: 20, ico: "knife", shape: "circle", effects: [], color: C.Angler, proofMedia: "video", how: ["Video of you filleting your catch"] },
  { id: "g-an-night", nm: "Night Bite", cat: "Angler", stars: 2, pts: 25, ico: "moon", shape: "circle", effects: [], color: C.Angler, how: ["Photo of your night setup", "Photo with the fish caught after dark"] },
  { id: "g-an-fly", nm: "Fly Guy", cat: "Angler", stars: 3, pts: 35, ico: "fish", shape: "hex", effects: [], color: C.Angler, how: ["Video of your fly cast", "Photo with the fish landed on the fly"] },
  { id: "g-an-oldman", nm: "The Old Man & the Sea", cat: "Angler", stars: 3, pts: 35, ico: "anchor", shape: "circle", effects: ["water"], color: C.Angler, how: ["Photo on a boat on open water", "Photo with your catch"] },
  { id: "g-an-slam", nm: "Grand Slam", cat: "Angler", stars: 3, pts: 40, ico: "fish", shape: "hex", effects: [], color: C.Angler, how: ["Photos of 3 different fish species caught the same day"] },
  { id: "g-an-river", nm: "River Run", cat: "Angler", stars: 2, pts: 25, ico: "wave", shape: "circle", effects: ["water"], color: C.Angler, how: ["Photo of you on moving water", "Photo with the fish"] },
  { id: "g-an-derby", nm: "Derby Day", cat: "Angler", stars: 3, pts: 35, ico: "trophy", shape: "hex", effects: [], color: C.Angler, how: ["Photo at a fishing derby", "Photo of your weigh-in slip"] },
  { id: "g-an-big", nm: "The Big One", cat: "Angler", stars: 4, pts: 50, ico: "fish", shape: "rosette", effects: ["pulse"], color: C.Angler, how: ["Photo of a 5+ lb fish on the scale"] },
  { id: "g-an-noodle", nm: "Noodler", cat: "Angler", stars: 4, pts: 50, ico: "fish", shape: "rosette", effects: ["water", "pulse"], effectColors: { water: "#94e3fe" }, color: C.Angler, proofMedia: "video", how: ["Video of catching a fish with your bare hands"] },
  { id: "g-an-master", nm: "Master Angler", cat: "Angler", stars: 5, pts: 200, ico: "fish", shape: "rosette", effects: ["water", "sparkle", "aura"], effectColors: { water: "#94e3fe" }, color: C.Angler, how: ["Photo of a Master Angler-class fish on the measure", "Photo of the Master Angler award/entry"] },

  // ===== Wilderness (9) =====
  { id: "g-wd-fire", nm: "Firestarter", cat: "Wilderness", stars: 2, pts: 20, ico: "flame", shape: "circle", effects: ["fire"], color: C.Wilderness, how: ["Photo of your tinder laid out", "Video of the first flames, no lighter fluid"] },
  { id: "g-wd-forage", nm: "Forager", cat: "Wilderness", stars: 2, pts: 25, ico: "leaf", shape: "circle", effects: [], color: C.Wilderness, how: ["Photo of the wild edible with your field-guide/app ID"] },
  { id: "g-wd-sun", nm: "Hello, Mr. Sun", cat: "Wilderness", stars: 1, pts: 10, ico: "sunrise", shape: "circle", effects: [], color: C.Wilderness, how: ["Selfie with the sunrise from a hill"] },
  { id: "g-wd-paddle", nm: "Paddler", cat: "Wilderness", stars: 2, pts: 20, ico: "wave", shape: "circle", effects: ["water"], color: C.Wilderness, how: ["Photo mid-paddle on the water", "Photo at the far shore"] },
  { id: "g-wd-trail", nm: "Trail Blazer", cat: "Wilderness", stars: 3, pts: 35, ico: "boot", shape: "hex", effects: [], color: C.Wilderness, how: ["Photo at the trailhead", "Screenshot of your tracker showing 15+ km"] },
  { id: "g-wd-camp", nm: "Happy Camper", cat: "Wilderness", stars: 3, pts: 30, ico: "tent", shape: "hex", effects: [], color: C.Wilderness, how: ["Photo of your campsite", "Photo at camp the second morning"] },
  { id: "g-wd-summit", nm: "Summit Fever", cat: "Wilderness", stars: 4, pts: 60, ico: "mountain", shape: "shield", effects: ["pulse"], color: C.Wilderness, how: ["Photo at the base", "Photo at the mountain summit"] },
  { id: "g-wd-stars", nm: "Skyreader", cat: "Wilderness", stars: 2, pts: 20, ico: "stars", shape: "circle", effects: ["sparkle"], color: C.Wilderness, how: ["Photo of the night sky away from city light"] },
  { id: "g-wd-outdoors", nm: "The Great Outdoors", cat: "Wilderness", stars: 4, pts: 60, ico: "tent", shape: "shield", effects: ["petals"], color: C.Wilderness, how: ["Photo on day 1 of a 3-day hike", "Photo at the finish"] },

  // ===== Green Thumb (12) =====
  { id: "g-gt-compost", nm: "Composter", cat: "Green Thumb", stars: 1, pts: 10, ico: "leaf", shape: "circle", effects: [], color: C["Green Thumb"], how: ["Photo of your started compost bin"] },
  { id: "g-gt-herb", nm: "Green Machine", cat: "Green Thumb", stars: 2, pts: 20, ico: "seed", shape: "circle", effects: [], color: C["Green Thumb"], how: ["Photo of your planted herb garden", "Photo of the sprouts a week later"] },
  { id: "g-gt-veg", nm: "Vegetarian", cat: "Green Thumb", stars: 2, pts: 20, ico: "seed", shape: "circle", effects: [], color: C["Green Thumb"], how: ["Photo of the vegetable growing", "Photo of your harvest"] },
  { id: "g-gt-tree", nm: "Tree Hugger", cat: "Green Thumb", stars: 2, pts: 25, ico: "leaf", shape: "leaf", effects: ["petals"], color: C["Green Thumb"], how: ["Photo of the tree planted in the ground"] },
  { id: "g-gt-bee", nm: "Bee Friendly", cat: "Green Thumb", stars: 2, pts: 20, ico: "seed", shape: "flower", effects: [], color: C["Green Thumb"], how: ["Photo of your planted flowers", "Photo of a pollinator visiting"] },
  { id: "g-gt-jungle", nm: "Jungle Room", cat: "Green Thumb", stars: 2, pts: 20, ico: "leaf", shape: "circle", effects: [], color: C["Green Thumb"], how: ["Photo of your 5 houseplants", "Photo of them alive a month later"] },
  { id: "g-gt-gift", nm: "Awh, For Me?!", cat: "Green Thumb", stars: 2, pts: 25, ico: "seed", shape: "heart", effects: ["pulse"], color: C["Green Thumb"], how: ["Photo of the flower you grew", "Video of you giving it to someone"] },
  { id: "g-gt-farm", nm: "Farm to Table", cat: "Green Thumb", stars: 3, pts: 35, ico: "pot", shape: "hex", effects: [], color: C["Green Thumb"], how: ["Photo of your home-grown ingredients", "Photo of the finished dish"] },
  { id: "g-gt-seed", nm: "Seed Saver", cat: "Green Thumb", stars: 2, pts: 20, ico: "seed", shape: "circle", effects: [], color: C["Green Thumb"], how: ["Photo of seeds you harvested and dried for next year"] },
  { id: "g-gt-mush", nm: "Fungi Among Us", cat: "Green Thumb", stars: 3, pts: 35, ico: "leaf", shape: "hex", effects: [], color: C["Green Thumb"], how: ["Photo of your mushroom grow kit set up", "Photo of the first flush"] },
  { id: "g-gt-plot", nm: "Plot Twist", cat: "Green Thumb", stars: 3, pts: 40, ico: "seed", shape: "shield", effects: [], color: C["Green Thumb"], how: ["Photo of an empty bed", "Photo of it planted and growing weeks later"] },
  { id: "g-gt-orchard", nm: "Orchardist", cat: "Green Thumb", stars: 4, pts: 55, ico: "leaf", shape: "rosette", effects: ["petals"], color: C["Green Thumb"], how: ["Photo planting a fruit tree", "Photo of its first fruit or a season of growth"] },

  // ===== Hooligan (15) =====
  { id: "g-hl-firework", nm: "Baby You're a Firework", cat: "Hooligan", stars: 2, pts: 20, ico: "gear", shape: "circle", effects: ["sparkle"], color: C.Hooligan, proofMedia: "video", how: ["Video of you lighting fireworks safely"] },
  { id: "g-hl-cart", nm: "Cart Surfer", cat: "Hooligan", stars: 2, pts: 25, ico: "car", shape: "gem", effects: [], color: C.Hooligan, proofMedia: "video", how: ["Video riding a shopping cart across the lot"] },
  { id: "g-hl-bet", nm: "Rolling Deep", cat: "Hooligan", stars: 2, pts: 30, ico: "target", shape: "gem", effects: [], color: C.Hooligan, how: ["Photo of a $100 bet placed", "Photo of the result"] },
  { id: "g-hl-skrrt", nm: "Skrrrrt!", cat: "Hooligan", stars: 3, pts: 25, ico: "star", shape: "pentagon", effects: [], color: C.Hooligan, how: ["Photo in a sports car you test drove"] },
  { id: "g-hl-blink", nm: "Blink and You'll Miss It", cat: "Hooligan", stars: 3, pts: 40, ico: "bolt", shape: "leaf", effects: ["shimmer"], color: C.Hooligan, proofMedia: "video", how: ["Video of two blinkers back to back"] },
  { id: "g-hl-chip", nm: "It's Just One Chip", cat: "Hooligan", stars: 3, pts: 40, ico: "flame", shape: "circle", effects: ["fire"], color: C.Hooligan, proofMedia: "video", how: ["Video of you swallowing the Paqui One Chip"] },
  { id: "g-hl-milk", nm: "He Needs Some Milk", cat: "Hooligan", stars: 3, pts: 35, ico: "water", shape: "octagon", effects: ["bubbles"], color: C.Hooligan, proofMedia: "video", how: ["Video chugging a gallon of milk in 5 minutes"] },
  { id: "g-hl-midnight", nm: "Midnight Run", cat: "Hooligan", stars: 3, pts: 30, ico: "boot", shape: "pentagon", effects: [], color: C.Hooligan, proofMedia: "video", how: ["Video sprinting through a fountain at night"] },
  { id: "g-hl-prank", nm: "Gotcha", cat: "Hooligan", stars: 2, pts: 20, ico: "mask", shape: "circle", effects: [], color: C.Hooligan, proofMedia: "video", how: ["Video of a harmless prank landing"] },
  { id: "g-hl-spicy", nm: "Scoville Survivor", cat: "Hooligan", stars: 3, pts: 35, ico: "flame", shape: "hex", effects: ["fire"], color: C.Hooligan, proofMedia: "video", how: ["Video eating a ghost-pepper wing", "Photo of the aftermath"] },
  { id: "g-hl-zip", nm: "Send the Line", cat: "Hooligan", stars: 3, pts: 30, ico: "bolt", shape: "circle", effects: [], color: C.Hooligan, proofMedia: "video", how: ["Video riding a zipline"] },
  { id: "g-hl-night", nm: "All-Nighter", cat: "Hooligan", stars: 3, pts: 30, ico: "moon", shape: "circle", effects: [], color: C.Hooligan, how: ["Photo at midnight", "Photo at sunrise, still awake"] },
  { id: "g-hl-karaoke", nm: "Tone Deaf", cat: "Hooligan", stars: 2, pts: 20, ico: "music", shape: "circle", effects: [], color: C.Hooligan, proofMedia: "video", how: ["Video belting a karaoke song in public"] },
  { id: "g-hl-cold", nm: "Streak the Cold", cat: "Hooligan", stars: 4, pts: 45, ico: "water", shape: "hex", effects: ["frost", "pulse"], color: C.Hooligan, proofMedia: "video", how: ["Video of a freezing outdoor plunge"] },
  { id: "g-hl-stunt", nm: "Hold My Drink", cat: "Hooligan", stars: 4, pts: 50, ico: "skull", shape: "rosette", effects: ["shake", "smoke"], color: C.Hooligan, proofMedia: "video", how: ["Video of a safe-but-wild stunt", "Photo of you in one piece after"] },

  // ===== Samaritan (11) =====
  { id: "g-sm-cooked", nm: "Cooked", cat: "Samaritan", stars: 1, pts: 10, ico: "bowl", shape: "circle", effects: [], color: C.Samaritan, how: ["Photo of the home-cooked meal", "Photo sharing it with a friend"] },
  { id: "g-sm-baked", nm: "Baked", cat: "Samaritan", stars: 1, pts: 10, ico: "pot", shape: "circle", effects: [], color: C.Samaritan, how: ["Photo of your baked goods", "Photo delivering them to others"] },
  { id: "g-sm-feed", nm: "Oh the Humanity", cat: "Samaritan", stars: 1, pts: 15, ico: "hands", shape: "heart", effects: [], color: C.Samaritan, how: ["Photo handing a bought meal to someone in need"] },
  { id: "g-sm-help", nm: "Need a Hand?", cat: "Samaritan", stars: 1, pts: 15, ico: "teach", shape: "heart", effects: [], color: C.Samaritan, how: ["Photo helping someone across the street or with a load"] },
  { id: "g-sm-passiton", nm: "Pass It On", cat: "Samaritan", stars: 2, pts: 20, ico: "bowl", shape: "circle", effects: [], color: C.Samaritan, how: ["Photo/receipt of paying for the person behind you"] },
  { id: "g-sm-dress", nm: "Dress to Impress", cat: "Samaritan", stars: 2, pts: 25, ico: "teach", shape: "diamond", effects: [], color: C.Samaritan, how: ["Photo of the outfit a stranger picked for you"] },
  { id: "g-sm-anthem", nm: "Uy! Pilipinas!", cat: "Samaritan", stars: 3, pts: 25, ico: "gear", shape: "star", effects: [], color: C.Samaritan, proofMedia: "video", how: ["Video singing a national anthem in full"] },
  { id: "g-sm-beast", nm: "Mr. Beast", cat: "Samaritan", stars: 3, pts: 30, ico: "teach", shape: "hex", effects: [], color: C.Samaritan, how: ["Photo/receipt of paying for a stranger's groceries"] },
  { id: "g-sm-volunteer", nm: "Time Given", cat: "Samaritan", stars: 3, pts: 30, ico: "hands", shape: "hex", effects: [], color: C.Samaritan, how: ["Photo volunteering a shift", "Photo of the sign-out sheet/badge"] },
  { id: "g-sm-blood", nm: "Lifeblood", cat: "Samaritan", stars: 3, pts: 40, ico: "drop", shape: "shield", effects: [], color: C.Samaritan, how: ["Photo in the donation chair", "Photo of your donor bandage/wristband"] },
  { id: "g-sm-fund", nm: "For a Cause", cat: "Samaritan", stars: 4, pts: 55, ico: "heart", shape: "rosette", effects: ["pulse"], color: C.Samaritan, how: ["Photo launching a fundraiser", "Screenshot of the total you raised"] },

  // ===== Courage (12) =====
  { id: "g-co-openmic", nm: "Open Mic", cat: "Courage", stars: 3, pts: 30, ico: "horn", shape: "circle", effects: [], color: C.Courage, proofMedia: "video", how: ["Video performing on stage in front of strangers"] },
  { id: "g-co-plunge", nm: "Polar Plunge", cat: "Courage", stars: 3, pts: 30, ico: "water", shape: "hex", effects: ["frost", "pulse"], color: C.Courage, proofMedia: "video", how: ["Video plunging into freezing water"] },
  { id: "g-co-shot", nm: "Shoot Your Shot", cat: "Courage", stars: 4, pts: 40, ico: "heart", shape: "heart", effects: ["pulse"], color: C.Courage, proofMedia: "video", how: ["Video of you asking a stranger on a date"] },
  { id: "g-co-doug", nm: "Doug Doug", cat: "Courage", stars: 4, pts: 30, ico: "pot", shape: "circle", effects: ["pulse"], color: C.Courage, how: ["Photo of each meal during the challenge"] },
  { id: "g-co-ghost", nm: "Ghostbusters", cat: "Courage", stars: 3, pts: 30, ico: "teach", shape: "circle", effects: ["pulse"], color: C.Courage, proofMedia: "video", how: ["Video at a haunted spot after sundown"] },
  { id: "g-co-pride", nm: "Happy Pride!", cat: "Courage", stars: 4, pts: 50, ico: "teach", shape: "circle", effects: ["rainbow"], color: C.Courage, proofMedia: "video", how: ["Video of the moment (with consent)"] },
  { id: "g-co-cannon", nm: "Cannonball!", cat: "Courage", stars: 4, pts: 35, ico: "wave", shape: "hex", effects: ["water", "pulse"], color: C.Courage, proofMedia: "video", how: ["Video of a 20+ ft cliff dive"] },
  { id: "g-co-speak", nm: "Stand & Speak", cat: "Courage", stars: 3, pts: 40, ico: "horn", shape: "hex", effects: [], color: C.Courage, proofMedia: "video", how: ["Video speaking to a real audience"] },
  { id: "g-co-solo", nm: "Table for One", cat: "Courage", stars: 2, pts: 20, ico: "bowl", shape: "circle", effects: [], color: C.Courage, how: ["Photo dining alone at a sit-down restaurant"] },
  { id: "g-co-mend", nm: "Mend the Rift", cat: "Courage", stars: 3, pts: 35, ico: "hands", shape: "circle", effects: [], color: C.Courage, how: ["Screenshot/photo showing you reached out and made peace"] },
  { id: "g-co-skydive", nm: "Jumpman", cat: "Courage", stars: 5, pts: 200, ico: "crown", shape: "rosette", effects: ["emberring", "aura", "smoke", "shake"], effectColors: { emberring: "#b51a00" }, color: C.Courage, how: ["Photo of yourself in freefall", "Photo after you land"] },
  { id: "g-co-bungee", nm: "The Big Leap", cat: "Courage", stars: 5, pts: 200, ico: "rocket", shape: "rosette", effects: ["aura", "shake", "orbit"], effectColors: { orbit: "#e0613a" }, color: C.Courage, proofMedia: "video", how: ["Video of your bungee jump"] },

  // ===== Urbanist (14) =====
  { id: "g-ur-rooftop", nm: "Rooftop Riser", cat: "Urbanist", stars: 3, pts: 30, ico: "camera", shape: "circle", effects: [], color: C.Urbanist, how: ["Photo of the skyline from a rooftop at sunset"] },
  { id: "g-ur-transit", nm: "Transit Master", cat: "Urbanist", stars: 2, pts: 20, ico: "car", shape: "circle", effects: [], color: C.Urbanist, how: ["Photo at your start stop", "Photo across the city with your ticket"] },
  { id: "g-ur-eats", nm: "Street Eats", cat: "Urbanist", stars: 1, pts: 15, ico: "bowl", shape: "circle", effects: [], color: C.Urbanist, how: ["Photo of a street-food cart and what you ordered"] },
  { id: "g-ur-drift", nm: "Tokyo Drift", cat: "Urbanist", stars: 3, pts: 50, ico: "flame", shape: "diamond", effects: [], color: C.Urbanist, proofMedia: "video", how: ["Video of a car drifting (you driving or riding)"] },
  { id: "g-ur-monkey", nm: "Urban Monkey", cat: "Urbanist", stars: 2, pts: 20, ico: "axe", shape: "circle", effects: [], color: C.Urbanist, how: ["Selfie from the top of a building you climbed to"] },
  { id: "g-ur-fence", nm: "Fence Hopper", cat: "Urbanist", stars: 3, pts: 20, ico: "knife", shape: "circle", effects: [], color: C.Urbanist, proofMedia: "video", how: ["Video clearing a fence taller than you"] },
  { id: "g-ur-bush", nm: "Hide on Bush", cat: "Urbanist", stars: 3, pts: 30, ico: "tent", shape: "triangle", effects: [], color: C.Urbanist, how: ["Photo of your overnight city-bush camp"] },
  { id: "g-ur-tourist", nm: "Local Tourist", cat: "Urbanist", stars: 2, pts: 25, ico: "camera", shape: "diamond", effects: [], color: C.Urbanist, how: ["Photo at a city sign 8+ hours from home", "Photo of a landmark you visited"] },
  { id: "g-ur-mural", nm: "Wall Crawler", cat: "Urbanist", stars: 2, pts: 20, ico: "brush", shape: "circle", effects: [], color: C.Urbanist, how: ["Photo of you in front of a city mural"] },
  { id: "g-ur-night", nm: "City That Never Sleeps", cat: "Urbanist", stars: 2, pts: 25, ico: "moon", shape: "circle", effects: [], color: C.Urbanist, how: ["Photo of the city lights at 3am"] },
  { id: "g-ur-market", nm: "Market Day", cat: "Urbanist", stars: 1, pts: 15, ico: "bag", shape: "circle", effects: [], color: C.Urbanist, how: ["Photo of your haul from a local market"] },
  { id: "g-ur-busk", nm: "Spare Change", cat: "Urbanist", stars: 3, pts: 35, ico: "music", shape: "hex", effects: [], color: C.Urbanist, proofMedia: "video", how: ["Video busking in public", "Photo of the tips you earned"] },
  { id: "g-ur-parkour", nm: "Concrete Jungle", cat: "Urbanist", stars: 4, pts: 45, ico: "boot", shape: "rosette", effects: ["pulse"], color: C.Urbanist, proofMedia: "video", how: ["Video of a clean parkour line through the city"] },
  { id: "g-ur-allcity", nm: "Coast to Coast", cat: "Urbanist", stars: 4, pts: 50, ico: "globe", shape: "shield", effects: [], color: C.Urbanist, how: ["Photo at the southmost point of the city", "Photo at the northmost point"] },

  // ===== Athlete (12) =====
  { id: "g-at-10k", nm: "10-Thousand", cat: "Athlete", stars: 3, pts: 20, ico: "trophy", shape: "circle", effects: [], color: C.Athlete, how: ["Photo at the start line", "Screenshot of your finished 10K"] },
  { id: "g-at-half", nm: "What's 9+10?", cat: "Athlete", stars: 4, pts: 60, ico: "trophy", shape: "hex", effects: ["sparkle", "pulse"], color: C.Athlete, how: ["Screenshot of your half-marathon result"] },
  { id: "g-at-marathon", nm: "Not a Race", cat: "Athlete", stars: 5, pts: 200, ico: "trophy", shape: "rosette", effects: ["pulse", "sparkle", "orbit", "glitch"], effectColors: { orbit: "#0061ff" }, color: C.Athlete, how: ["Photo at the start", "Screenshot of your marathon finish"] },
  { id: "g-at-flip", nm: "Flip!", cat: "Athlete", stars: 3, pts: 25, ico: "dumbbell", shape: "circle", effects: [], color: C.Athlete, proofMedia: "video", how: ["Video landing a backflip"] },
  { id: "g-at-tree", nm: "Monkey See", cat: "Athlete", stars: 2, pts: 15, ico: "seed", shape: "circle", effects: [], color: C.Athlete, how: ["Selfie 10+ ft up a tree you climbed"] },
  { id: "g-at-v5", nm: "Holdin Rocks", cat: "Athlete", stars: 3, pts: 30, ico: "dumbbell", shape: "hex", effects: [], color: C.Athlete, proofMedia: "video", how: ["Video of you topping a V5 climb"] },
  { id: "g-at-v3", nm: "Climber", cat: "Athlete", stars: 3, pts: 15, ico: "dumbbell", shape: "circle", effects: [], color: C.Athlete, proofMedia: "video", how: ["Video of you topping a V3 climb"] },
  { id: "g-at-kickflip", nm: "Do a Kickflip!", cat: "Athlete", stars: 3, pts: 30, ico: "knife", shape: "diamond", effects: [], color: C.Athlete, proofMedia: "video", how: ["Video landing a kickflip"] },
  { id: "g-at-handstand", nm: "Upside Down", cat: "Athlete", stars: 3, pts: 25, ico: "dumbbell", shape: "arrow", effects: [], color: C.Athlete, proofMedia: "video", how: ["Video holding a handstand 10 seconds"] },
  { id: "g-at-3x3", nm: "3x3", cat: "Athlete", stars: 3, pts: 50, ico: "globe", shape: "shield", effects: [], color: C.Athlete, how: ["Photo/video winning a 3v3 vs strangers", "Selfie with them after"] },
  { id: "g-at-5v5", nm: "Knicks in 5!", cat: "Athlete", stars: 3, pts: 30, ico: "globe", shape: "rosette", effects: ["pulse", "sparkle"], color: C.Athlete, how: ["Photo/video winning a 5v5 vs strangers", "Selfie with them after"] },
  { id: "g-at-tour", nm: "Tour de Ville", cat: "Athlete", stars: 3, pts: 50, ico: "gear", shape: "circle", effects: ["spin"], color: C.Athlete, how: ["Screenshot of a cross-city bike ride on Strava"] },

  // ===== Scholar (15) =====
  { id: "g-sc-book", nm: "Bookworm", cat: "Scholar", stars: 2, pts: 20, ico: "book", shape: "circle", effects: [], color: C.Scholar, how: ["Photo of the book cover", "Photo of the final page within a week"] },
  { id: "g-sc-poly", nm: "Polyglot", cat: "Scholar", stars: 3, pts: 40, ico: "globe", shape: "circle", effects: [], color: C.Scholar, proofMedia: "video", how: ["Video holding a 5-minute chat in a new language"] },
  { id: "g-sc-chess", nm: "Chess Master", cat: "Scholar", stars: 3, pts: 30, ico: "crown", shape: "hex", effects: [], color: C.Scholar, how: ["Screenshot of a win vs a 1500+ opponent"] },
  { id: "g-sc-cube", nm: "Cube Solver", cat: "Scholar", stars: 3, pts: 30, ico: "bulb", shape: "square", effects: [], color: C.Scholar, proofMedia: "video", how: ["Video of a sub-2-minute cube solve"] },
  { id: "g-sc-sat", nm: "College-Ready", cat: "Scholar", stars: 3, pts: 50, ico: "book", shape: "circle", effects: [], color: C.Scholar, how: ["Photo of a practice SAT scored 1300+ (or 590+ section)"] },
  { id: "g-sc-music", nm: "Musician", cat: "Scholar", stars: 2, pts: 20, ico: "music", shape: "pentagon", effects: [], color: C.Scholar, proofMedia: "video", how: ["Video playing a full song on an instrument"] },
  { id: "g-sc-cert", nm: "Certified", cat: "Scholar", stars: 3, pts: 50, ico: "board", shape: "square", effects: [], color: C.Scholar, proofMedia: "photo", how: ["Selfie with your earned certificate"] },
  { id: "g-sc-trivia", nm: "Trivia Crack", cat: "Scholar", stars: 3, pts: 30, ico: "crown", shape: "hex", effects: [], color: C.Scholar, how: ["Photo of your trivia-night winnings"] },
  { id: "g-sc-essay", nm: "Published", cat: "Scholar", stars: 4, pts: 55, ico: "feather", shape: "shield", effects: [], color: C.Scholar, how: ["Screenshot/photo of your published writing"] },
  { id: "g-sc-code", nm: "Hello World", cat: "Scholar", stars: 3, pts: 35, ico: "board", shape: "hex", effects: [], color: C.Scholar, how: ["Screenshot of a working app/program you built"] },
  { id: "g-sc-debate", nm: "Point Taken", cat: "Scholar", stars: 3, pts: 35, ico: "horn", shape: "circle", effects: [], color: C.Scholar, proofMedia: "video", how: ["Video of you winning or holding a formal debate"] },
  { id: "g-sc-doc", nm: "Deep Dive", cat: "Scholar", stars: 1, pts: 10, ico: "book", shape: "circle", effects: [], color: C.Scholar, how: ["Photo of notes from a documentary or lecture you finished"] },
  { id: "g-sc-streak", nm: "Streak Keeper", cat: "Scholar", stars: 2, pts: 20, ico: "globe", shape: "circle", effects: [], color: C.Scholar, how: ["Screenshot of a 30-day language-learning streak"] },
  { id: "g-sc-paint", nm: "Fine Art", cat: "Scholar", stars: 2, pts: 25, ico: "brush", shape: "diamond", effects: [], color: C.Scholar, how: ["Photo of a finished painting or drawing you made"] },
  { id: "g-sc-memory", nm: "Memory Palace", cat: "Scholar", stars: 4, pts: 55, ico: "bulb", shape: "rosette", effects: ["shimmer"], color: C.Scholar, proofMedia: "video", how: ["Video reciting a long passage or speech from memory"] },

  // ===== Gamer (15) =====
  { id: "g-gm-league", nm: "Legend of League", cat: "Gamer", stars: 3, pts: 40, ico: "star", shape: "shield", effects: [], color: C.Gamer, how: ["Screenshot of 5 ranked wins in a row"] },
  { id: "g-gm-faker", nm: "Faker?", cat: "Gamer", stars: 4, pts: 60, ico: "trophy", shape: "hex", effects: ["aura"], color: C.Gamer, how: ["Screenshot of 10 ranked wins in a row"] },
  { id: "g-gm-god", nm: "God Gamer", cat: "Gamer", stars: 4, pts: 100, ico: "controller", shape: "rosette", effects: ["orbit", "smoke", "glitch"], effectColors: { orbit: "#9929bd" }, color: C.Gamer, how: ["Recording of you finishing the God Gamer Gauntlet"] },
  { id: "g-gm-speed", nm: "Speedrunner", cat: "Gamer", stars: 3, pts: 40, ico: "controller", shape: "shield", effects: ["shimmer"], color: C.Gamer, how: ["Recording of a speedrun under the target time"] },
  { id: "g-gm-pixel", nm: "Pixel Perfect", cat: "Gamer", stars: 2, pts: 25, ico: "controller", shape: "circle", effects: [], color: C.Gamer, how: ["Screenshot of a new personal best score"] },
  { id: "g-gm-retro", nm: "Retro Revival", cat: "Gamer", stars: 2, pts: 20, ico: "dice", shape: "circle", effects: [], color: C.Gamer, how: ["Photo of the end credits of a game older than you"] },
  { id: "g-gm-nohit", nm: "No-Hit Run", cat: "Gamer", stars: 4, pts: 60, ico: "shield", shape: "hex", effects: ["aura"], color: C.Gamer, how: ["Recording of a boss beaten with no damage taken"] },
  { id: "g-gm-tourney", nm: "Tournament Arc", cat: "Gamer", stars: 4, pts: 80, ico: "trophy", shape: "rosette", effects: ["orbit", "sparkle"], effectColors: { orbit: "#9929bd" }, color: C.Gamer, how: ["Photo of the bracket showing your top-3 finish"] },
  { id: "g-gm-100", nm: "100%", cat: "Gamer", stars: 3, pts: 45, ico: "star", shape: "hex", effects: [], color: C.Gamer, how: ["Screenshot of a 100% completion screen"] },
  { id: "g-gm-flawless", nm: "Flawless Victory", cat: "Gamer", stars: 2, pts: 25, ico: "controller", shape: "circle", effects: [], color: C.Gamer, how: ["Screenshot of a perfect/flawless round"] },
  { id: "g-gm-clutch", nm: "1vX Clutch", cat: "Gamer", stars: 3, pts: 35, ico: "target", shape: "diamond", effects: [], color: C.Gamer, proofMedia: "video", how: ["Clip of a 1vX clutch round you won"] },
  { id: "g-gm-marathon", nm: "Marathon Session", cat: "Gamer", stars: 2, pts: 20, ico: "clock", shape: "circle", effects: [], color: C.Gamer, how: ["Screenshot of an 8+ hour session or playtime"] },
  { id: "g-gm-build", nm: "Master Builder", cat: "Gamer", stars: 3, pts: 35, ico: "board", shape: "square", effects: [], color: C.Gamer, how: ["Screenshots of a huge build you made in-game"] },
  { id: "g-gm-rank", nm: "Top of the Ladder", cat: "Gamer", stars: 4, pts: 70, ico: "crown", shape: "shield", effects: ["aura"], color: C.Gamer, how: ["Screenshot of hitting a top rank/tier"] },
  { id: "g-gm-grass", nm: "Touch Grass", cat: "Gamer", stars: 1, pts: 10, ico: "leaf", shape: "circle", effects: [], color: C.Gamer, how: ["Photo of you outside, away from the screen"] },
];

export const GENERATED: Challenge[] = RAW.map((g) => ({
  ...g,
  df: dfFor(g.stars),
  an: "rays",
  proofMedia: g.proofMedia ?? "either",
  blurb: g.blurb ?? "",
  effectColors: g.effectColors ?? {},
  generated: true,
}));
